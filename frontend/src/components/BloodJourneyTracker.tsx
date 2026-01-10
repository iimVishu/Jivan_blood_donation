import React from 'react';
import { Check, Beaker, Activity, Truck, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface BloodJourneyTrackerProps {
  status: 'collected' | 'testing' | 'processing' | 'ready' | 'transfused';
}

const steps = [
  { id: 'collected', label: 'Collected', icon: Check },
  { id: 'testing', label: 'In Lab', icon: Beaker },
  { id: 'processing', label: 'Processing', icon: Activity },
  { id: 'ready', label: 'Ready', icon: Truck },
  { id: 'transfused', label: 'Transfused', icon: Heart },
];

const BloodJourneyTracker: React.FC<BloodJourneyTrackerProps> = ({ status }) => {
  const currentStepIndex = steps.findIndex((step) => step.id === status);

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between w-full">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
        <motion.div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-red-600 -z-10"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.5 }}
        ></motion.div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <motion.div 
              key={step.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center bg-white px-2 z-10"
            >
              <motion.div 
                initial={false}
                animate={{
                  backgroundColor: isCompleted ? '#DC2626' : '#FFFFFF',
                  borderColor: isCompleted ? '#DC2626' : '#D1D5DB',
                  scale: isCurrent ? 1.2 : 1,
                  color: isCompleted ? '#FFFFFF' : '#9CA3AF'
                }}
                transition={{ duration: 0.3, delay: 1 + (index * 0.1) }} // Delay color change until after line fills
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isCurrent ? 'ring-4 ring-red-100' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <motion.span 
                animate={{ color: isCompleted ? '#B91C1C' : '#6B7280' }}
                transition={{ delay: 1 + (index * 0.1) }}
                className="mt-2 text-xs font-medium"
              >
                {step.label}
              </motion.span>
            </motion.div>
          );
        })}
      </div>
      
      {status === 'transfused' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-red-50 border border-red-100 rounded-lg p-4 text-center"
        >
          <div className="text-red-800 font-medium flex items-center justify-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Heart className="w-5 h-5 fill-red-600 text-red-600" />
            </motion.div>
            Your donation has been used to save a life!
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BloodJourneyTracker;
