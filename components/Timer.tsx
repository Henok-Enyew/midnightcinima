
import React from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  value: number;
  max: number;
}

const Timer: React.FC<TimerProps> = ({ value, max }) => {
  const radius = 34; // 75% of 45 for smaller timer
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / max) * circumference;
  const isLow = value <= 10;

  return (
    <div className={`relative flex items-center justify-center w-24 h-24 rounded-full ${isLow ? 'pulse-danger' : ''}`}>
      <svg className="w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          className="fill-none stroke-black/40 stroke-[6]"
        />
        {/* Progress circle */}
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          className={`fill-none stroke-[6] transition-all duration-1000 ${isLow ? 'stroke-red-500' : 'stroke-[#d4af37]'}`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            strokeLinecap: 'round',
          }}
        />
      </svg>
      <div className={`absolute text-2xl font-cinzel font-bold ${isLow ? 'text-red-500' : 'text-white'} tracking-tighter`}>
        {value}
      </div>
    </div>
  );
};

export default Timer;
