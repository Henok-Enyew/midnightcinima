
import React from 'react';
import { motion } from 'framer-motion';
import { Group } from '../types';

interface ScoreboardProps {
  groups: Group[];
  currentGroupIndex: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ groups, currentGroupIndex }) => {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-[#d4af37]/20 rounded-3xl p-4 flex flex-col max-h-[calc(100vh-200px)] overflow-y-auto">
      <h3 className="text-[#d4af37] font-cinzel text-sm tracking-[0.3em] uppercase mb-4 pb-2 border-b border-[#d4af37]/10 text-center">
        Leaderboard
      </h3>
      
      <div className="space-y-3 flex-1">
        {groups.map((group, idx) => {
          const isActive = idx === currentGroupIndex;
          
          return (
            <motion.div
              key={group.id}
              initial={false}
              animate={{ 
                scale: isActive ? 1.05 : 1,
                opacity: group.isEliminated ? 0.3 : 1,
                backgroundColor: isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent'
              }}
              className={`p-3 rounded-xl border ${isActive ? 'border-[#d4af37]/50' : 'border-white/5'} transition-all flex flex-col relative overflow-hidden group`}
            >
              {isActive && !group.isEliminated && (
                <div className="absolute top-1 right-2 text-[8px] text-[#d4af37] font-cinzel animate-pulse">
                  NOW
                </div>
              )}
              
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-cinzel tracking-widest ${isActive ? 'text-[#d4af37]' : 'text-gray-400'}`}>
                  #{idx + 1}
                </span>
                {group.isEliminated && (
                  <span className="text-[10px] font-cinzel text-red-500 border border-red-500/50 px-1.5 py-0.5 rounded uppercase">
                    OUT
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-end">
                <h4 className="text-base font-playfair text-white font-bold group-hover:text-[#d4af37] transition-colors truncate flex-1 mr-2">
                  {group.name}
                </h4>
                <div className="text-xl font-cinzel text-[#d4af37] gold-glow">
                  {group.score}
                </div>
              </div>

              {/* Score bar */}
              <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, group.score / 10)}%` }}
                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#fceabb]"
                 />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 p-2 bg-white/5 rounded-lg border border-white/10 text-center">
        <p className="text-[10px] text-gray-500 font-cinzel uppercase tracking-widest">Cinema Hall A</p>
      </div>
    </div>
  );
};

export default Scoreboard;
