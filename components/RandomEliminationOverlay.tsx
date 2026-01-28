import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Group } from '../types';

interface RandomEliminationOverlayProps {
  tiedGroups: Group[];
  onSelect: (selectedGroup: Group) => void;
}

const RandomEliminationOverlay: React.FC<RandomEliminationOverlayProps> = ({ tiedGroups, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSlowing, setIsSlowing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    if (tiedGroups.length === 0) return;

    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    const startSelection = () => {
      let speed = 50; // Start fast
      let iterations = 0;
      const maxIterations = 20 + Math.floor(Math.random() * 10); // Random stopping point

      const cycle = () => {
        setCurrentIndex(prev => (prev + 1) % tiedGroups.length);
        iterations++;

        if (iterations > maxIterations * 0.7) {
          // Start slowing down
          setIsSlowing(true);
          speed = Math.min(speed * 1.3, 300);
        }

        if (iterations < maxIterations) {
          interval = setTimeout(cycle, speed);
        } else {
          // Final selection
          const finalIndex = Math.floor(Math.random() * tiedGroups.length);
          setCurrentIndex(finalIndex);
          setSelectedGroup(tiedGroups[finalIndex]);
          
          // Wait a bit then call onSelect (show selected for 2 seconds)
          timeout = setTimeout(() => {
            onSelect(tiedGroups[finalIndex]);
          }, 2500);
        }
      };

      cycle();
    };

    // Start after a brief delay
    const startTimeout = setTimeout(startSelection, 500);

    return () => {
      clearTimeout(startTimeout);
      if (interval) clearTimeout(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [tiedGroups, onSelect]);

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
            Out of Questions - Random Selection
          </h2>
          <div className="h-1 w-32 bg-[#d4af37] mx-auto"></div>
        </motion.div>

        {/* Scrolling groups */}
        <div className="relative h-64 overflow-hidden mb-8">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {tiedGroups.map((group, index) => {
                const isActive = index === currentIndex;
                const distance = Math.abs(index - currentIndex);
                const isVisible = distance <= 2;

                if (!isVisible) return null;

                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 100, scale: 0.8 }}
                    animate={{ 
                      opacity: isActive ? 1 : 0.3,
                      y: (index - currentIndex) * 80,
                      scale: isActive ? 1.2 : 0.9,
                    }}
                    exit={{ opacity: 0, y: -100, scale: 0.8 }}
                    transition={{ 
                      duration: isSlowing ? 0.3 : 0.1,
                      ease: isSlowing ? "easeOut" : "linear"
                    }}
                    className={`absolute text-center ${
                      isActive ? 'z-10' : 'z-0'
                    }`}
                  >
                    <div className={`text-6xl font-playfair text-white mb-2 ${
                      isActive ? 'text-[#d4af37]' : 'text-gray-600'
                    }`}>
                      {group.name}
                    </div>
                    <div className={`text-2xl font-cinzel ${
                      isActive ? 'text-[#d4af37]' : 'text-gray-500'
                    }`}>
                      Score: {group.score}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Selected group highlight */}
        {selectedGroup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8"
          >
            <div className="text-4xl font-cinzel text-yellow-400 mb-4 tracking-wider">
              SELECTED
            </div>
            <div className="text-5xl font-playfair text-white">
              {selectedGroup.name}
            </div>
          </motion.div>
        )}
      </div>

      {/* Dramatic scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,255,0,0.06),rgba(0,255,255,0.02),rgba(255,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
    </motion.div>
  );
};

export default RandomEliminationOverlay;
