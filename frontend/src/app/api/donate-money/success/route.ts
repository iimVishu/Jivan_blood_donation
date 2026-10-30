import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import MoneyDonation from '@/models/MoneyDonation';
import { sendDonationThankYouEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { orderId, paymentId, signature } = await req.json();
    if (typeof orderId !== 'string' || !/^order_[a-z\d]+$/i.test(orderId) || typeof paymentId !== 'string' || !/^pay_[a-z\d]+$/i.test(paymentId) || typeof signature !== 'string' || !/^[a-f\d]{64}$/i.test(signature)) {
      return NextResponse.json({ error: 'Invalid payment verification details' }, { status: 400 });
    }
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !secret) return NextResponse.json({ error: 'Payments are not configured' }, { status: 503 });
    await dbConnect();
    const donation = await MoneyDonation.findOne({ orderId });
    if (!donation) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    const expected = createHmac('sha256', secret).update(`${donation.orderId}|${paymentId}`).digest();
    if (!timingSafeEqual(expected, Buffer.from(signature, 'hex'))) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }
    const razorpay = new Razorpay({ key_id: keyId, key_secret: secret });
    const payment = await razorpay.payments.fetch(paymentId);
    if (payment.order_id !== donation.orderId || Number(payment.amount) !== donation.amount || payment.currency !== donation.currency || payment.status !== 'captured') {
      return NextResponse.json({ error: 'Payment is not captured or does not match this order' }, { status: 409 });
    }
    await MoneyDonation.updateOne({ orderId }, { $set: { status: 'paid', paymentId } });
    const claimed = await MoneyDonation.findOneAndUpdate({ orderId, receiptSent: false }, { $set: { receiptSent: true } });
    let emailSent = true;
    if (claimed) {
      try {
        await sendDonationThankYouEmail(donation.email, donation.amount / 100, paymentId);
      } catch (error) {
        emailSent = false;
        await MoneyDonation.updateOne({ orderId }, { $set: { receiptSent: false } });
        console.error('Payment verified; receipt email failed:', error);
      }
    }
    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json({ error: 'Could not verify payment' }, { status: error instanceof SyntaxError ? 400 : 500 });
  }
}
