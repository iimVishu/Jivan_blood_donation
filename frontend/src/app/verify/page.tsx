import dbConnect from '@/lib/db';
import Request from '@/models/Request';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

async function VerifyCertificate({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;

  if (!id) {
    return <InvalidCertificate message="Invalid verification link. No Certificate ID provided." />;
  }

  try {
    await dbConnect();
    const bloodRequest = await Request.findById(id);

    if (!bloodRequest) {
      return <InvalidCertificate message="Certificate not found. This QR code may be invalid." />;
    }

    if (bloodRequest.status !== 'fulfilled') {
      return <InvalidCertificate message="This request has not been officially fulfilled yet." />;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verified Certificate</h1>
          <p className="text-gray-600 mb-8">
            This QR code belongs to an authentic, verified blood donation certificate issued by Jeevan Platform.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-4">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Donation For</p>
              <p className="text-gray-900 font-medium">{bloodRequest.patientName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Blood Group</p>
              <p className="text-red-600 font-bold">{bloodRequest.bloodGroup}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Units Donated</p>
              <p className="text-gray-900 font-medium">{bloodRequest.units} {bloodRequest.units === 1 ? 'Unit' : 'Units'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Request ID</p>
              <p className="text-gray-900 font-mono text-sm">{bloodRequest._id.toString()}</p>
            </div>
          </div>

          <Link 
            href="/"
            className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 w-full transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    return <InvalidCertificate message="Error verifying certificate. Please try again later." />;
  }
}

function InvalidCertificate({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
        <p className="text-gray-600 mb-8">{message}</p>

        <Link 
          href="/"
          className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage(props: any) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>}>
      <VerifyCertificate {...props} />
    </Suspense>
  )
}