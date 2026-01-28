
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Group } from '../types';

interface EliminationOverlayProps {
  group: Group;
  onComplete: () => void;
  isRandomElimination?: boolean;
}

const EliminationOverlay: React.FC<EliminationOverlayProps> = ({ group, onComplete, isRandomElimination = false }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Background spot light effect */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1.2, 0.8] }}
        transition={{ duration: 5 }}
        className="absolute w-[800px] h-[800px] rounded-full bg-red-600/20 blur-[150px]"
      />

      {/* Cinematic Curtains */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: '-100%', transition: { duration: 0.5 } }} // Just to setup
        className="absolute inset-y-0 left-0 w-1/2 bg-[#0a0505] border-r border-[#d4af37]/20 z-10"
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: '100%', transition: { duration: 0.5 } }} // Just to setup
        className="absolute inset-y-0 right-0 w-1/2 bg-[#0a0505] border-l border-[#d4af37]/20 z-10"
      />

      <div className="text-center z-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <h2 className="text-gray-500 font-cinzel text-2xl tracking-[0.5em] mb-4 uppercase">Round Results</h2>
          <div className="h-1 w-24 bg-[#d4af37] mx-auto mb-12"></div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1.5 }}
          className="text-8xl font-playfair text-white mb-4 italic"
        >
          {group.name}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <div className="text-6xl font-cinzel text-red-600 tracking-widest uppercase mb-8">
            ELIMINATED
          </div>
          {isRandomElimination && (
            <div className="text-yellow-400 font-cinzel text-2xl mb-4 tracking-wider">
              Randomly selected for elimination
            </div>
          )}
          <p className="text-[#d4af37] italic font-playfair text-xl max-w-lg mx-auto">
            "Every story has an end, but yours was a performance to remember."
          </p>
        </motion.div>
      </div>

      {/* Dramatic scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
    </motion.div>
  );
};

export default EliminationOverlay;
