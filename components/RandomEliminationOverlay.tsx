import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Group } from '../types';

interface RandomEliminationOverlayProps {
  tiedGroups: Group[];
  onSelect: (selectedGroup: Group) => void;
  isWinnerSelection?: boolean;
}

const RandomEliminationOverlay: React.FC<RandomEliminationOverlayProps> = ({ tiedGroups, onSelect, isWinnerSelection = false }) => {
  const [countdown, setCountdown] = useState(5);
  const onSelectRef = useRef(onSelect);
  const tiedGroupsRef = useRef(tiedGroups);

  // Keep refs updated
  useEffect(() => {
    onSelectRef.current = onSelect;
    tiedGroupsRef.current = tiedGroups;
  }, [onSelect, tiedGroups]);

  useEffect(() => {
    if (tiedGroups.length === 0) return;

    let countdownInterval: NodeJS.Timeout;
    let selectionTimeout: NodeJS.Timeout;

    // Countdown from 5 to 0
    countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // After exactly 5 seconds, select a random group and call onSelect
    selectionTimeout = setTimeout(() => {
      clearInterval(countdownInterval);
      const groups = tiedGroupsRef.current;
      if (groups.length > 0) {
        const finalIndex = Math.floor(Math.random() * groups.length);
        const selected = groups[finalIndex];
        // Call onSelect immediately - this will change the phase and unmount this component
        onSelectRef.current(selected);
      }
    }, 5000);

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (selectionTimeout) clearTimeout(selectionTimeout);
    };
  }, []); // Run only once on mount

  if (tiedGroups.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Background effect */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute w-[800px] h-[800px] rounded-full bg-yellow-600/20 blur-[150px]"
      />

      <div className="text-center z-20 px-4 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-gray-400 font-cinzel text-2xl tracking-[0.5em] mb-4 uppercase">
            {isWinnerSelection ? 'Out of Questions - Random Winner Selection' : 'Out of Questions - Random Selection'}
          </h2>
          <div className="h-1 w-32 bg-[#d4af37] mx-auto"></div>
        </motion.div>

        {/* Countdown */}
        <div className="mb-12">
          <div className="text-9xl font-cinzel text-[#d4af37] mb-4 gold-glow">
            {countdown}
          </div>
          <p className="text-gray-400 font-cinzel text-xl tracking-widest">
            Selecting randomly...
          </p>
        </div>

        {/* Tied groups list */}
        <div className="mb-8 space-y-4">
          {tiedGroups.map((group) => (
            <div
              key={group.id}
              className="text-3xl font-playfair text-white"
            >
              {group.name} - Score: {group.score}
            </div>
          ))}
        </div>
      </div>

      {/* Dramatic scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,255,0,0.06),rgba(0,255,255,0.02),rgba(255,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
    </motion.div>
  );
};

export default RandomEliminationOverlay;
