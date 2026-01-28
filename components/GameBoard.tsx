
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '../types';
import Timer from './Timer';

interface GameBoardProps {
  question: Question;
  onDecision: (type: 'correct' | 'incorrect') => void;
  onNext: () => void;
  timer: number;
  isResolved: boolean;
  lastDecision: 'correct' | 'incorrect' | 'timeout' | null;
  isTieBreaker?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  question, 
  onDecision, 
  onNext, 
  timer, 
  isResolved, 
  lastDecision,
  isTieBreaker 
}) => {
  return (
    <div className="flex flex-col space-y-8 relative pb-4">
      {isTieBreaker && (
        <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none rounded-3xl -z-10 border-2 border-red-500/20"></div>
      )}

      {/* Question Card */}
      <motion.div 
        key={question.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className="min-h-[400px] bg-black/60 backdrop-blur-md border border-[#d4af37]/30 rounded-3xl p-12 flex flex-col items-center justify-center relative overflow-hidden"
      >
        <div className="absolute top-6 right-6">
            <Timer value={timer} max={60} />
        </div>

        <div className="text-center max-w-4xl mt-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 font-cinzel text-lg mb-4 tracking-widest uppercase"
          >
            Points: {question.points}
          </motion.div>
          
          <AnimatePresence mode="wait">
            {!isResolved ? (
              <motion.h1 
                key="q-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-5xl md:text-7xl font-bold text-white leading-tight gold-glow" 
                style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}
              >
                {question.text}
              </motion.h1>
            ) : (
              <motion.div
                key="result-text"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className={`text-8xl mb-4 ${
                  lastDecision === 'correct' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {lastDecision === 'correct' ? '✓' : lastDecision === 'timeout' ? '⌛' : '✗'}
                </div>
                <h2 className={`text-4xl font-cinzel uppercase tracking-[0.3em] ${
                  lastDecision === 'correct' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {lastDecision === 'correct' ? 'Answered' : lastDecision === 'timeout' ? 'Time Out - Not Answered' : 'Not Answered'}
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cinematic light sweep */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent"></div>
      </motion.div>

      {/* Judge Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-shrink-0">
        <AnimatePresence>
          {!isResolved ? (
            <>
              <motion.button
                key="btn-not-answered"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDecision('incorrect')}
                className="p-6 bg-red-950/30 border border-red-500/30 rounded-2xl text-red-500 font-cinzel tracking-widest hover:bg-red-500/10 hover:border-red-500 transition-all flex items-center justify-center gap-4"
              >
                <span className="text-2xl">✗</span> NOT ANSWERED
              </motion.button>

              <motion.button
                key="btn-answered"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDecision('correct')}
                className="p-6 bg-green-950/30 border border-green-500/30 rounded-2xl text-green-500 font-cinzel tracking-widest hover:bg-green-500/10 hover:border-green-500 transition-all flex items-center justify-center gap-4"
              >
                <span className="text-2xl">✓</span> ANSWERED
              </motion.button>
            </>
          ) : (
            <motion.button
              key="btn-next"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNext}
              className="p-8 bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-black font-cinzel font-bold text-2xl rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.3)] md:col-span-2 transition-all"
            >
              NEXT ➜
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      {/* Keyboard shortcuts hint */}
      {!isResolved && (
        <div className="text-center text-xs text-gray-500 font-cinzel tracking-widest mt-2 flex-shrink-0">
          <span className="mr-4">Space: Pause/Resume Timer</span>
          <span className="mr-4">→: Answered</span>
          <span>←: Not Answered</span>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
