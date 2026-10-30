import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import { ApiError, objectId } from "@/lib/api-validation";
import Appointment from "@/models/Appointment";
import AuditLog from "@/models/AuditLog";
import User from "@/models/User";
import BloodBank from "@/models/BloodBank";
import {
  sendAppointmentConfirmationEmail,
  sendAppointmentRejectionEmail,
  sendBloodDonationAppreciationEmail,
} from "@/lib/email";
import { sendDiscordAppointmentUpdate } from "@/lib/discord";

export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
] as const;

export const TRACKING_STATUSES = [
  "collected",
  "testing",
  "processing",
  "ready",
  "transfused",
] as const;

type AppointmentWorkflowInput = {
  id: string;
  status?: string;
  trackingStatus?: string;
  date?: string | Date;
  timeSlot?: string;
  healthStats?: Record<string, string>;
  performedBy: string;
  performedByRole: string;
  ipAddress?: string;
  userAgent?: string;
  notifyDiscord?: boolean;
};

export async function updateAppointmentWorkflow({
  id,
  status,
  trackingStatus,
  date,
  timeSlot,
  healthStats,
  performedBy,
  performedByRole,
  ipAddress = "unknown",
  userAgent = "unknown",
  notifyDiscord = true,
}: AppointmentWorkflowInput) {
  objectId(id);
  objectId(performedBy);
  if (status !== undefined && !APPOINTMENT_STATUSES.includes(status as (typeof APPOINTMENT_STATUSES)[number])) {
    throw new ApiError("Invalid appointment status");
  }
  if (trackingStatus !== undefined && !TRACKING_STATUSES.includes(trackingStatus as (typeof TRACKING_STATUSES)[number])) {
    throw new ApiError("Invalid tracking status");
  }

  if (date !== undefined && !Number.isFinite(new Date(date).getTime())) throw new ApiError("Invalid appointment date");
  if (timeSlot !== undefined && (typeof timeSlot !== 'string' || !timeSlot.trim())) throw new ApiError("Invalid appointment time");
  await dbConnect();
  const appointment = await Appointment.findById(id);
  if (!appointment) throw new ApiError('Appointment not found', 404);
  if (performedByRole === 'admin') {
    const actor = await User.findById(performedBy).select('role');
    if (actor?.role !== 'admin') throw new ApiError('Forbidden', 403);
  }
  if (appointment.status === 'completed' && (status && status !== 'completed' || date || timeSlot)) {
    throw new ApiError('Completed donations cannot be reopened or rescheduled', 409);
  }
  if (['cancelled', 'rejected'].includes(appointment.status) && (status && status !== appointment.status || date || timeSlot)) {
    throw new ApiError('Closed appointments cannot be reopened or rescheduled', 409);
  }
  if (status === 'completed' && !['confirmed', 'completed'].includes(appointment.status)) {
    throw new ApiError('Confirm the appointment before completing the donation', 409);
  }

  const previousState = {
    status: appointment.status,
    trackingStatus: appointment.trackingStatus,
  };

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (trackingStatus) updateData.trackingStatus = trackingStatus;
  if (healthStats) updateData.healthStats = healthStats;
  if (date) updateData.date = new Date(date);
  if (timeSlot) updateData.timeSlot = timeSlot;

  let updatedAppointment;
  if (status === 'completed' && appointment.status !== 'completed') {
    // Keep the appointment, inventory and donor totals consistent, including concurrent retries.
    const transaction = await mongoose.startSession();
    try {
      await transaction.withTransaction(async () => {
        const claimed = await Appointment.findOneAndUpdate(
          { _id: id, status: 'confirmed' },
          { $set: updateData },
          { new: true, runValidators: true, session: transaction },
        );
        if (!claimed) return;
        const donor = await User.findById(claimed.donor).session(transaction);
        if (!donor?.bloodGroup) throw new ApiError('Donor blood group is required to complete a donation');
        const bank = await BloodBank.findByIdAndUpdate(claimed.bloodBank, {
          $inc: { [`stock.${donor.bloodGroup}`]: 1 },
        }, { session: transaction });
        if (!bank) throw new ApiError('Blood bank not found', 404);
        await User.findByIdAndUpdate(claimed.donor, {
          $set: { lastDonationDate: claimed.date },
          $inc: { donationCount: 1, points: 50 },
        }, { session: transaction });
      });
    } finally {
      await transaction.endSession();
    }
    updatedAppointment = await Appointment.findById(id);
    if (updatedAppointment?.status !== 'completed') throw new ApiError('Appointment changed. Refresh and try again.', 409);
  } else {
    updatedAppointment = await Appointment.findOneAndUpdate(
      { _id: id, status: appointment.status },
      { $set: updateData },
      { new: true, runValidators: true },
    );
  }
  if (!updatedAppointment) throw new ApiError('Appointment changed. Refresh and try again.', 409);
  await updatedAppointment.populate([
    { path: 'donor', select: 'name email bloodGroup' },
    { path: 'bloodBank', select: 'name address location' },
  ]);

  const donor = updatedAppointment.donor;
  const bank = updatedAppointment.bloodBank;
  const donorName = donor?.name || "Unknown donor";
  const donorBloodGroup = donor?.bloodGroup || "Not provided";
  const bankName = bank?.name || "Blood Bank";

  if (notifyDiscord && (status || trackingStatus || date || timeSlot)) {
    const statusTitle = status === "confirmed"
      ? "Appointment approved"
      : status === "completed"
        ? "Donation completed"
        : status === "cancelled"
          ? "Appointment cancelled"
          : status === "rejected"
            ? "Appointment rejected"
            : "Appointment updated";

    await sendDiscordAppointmentUpdate({
      appointmentId: id,
      title: date || timeSlot ? "Appointment rescheduled" : trackingStatus && !status ? `Donation ${trackingStatus}` : statusTitle,
      description: date || timeSlot
        ? "The appointment date or time was changed by the admin team."
        : trackingStatus && !status
        ? `Donation tracking status changed to ${trackingStatus}.`
        : `Appointment status changed to ${status}.`,
      donorName,
      bloodGroup: donorBloodGroup,
      appointmentDate: updatedAppointment.date,
      appointmentTime: updatedAppointment.timeSlot,
      bloodBankName: bankName,
      status: status || updatedAppointment.status,
      trackingStatus: updatedAppointment.trackingStatus,
    });
  }

  await AuditLog.create({
    action: "STATUS_CHANGED",
    entityType: "Appointment",
    entityId: updatedAppointment._id,
    performedBy,
    performedByRole,
    previousState,
    newState: {
      status: updatedAppointment.status,
      trackingStatus: updatedAppointment.trackingStatus,
    },
    ipAddress,
    userAgent,
  });

  if (donor?.email && status) {
    try {
      if (status === "confirmed") {
        const address = `${bank?.address?.street || ""}, ${bank?.address?.city || ""}, ${bank?.address?.state || ""} ${bank?.address?.zip || ""}`;
        const mapLink = bank?.location?.coordinates
          ? `https://www.google.com/maps/search/?api=1&query=${bank.location.coordinates[1]},${bank.location.coordinates[0]}`
          : "#";
        await sendAppointmentConfirmationEmail(donor.email, donor.name, updatedAppointment.date, bankName, address, mapLink);
      } else if (status === "cancelled" || status === "rejected") {
        await sendAppointmentRejectionEmail(donor.email, donor.name, updatedAppointment.date, bankName);
      } else if (status === "completed") {
        const donorData = await User.findById(donor._id);
        await sendBloodDonationAppreciationEmail(
          donor.email,
          donor.name,
          donorData?.bloodGroup || "Unknown",
          bankName,
          updatedAppointment.date,
          donorData?.donationCount || 1,
        );
      }
    } catch (error) {
      console.error("Failed to send appointment email notification:", error);
    }
  }

  return updatedAppointment;
}
