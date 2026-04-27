import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Request from '@/models/Request';
import { sendCertificateEmail } from '@/lib/email';
import { jsPDF } from 'jspdf';

async function generatePDFBuffer(donorName: string, patientName: string, date: string): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Draw Borders
  doc.setLineWidth(10);
  doc.setDrawColor(153, 27, 27); // #991b1b
  doc.rect(30, 30, width - 60, height - 60);
  
  doc.setLineWidth(3);
  doc.setDrawColor(234, 179, 8); // #eab308
  doc.rect(45, 45, width - 90, height - 90);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(45);
  doc.setTextColor(185, 28, 28); // #b91c1c
  doc.text('CERTIFICATE', width / 2, 120, { align: 'center' });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(25);
  doc.setTextColor(55, 65, 81); // #374151
  doc.text('OF APPRECIATION', width / 2, 160, { align: 'center' });

  // Body text
  doc.setFontSize(18);
  doc.setTextColor(75, 85, 99); // #4b5563
  doc.text('This certificate is proudly presented to', width / 2, 230, { align: 'center' });

  // Donor Name
  doc.setFont("times", "italic");
  doc.setFontSize(40);
  doc.setTextColor(17, 24, 39); // #111827
  doc.text(donorName, width / 2, 280, { align: 'center' });

  doc.setLineWidth(1);
  doc.setDrawColor(156, 163, 175); // #9ca3af
  doc.line(width / 4, 305, (width / 4) * 3, 305);

  // Description paragraph
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(75, 85, 99);
  
  const text = `In recognition of your selfless act of donating blood for ${patientName}. Your contribution has directly helped save a life and brought hope in a time of critical need. We deeply appreciate your generosity, prompt response, and commitment to humanity.`;
  const splitText = doc.splitTextToSize(text, width - 200);
  doc.text(splitText, width / 2, 340, { align: 'center' });

  // Date Left Signature
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text(date, 150, 460, { align: 'center' });
  
  doc.line(75, 475, 225, 475);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text('DATE OF DONATION', 150, 490, { align: 'center' });

  // Center blood drop
  doc.setFontSize(40);
  doc.setTextColor(220, 38, 38);
  doc.text('O', width / 2, 450, { align: 'center' }); 

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(153, 27, 27);
  doc.text('JEEVAN', width / 2, 490, { align: 'center' });

  // Authorized Right Signature
  doc.setFont("times", "italic");
  doc.setFontSize(22);
  doc.setTextColor(31, 41, 55);
  doc.text('Jeevan Auth', width - 150, 460, { align: 'center' });
  
  doc.line(width - 225, 475, width - 75, 475);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text('AUTHORIZED SIGNATURE', width - 150, 490, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: requestId } = await params;
    const body = await req.json();
    const { donorName, donorEmail } = body;

    if (!donorName || !donorEmail) {
      return NextResponse.json(
        { error: 'Donor name and email are required to send the certificate' },
        { status: 400 }
      );
    }

    await dbConnect();

    const bloodRequest = await Request.findById(requestId);

    if (!bloodRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (
      bloodRequest.requester.toString() !== session.user.id &&
      session.user.role !== 'admin'
    ) {
      return NextResponse.json({ error: 'Unauthorized to fulfill this request' }, { status: 403 });
    }

    if (bloodRequest.status === 'fulfilled') {
      return NextResponse.json({ error: 'Request is already fulfilled' }, { status: 400 });
    }

    // Try to generate PDF and send email FIRST
    try {
      const date = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const pdfBuffer = await generatePDFBuffer(donorName, bloodRequest.patientName, date);
      await sendCertificateEmail(donorEmail, donorName, date, bloodRequest.patientName, pdfBuffer);

      // Now that email succeeded, update the database
      bloodRequest.status = 'fulfilled';
      await bloodRequest.save();

      return NextResponse.json({
        message: 'Request fulfilled and certificate sent successfully',
        request: bloodRequest,
      });
    } catch (emailError: any) {
      console.error("Failed to generate PDF or send email:", emailError);
      return NextResponse.json(
        { error: `Error during email/PDF generation: ${emailError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in fulfill route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fulfill request' },
      { status: 500 }
    );
  }
}
