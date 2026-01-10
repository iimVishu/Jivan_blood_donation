import React, { forwardRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface CertificateProps {
  donorName: string;
  date: string;
}

const Certificate = forwardRef<HTMLDivElement, CertificateProps>(({ donorName, date }, ref) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Create a verification URL (mock for now)
        const verificationData = `VERIFIED DONATION\nDonor: ${donorName}\nDate: ${date}\nOrganization: Jeevan Blood Donation\nID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const url = await QRCode.toDataURL(verificationData, {
          width: 100,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error(err);
      }
    };

    if (donorName && date) {
      generateQR();
    }
  }, [donorName, date]);

  return (
    <div
      ref={ref}
      className="w-[800px] h-[600px] p-10 relative text-center border-[20px] border-double"
      style={{ 
        fontFamily: 'serif',
        backgroundColor: '#ffffff',
        borderColor: '#991b1b', // red-800
        color: '#000000'
      }}
    >
      <div 
        className="absolute top-0 left-0 w-full h-full border-[2px] m-4 pointer-events-none"
        style={{ borderColor: '#eab308' }} // yellow-500
      ></div>
      
      {/* QR Code Positioned Absolute Bottom Right */}
      {qrCodeUrl && (
        <div className="absolute bottom-8 right-8 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={qrCodeUrl} 
            alt="Verification QR Code" 
            className="border"
            style={{ borderColor: '#e5e7eb' }} // gray-200
          />
          <span 
            className="text-[10px] mt-1"
            style={{ color: '#6b7280' }} // gray-500
          >
            Scan to Verify
          </span>
        </div>
      )}
      
      <div 
        className="h-full flex flex-col items-center justify-center border-4 p-8"
        style={{ borderColor: '#fee2e2' }} // red-100
      >
        <div className="mb-8">
          <h1 
            className="text-5xl font-bold uppercase tracking-widest mb-2"
            style={{ color: '#b91c1c' }} // red-700
          >
            Certificate
          </h1>
          <h2 
            className="text-3xl font-semibold uppercase tracking-wider"
            style={{ color: '#374151' }} // gray-700
          >
            of Appreciation
          </h2>
        </div>

        <p 
          className="text-xl italic mb-6"
          style={{ color: '#4b5563' }} // gray-600
        >
          This certificate is proudly presented to
        </p>

        <div 
          className="border-b-2 px-12 py-2 mb-6"
          style={{ borderColor: '#9ca3af' }} // gray-400
        >
          <h3 
            className="text-4xl font-bold font-serif italic"
            style={{ color: '#111827' }} // gray-900
          >
            {donorName}
          </h3>
        </div>

        <p 
          className="text-lg mb-8 max-w-2xl"
          style={{ color: '#4b5563' }} // gray-600
        >
          In recognition of your selfless act of donating blood. Your contribution helps save lives and brings hope to those in need. We deeply appreciate your generosity and commitment to humanity.
        </p>

        <div className="flex justify-between w-full px-16 mt-12">
          <div className="text-center">
            <div 
              className="border-t w-48 pt-2"
              style={{ borderColor: '#9ca3af' }} // gray-400
            >
              <p 
                className="text-lg font-semibold"
                style={{ color: '#1f2937' }} // gray-800
              >
                {date}
              </p>
              <p 
                className="text-sm uppercase tracking-wide"
                style={{ color: '#6b7280' }} // gray-500
              >
                Date
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div 
              className="w-24 h-24 mx-auto mb-2 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#fee2e2' }} // red-100
            >
               <span className="text-4xl">🩸</span>
            </div>
            <p 
              className="text-sm font-bold"
              style={{ color: '#991b1b' }} // red-800
            >
              JEEVAN
            </p>
          </div>

          <div className="text-center">
            <div 
              className="border-t w-48 pt-2"
              style={{ borderColor: '#9ca3af' }} // gray-400
            >
              <p 
                className="text-lg font-semibold font-serif italic"
                style={{ color: '#1f2937' }} // gray-800
              >
                Jeevan Team
              </p>
              <p 
                className="text-sm uppercase tracking-wide"
                style={{ color: '#6b7280' }} // gray-500
              >
                Authorized Signature
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Certificate.displayName = 'Certificate';

export default Certificate;
