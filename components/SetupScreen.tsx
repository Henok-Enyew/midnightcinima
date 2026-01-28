
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SetupScreenProps {
  onStart: (names: string[]) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [names, setNames] = useState<string[]>(['Group Alpha', 'Group Beta', 'Group Gamma', 'Group Delta']);

  const handleNameChange = (index: number, val: string) => {
    const newNames = [...names];
    newNames[index] = val;
    setNames(newNames);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex-1 flex items-center justify-center p-6 z-10"
    >
      <div className="max-w-4xl w-full bg-black/40 backdrop-blur-xl border border-[#d4af37]/20 p-12 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-[#d4af37]/40 rounded-tl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-[#d4af37]/40 rounded-br-2xl"></div>

        <div className="text-center mb-12">
          <h1 className="text-6xl font-cinzel text-[#d4af37] mb-4 gold-glow tracking-tighter">Midnight Cinema</h1>
          <p className="text-gray-400 font-playfair italic text-xl tracking-widest">A Modern Quest for the Silver Screen Legacy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {names.map((name, idx) => (
            <div key={idx} className="group flex flex-col">
              <label className="text-xs font-cinzel text-[#d4af37]/60 mb-2 uppercase tracking-widest">Contender {idx + 1}</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => handleNameChange(idx, e.target.value)}
                className="bg-black/40 border-b border-[#d4af37]/30 p-4 text-2xl font-playfair focus:border-[#00d4ff] focus:outline-none transition-all text-white placeholder-gray-600 rounded-t-lg group-hover:bg-white/5"
                placeholder={`Enter Group ${idx + 1} Name...`}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => onStart(names)}
            className="px-16 py-5 bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-black font-cinzel font-bold text-xl rounded-full hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            ENTER THE THEATER
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SetupScreen;
