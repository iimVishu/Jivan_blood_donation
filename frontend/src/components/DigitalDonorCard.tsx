import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { User } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface DonorCardProps {
  user: {
    name: string;
    bloodGroup: string;
    id: string;
    donationCount: number;
  };
}

const DigitalDonorCard: React.FC<DonorCardProps> = ({ user }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    const generateQR = async () => {
      try {
        // The QR code content can be a JSON string or a verification URL
        const qrContent = JSON.stringify({
          id: user.id,
          name: user.name,
          bloodGroup: user.bloodGroup,
          type: 'Jeevan Donor'
        });
        const url = await QRCode.toDataURL(qrContent);
        setQrCodeUrl(url);
      } catch (err) {
        console.error(err);
      }
    };

    if (user) {
        generateQR();
    }
  }, [user]);

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto perspective-1000"
    >
      <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-2xl overflow-hidden text-white relative transition-shadow duration-300 hover:shadow-red-500/30">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="p-6 relative z-10 transform-style-3d">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Jeevan</h2>
              <p className="text-red-100 text-xs uppercase tracking-wider">Digital Donor ID</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm shadow-inner">
               <User className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="mb-4">
                <p className="text-red-200 text-xs uppercase">Donor Name</p>
                <p className="text-lg font-semibold truncate max-w-[180px]">{user.name}</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-red-200 text-xs uppercase">Blood Group</p>
                  <p className="text-2xl font-bold">{user.bloodGroup || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-red-200 text-xs uppercase">Donations</p>
                  <p className="text-2xl font-bold">{user.donationCount || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-2 rounded-lg shadow-lg transform transition-transform hover:scale-105">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Donor QR" className="w-24 h-24 object-contain" />
              ) : (
                <div className="w-24 h-24 bg-gray-200 animate-pulse rounded"></div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center">
            <p className="text-xs text-red-200 font-mono">ID: {user.id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-red-200">Valid Forever</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DigitalDonorCard;
