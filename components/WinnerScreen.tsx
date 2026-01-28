
import React from 'react';
import { motion } from 'framer-motion';
import { Group } from '../types';

interface WinnerScreenProps {
  winner: Group;
  onRestart: () => void;
}

const WinnerScreen: React.FC<WinnerScreenProps> = ({ winner, onRestart }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col items-center justify-center p-8 bg-[#05070a] relative"
    >
      {/* Golden spotlight beams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1 bg-gradient-to-b from-[#d4af37] to-transparent h-full rotate-[15deg] blur-sm opacity-20"></div>
        <div className="absolute top-0 right-1/4 w-1 bg-gradient-to-b from-[#d4af37] to-transparent h-full -rotate-[15deg] blur-sm opacity-20"></div>
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, type: 'spring' }}
        className="text-center z-10"
      >
        <div className="mb-12">
            <motion.div 
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              className="w-48 h-48 mx-auto mb-8 bg-gradient-to-tr from-[#d4af37] to-[#fceabb] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.5)] border-4 border-[#d4af37]"
            >
              <span className="text-8xl">🏆</span>
            </motion.div>
            <h3 className="text-[#d4af37] font-cinzel text-3xl tracking-[0.4em] uppercase mb-4 gold-glow">Grand Champion</h3>
            <h1 className="text-9xl font-playfair text-white mb-6 font-bold">{winner.name}</h1>
            <div className="h-0.5 w-64 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-8"></div>
            <p className="text-gray-400 text-2xl font-cinzel tracking-widest uppercase">Score: {winner.score}</p>
        </div>

        <button 
          onClick={onRestart}
          className="px-12 py-4 border-2 border-[#d4af37] text-[#d4af37] font-cinzel font-bold text-lg rounded hover:bg-[#d4af37] hover:text-black transition-all duration-300"
        >
          PLAY NEW SHOW
        </button>
      </motion.div>
    </motion.div>
  );
};

export default WinnerScreen;
