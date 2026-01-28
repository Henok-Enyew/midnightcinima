import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GamePhase, GameState, Group, GameRound, QuestionsData, RoundData, Question } from './types';
import { INITIAL_TIMER } from './constants';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';
import Scoreboard from './components/Scoreboard';
import EliminationOverlay from './components/EliminationOverlay';
import RandomEliminationOverlay from './components/RandomEliminationOverlay';
import WinnerScreen from './components/WinnerScreen';
import questionsData from './questions.json';

const QUESTIONS: QuestionsData = questionsData as QuestionsData;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.SETUP,
    groups: [],
    currentRound: GameRound.ROUND_1,
    currentGroupIndex: 0,
    currentQuestionIndex: 0,
    questionsAnswered: 0,
    timer: INITIAL_TIMER,
    isTimerActive: false,
    isQuestionResolved: false,
    lastEliminatedGroupId: null,
    lastDecision: null,
    tieBreakerQuestions: [],
    tieBreakerIndex: 0,
    isRandomElimination: false,
    tiedGroupIds: [],
    isWinnerTieBreaker: false,
  });

  // Get current round data
  const getCurrentRoundData = (round: GameRound): RoundData => {
    switch (round) {
      case GameRound.ROUND_1:
        return QUESTIONS.round1;
      case GameRound.ROUND_2:
        return QUESTIONS.round2;
      case GameRound.ROUND_3:
        return QUESTIONS.round3;
      default:
        return QUESTIONS.round1;
    }
  };

  // Get questions for current round
  const getCurrentQuestions = (round: GameRound): Question[] => {
    return getCurrentRoundData(round).questions;
  };

  // Get current question
  const getCurrentQuestion = (state?: GameState): Question | null => {
    const stateToUse = state || gameState;
    if (stateToUse.phase === GamePhase.TIE_BREAKER) {
      if (stateToUse.tieBreakerQuestions.length > 0 && stateToUse.tieBreakerIndex < stateToUse.tieBreakerQuestions.length) {
        return stateToUse.tieBreakerQuestions[stateToUse.tieBreakerIndex];
      }
      return null;
    }
    const questions = getCurrentQuestions(stateToUse.currentRound);
    if (questions.length === 0) return null;
    // Use currentQuestionIndex to get the question
    if (stateToUse.currentQuestionIndex >= 0 && stateToUse.currentQuestionIndex < questions.length) {
      return questions[stateToUse.currentQuestionIndex];
    }
    return null;
  };

  // Get total questions per round
  const getTotalQuestionsForRound = (round: GameRound): number => {
    switch (round) {
      case GameRound.ROUND_1:
        return 12; // 4 groups × 3 questions
      case GameRound.ROUND_2:
        return 9; // 3 groups × 3 questions
      case GameRound.ROUND_3:
        return 6; // 2 groups × 3 questions
      default:
        return 12;
    }
  };

  const handleStartGame = (groupNames: string[]) => {
      const initialGroups: Group[] = groupNames.map((name, index) => ({
      id: index,
      name,
      score: 0,
      isEliminated: false,
    }));
    setGameState(prev => ({
      ...prev,
      groups: initialGroups,
      phase: GamePhase.PLAYING,
      currentRound: GameRound.ROUND_1,
      currentGroupIndex: 0,
      currentQuestionIndex: 0,
      questionsAnswered: 0,
      timer: INITIAL_TIMER,
      isTimerActive: true, // Timer starts automatically
      isQuestionResolved: false,
      lastDecision: null,
    }));
  };

  const handleDecision = useCallback((type: 'correct' | 'incorrect' | 'timeout') => {
    setGameState(prev => {
      if (prev.isQuestionResolved) return prev;

      const newGroups = [...prev.groups];
      const currentQuestion = getCurrentQuestion(prev);
      
      if (!currentQuestion) return prev;

      // Add points for correct answer (always 1 point per question)
      if (type === 'correct') {
        newGroups[prev.currentGroupIndex].score += 1;
      }

      // Check if tie is broken during tie-breaker
      if (prev.phase === GamePhase.TIE_BREAKER && prev.tiedGroupIds.length > 0) {
        const tiedGroups = newGroups.filter(g => prev.tiedGroupIds.includes(g.id) && !g.isEliminated);
        if (tiedGroups.length > 1) {
          if (prev.isWinnerTieBreaker) {
            // Winner tie-breaker - check for highest score
            const highestScore = Math.max(...tiedGroups.map(g => g.score));
            const winners = tiedGroups.filter(g => g.score === highestScore);
            
            if (winners.length === 1) {
              // Winner determined
              return {
                ...prev,
                groups: newGroups,
                isTimerActive: false,
                isQuestionResolved: true,
                lastDecision: type,
                phase: GamePhase.WINNER,
                tiedGroupIds: [],
                isWinnerTieBreaker: false,
              };
            }
          } else {
            // Elimination tie-breaker - check for lowest score
            const lowestScore = Math.min(...tiedGroups.map(g => g.score));
            const candidates = tiedGroups.filter(g => g.score === lowestScore);
            
            if (candidates.length === 1) {
              // Tie broken - eliminate the lowest
              const newGroupsWithElimination = newGroups.map(g => 
                g.id === candidates[0].id ? { ...g, isEliminated: true } : g
              );
              return {
                ...prev,
                groups: newGroupsWithElimination,
                isTimerActive: false,
                isQuestionResolved: true,
                lastDecision: type,
                phase: GamePhase.ELIMINATION,
                lastEliminatedGroupId: candidates[0].id,
                tiedGroupIds: [],
                isWinnerTieBreaker: false,
              };
            }
          }
        }
      }

      return {
        ...prev,
        groups: newGroups,
        isTimerActive: false,
        isQuestionResolved: true,
        lastDecision: type,
        // Don't increment questionsAnswered here - it will be incremented when moving to next question
      };
    });
  }, []);

  // Auto-start timer when new question appears
  useEffect(() => {
    if ((gameState.phase === GamePhase.PLAYING || gameState.phase === GamePhase.TIE_BREAKER) && 
        !gameState.isQuestionResolved && 
        !gameState.isTimerActive && 
        gameState.timer === INITIAL_TIMER) {
      setGameState(prev => ({ ...prev, isTimerActive: true }));
    }
  }, [gameState.phase, gameState.isQuestionResolved, gameState.currentQuestionIndex, gameState.tieBreakerIndex]);

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (gameState.isTimerActive && gameState.timer > 0 && !gameState.isQuestionResolved) {
      interval = setInterval(() => {
        setGameState(prev => ({ ...prev, timer: prev.timer - 1 }));
      }, 1000);
    } else if (gameState.timer === 0 && gameState.isTimerActive && !gameState.isQuestionResolved) {
      handleDecision('timeout');
    }
    return () => clearInterval(interval);
  }, [gameState.isTimerActive, gameState.timer, gameState.isQuestionResolved, handleDecision]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState.phase !== GamePhase.PLAYING && gameState.phase !== GamePhase.TIE_BREAKER) return;
      if (gameState.isQuestionResolved) return;

      if (e.code === 'Space') {
        e.preventDefault();
        // Toggle timer
        setGameState(prev => ({
          ...prev,
          isTimerActive: !prev.isTimerActive,
        }));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleDecision('correct');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleDecision('incorrect');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.phase, gameState.isQuestionResolved, handleDecision]);

  // Check if round is complete
  const isRoundComplete = (round: GameRound, questionsAnswered: number): boolean => {
    return questionsAnswered >= getTotalQuestionsForRound(round);
  };

  // Handle winner determination at end of Round 3
  const handleWinnerDetermination = (groups: Group[]): { groups: Group[], winnerId: number | null, phase: GamePhase, tieBreakerQuestions: Question[], tieBreakerIndex: number, isRandomElimination: boolean, tiedGroupIds: number[], isWinnerTieBreaker: boolean } => {
    // Sort active groups by ID to ensure consistent ordering
    const activeGroups = groups.filter(g => !g.isEliminated).sort((a, b) => a.id - b.id);
    
    if (activeGroups.length === 1) {
      return { groups, winnerId: activeGroups[0].id, phase: GamePhase.WINNER, tieBreakerQuestions: [], tieBreakerIndex: 0, isRandomElimination: false, tiedGroupIds: [], isWinnerTieBreaker: false };
    }

    // Find the highest score among active groups
    const highestScore = Math.max(...activeGroups.map(g => g.score));
    // Filter groups with the highest score (sorted by ID)
    const winners = activeGroups.filter(g => g.score === highestScore);

    if (winners.length === 1) {
      // Single highest score - winner
      return { groups, winnerId: winners[0].id, phase: GamePhase.WINNER, tieBreakerQuestions: [], tieBreakerIndex: 0, isRandomElimination: false, tiedGroupIds: [], isWinnerTieBreaker: false };
    } else {
      // Tie for highest score - go directly to random selection
      const tiedIds = winners.map(w => w.id).sort((a, b) => a - b); // Sort IDs for consistency
      
      return { groups, winnerId: null, phase: GamePhase.RANDOM_SELECTION, tieBreakerQuestions: [], tieBreakerIndex: 0, isRandomElimination: false, tiedGroupIds: tiedIds, isWinnerTieBreaker: true };
    }
  };

  // Handle elimination at end of round
  const handleRoundEndElimination = (groups: Group[], round: GameRound): { groups: Group[], eliminatedId: number | null, phase: GamePhase, tieBreakerQuestions: Question[], tieBreakerIndex: number, isRandomElimination: boolean, tiedGroupIds: number[], isWinnerTieBreaker: boolean } => {
    // Sort active groups by ID for consistent ordering
    const activeGroups = groups.filter(g => !g.isEliminated).sort((a, b) => a.id - b.id);
    
    if (activeGroups.length <= 1) {
      return { groups, eliminatedId: null, phase: GamePhase.WINNER, tieBreakerQuestions: [], tieBreakerIndex: 0, isRandomElimination: false, tiedGroupIds: [], isWinnerTieBreaker: false };
    }

    const lowestScore = Math.min(...activeGroups.map(g => g.score));
    const candidates = activeGroups.filter(g => g.score === lowestScore).sort((a, b) => a.id - b.id);

    if (candidates.length === 1) {
      // Single lowest score - eliminate
      const newGroups = groups.map(g => 
        g.id === candidates[0].id ? { ...g, isEliminated: true } : g
      );
      return { groups: newGroups, eliminatedId: candidates[0].id, phase: GamePhase.ELIMINATION, tieBreakerQuestions: [], tieBreakerIndex: 0, isRandomElimination: false, tiedGroupIds: [], isWinnerTieBreaker: false };
    } else {
      // Tie - go directly to random selection
      const tiedIds = candidates.map(c => c.id).sort((a, b) => a - b); // Sort IDs for consistency
      
      return { groups, eliminatedId: null, phase: GamePhase.RANDOM_SELECTION, tieBreakerQuestions: [], tieBreakerIndex: 0, isRandomElimination: false, tiedGroupIds: tiedIds, isWinnerTieBreaker: false };
    }
  };

  // Handle tie-breaker next
  const handleTieBreakerNext = (groups: Group[], tieBreakerIndex: number, tieBreakerQuestions: Question[], tiedGroupIds: number[], isWinnerTieBreaker: boolean): { groups: Group[], eliminatedId: number | null, winnerId: number | null, phase: GamePhase, tieBreakerQuestions: Question[], tieBreakerIndex: number, isRandomElimination: boolean, tiedGroupIds: number[], isWinnerTieBreaker: boolean } => {
    // Only consider tied groups - sort by ID for consistent ordering
    const tiedGroups = groups.filter(g => tiedGroupIds.includes(g.id) && !g.isEliminated).sort((a, b) => a.id - b.id);
    
    if (tiedGroups.length <= 1) {
      if (isWinnerTieBreaker) {
        // Winner determined
        return { groups, eliminatedId: null, winnerId: tiedGroups.length === 1 ? tiedGroups[0].id : null, phase: GamePhase.WINNER, tieBreakerQuestions: [], tieBreakerIndex: 0, isRandomElimination: false, tiedGroupIds: [], isWinnerTieBreaker: false };
      } else {
        return { groups, eliminatedId: null, winnerId: null, phase: GamePhase.WINNER, tieBreakerQuestions: [], tieBreakerIndex: 0, isRandomElimination: false, tiedGroupIds: [], isWinnerTieBreaker: false };
      }
    }

    if (isWinnerTieBreaker) {
      // For winner determination, find highest score among tied groups
      const highestScore = Math.max(...tiedGroups.map(g => g.score));
      const winners = tiedGroups.filter(g => g.score === highestScore).sort((a, b) => a.id - b.id);

      if (winners.length === 1) {
        // Single highest score - winner determined
        return { groups, eliminatedId: null, winnerId: winners[0].id, phase: GamePhase.WINNER, tieBreakerQuestions: [], tieBreakerIndex: 0, isRandomElimination: false, tiedGroupIds: [], isWinnerTieBreaker: false };
      } else if (tieBreakerIndex < tieBreakerQuestions.length - 1) {
        // More reserve questions available - continue tie-breaker
        return { groups, eliminatedId: null, winnerId: null, phase: GamePhase.TIE_BREAKER, tieBreakerQuestions, tieBreakerIndex: tieBreakerIndex + 1, isRandomElimination: false, tiedGroupIds, isWinnerTieBreaker: true };
      } else {
        // No more reserve questions - trigger random selection animation for winner
        return { groups, eliminatedId: null, winnerId: null, phase: GamePhase.RANDOM_SELECTION, tieBreakerQuestions: [], tieBreakerIndex: 0, isRandomElimination: false, tiedGroupIds, isWinnerTieBreaker: true };
      }
    } else {
      // For elimination, find lowest score among tied groups
      const lowestScore = Math.min(...tiedGroups.map(g => g.score));
      const candidates = tiedGroups.filter(g => g.score === lowestScore).sort((a, b) => a.id - b.id);

      if (candidates.length === 1) {
        // Single lowest score - eliminate
        const newGroups = groups.map(g => 
          g.id === candidates[0].id ? { ...g, isEliminated: true } : g
        );
        return { groups: newGroups, eliminatedId: candidates[0].id, winnerId: null, phase: GamePhase.ELIMINATION, tieBreakerQuestions: [], tieBreakerIndex: 0, isRandomElimination: false, tiedGroupIds: [], isWinnerTieBreaker: false };
      } else if (tieBreakerIndex < tieBreakerQuestions.length - 1) {
        // More reserve questions available - continue tie-breaker
        return { groups, eliminatedId: null, winnerId: null, phase: GamePhase.TIE_BREAKER, tieBreakerQuestions, tieBreakerIndex: tieBreakerIndex + 1, isRandomElimination: false, tiedGroupIds, isWinnerTieBreaker: false };
      } else {
        // No more reserve questions - trigger random selection animation
        return { groups, eliminatedId: null, winnerId: null, phase: GamePhase.RANDOM_SELECTION, tieBreakerQuestions: [], tieBreakerIndex: 0, isRandomElimination: false, tiedGroupIds, isWinnerTieBreaker: false };
      }
    }
  };

  const handleNextTurn = () => {
    setGameState(prev => {
      const newGroups = [...prev.groups];
      let nextPhase = prev.phase;
      let nextRound = prev.currentRound;
      let nextGroupIndex = prev.currentGroupIndex;
      let nextQuestionIndex = prev.currentQuestionIndex;
      let questionsAnswered = prev.questionsAnswered;
      let lastEliminatedId = prev.lastEliminatedGroupId;
      let tieBreakerQuestions = prev.tieBreakerQuestions;
      let tieBreakerIndex = prev.tieBreakerIndex;
      let isRandomElimination = prev.isRandomElimination;
      let tiedGroupIds = prev.tiedGroupIds;

      if (prev.phase === GamePhase.TIE_BREAKER) {
        // Handle tie-breaker flow - only consider tied groups
        const result = handleTieBreakerNext(newGroups, prev.tieBreakerIndex, prev.tieBreakerQuestions, prev.tiedGroupIds, prev.isWinnerTieBreaker);
        newGroups.splice(0, newGroups.length, ...result.groups);
        nextPhase = result.phase;
        lastEliminatedId = result.eliminatedId;
        tieBreakerQuestions = result.tieBreakerQuestions;
        tieBreakerIndex = result.tieBreakerIndex;
        isRandomElimination = result.isRandomElimination;
        tiedGroupIds = result.tiedGroupIds;
        const isWinnerTieBreaker = result.isWinnerTieBreaker;

        if (nextPhase === GamePhase.ELIMINATION || nextPhase === GamePhase.WINNER) {
          return {
            ...prev,
            groups: newGroups,
            phase: nextPhase,
            lastEliminatedGroupId: lastEliminatedId,
            isRandomElimination,
            tieBreakerQuestions: [],
            tieBreakerIndex: 0,
            tiedGroupIds: [],
            isWinnerTieBreaker: false,
          };
        }

        // Continue tie-breaker - rotate only between tied groups
        // Sort tied groups by ID for consistent ordering
        const tiedGroups = newGroups.filter(g => tiedGroupIds.includes(g.id) && !g.isEliminated).sort((a, b) => a.id - b.id);
        
        // Rotate between tied groups only - ensure proper round-robin
        if (tiedGroups.length > 0) {
          const currentTiedIndex = tiedGroups.findIndex(g => g.id === prev.currentGroupIndex);
          if (currentTiedIndex >= 0) {
            // Current group is in tied groups - move to next
            const nextTiedIndex = (currentTiedIndex + 1) % tiedGroups.length;
            nextGroupIndex = tiedGroups[nextTiedIndex].id;
          } else {
            // Current group not found in tied groups - start with first (lowest ID)
            nextGroupIndex = tiedGroups[0].id;
          }
        }
      } else {
        // Normal flow - increment questionsAnswered when moving to next question
        questionsAnswered = prev.questionsAnswered + 1;

        // Check if round is complete
        if (isRoundComplete(prev.currentRound, questionsAnswered)) {
          // Round 3 uses winner determination (highest score), Rounds 1-2 use elimination (lowest score)
          if (prev.currentRound === GameRound.ROUND_3) {
            // Round 3 complete - determine winner (check for ties in highest score)
            const winnerResult = handleWinnerDetermination(newGroups);
            newGroups.splice(0, newGroups.length, ...winnerResult.groups);
            nextPhase = winnerResult.phase;
            tieBreakerQuestions = winnerResult.tieBreakerQuestions;
            tieBreakerIndex = winnerResult.tieBreakerIndex;
            tiedGroupIds = winnerResult.tiedGroupIds;
            const isWinnerTieBreaker = winnerResult.isWinnerTieBreaker;

            if (nextPhase === GamePhase.WINNER) {
              return {
                ...prev,
                groups: newGroups,
                phase: nextPhase,
                questionsAnswered,
                tieBreakerQuestions,
                tieBreakerIndex,
                tiedGroupIds,
                isWinnerTieBreaker,
              };
            } else if (nextPhase === GamePhase.RANDOM_SELECTION) {
              // Go directly to random selection for winner
              return {
                ...prev,
                groups: newGroups,
                phase: nextPhase,
                questionsAnswered,
                tieBreakerQuestions: [],
                tieBreakerIndex: 0,
                tiedGroupIds,
                isWinnerTieBreaker,
              };
            }
          } else {
            // Round 1 or 2 - use elimination logic (lowest score)
            const result = handleRoundEndElimination(newGroups, prev.currentRound);
            newGroups.splice(0, newGroups.length, ...result.groups);
            nextPhase = result.phase;
            lastEliminatedId = result.eliminatedId;
            tieBreakerQuestions = result.tieBreakerQuestions;
            tieBreakerIndex = result.tieBreakerIndex;
            tiedGroupIds = result.tiedGroupIds;

          if (nextPhase === GamePhase.ELIMINATION || nextPhase === GamePhase.WINNER) {
            return {
              ...prev,
              groups: newGroups,
              phase: nextPhase,
              lastEliminatedGroupId: lastEliminatedId,
              questionsAnswered,
              tieBreakerQuestions,
              tieBreakerIndex,
              tiedGroupIds,
              isWinnerTieBreaker: result.isWinnerTieBreaker,
            };
          }

          // If random selection needed, go directly to it
          if (nextPhase === GamePhase.RANDOM_SELECTION && tiedGroupIds.length > 0) {
            return {
              ...prev,
              groups: newGroups,
              phase: nextPhase,
              questionsAnswered,
              tieBreakerQuestions: [],
              tieBreakerIndex: 0,
              tiedGroupIds,
              isWinnerTieBreaker: result.isWinnerTieBreaker,
            };
          }

          // Move to next round
          if (prev.currentRound === GameRound.ROUND_1) {
            nextRound = GameRound.ROUND_2;
            nextQuestionIndex = 0;
            questionsAnswered = 0;
          } else if (prev.currentRound === GameRound.ROUND_2) {
            nextRound = GameRound.ROUND_3;
            nextQuestionIndex = 0;
            questionsAnswered = 0;
          }
          }

      // Find first active group for next round - sort by ID to ensure consistent ordering
      const activeGroups = newGroups.filter(g => !g.isEliminated).sort((a, b) => a.id - b.id);
      if (activeGroups.length > 0) {
        nextGroupIndex = activeGroups[0].id; // Always start with lowest ID group
        nextQuestionIndex = 0; // Start from first question of new round
      }
        } else {
          // Continue current round - find next active group (round-robin)
          // Sort active groups by ID for consistent ordering
          const activeGroups = newGroups.filter(g => !g.isEliminated).sort((a, b) => a.id - b.id);
          const currentActiveIndex = activeGroups.findIndex(g => g.id === prev.currentGroupIndex);
          const nextActiveIndex = (currentActiveIndex + 1) % activeGroups.length;
          nextGroupIndex = activeGroups[nextActiveIndex].id;
          
          // Calculate question index: each group gets questions in round-robin order
          // questionsAnswered tells us which question number we're on (0, 1, 2, ...)
          // We cycle through questions array based on total questions answered
          const questions = getCurrentQuestions(prev.currentRound);
          nextQuestionIndex = questionsAnswered % questions.length;
        }
      }

      // Check for final winner
      const activeGroups = newGroups.filter(g => !g.isEliminated);
      if (activeGroups.length === 1) {
        nextPhase = GamePhase.WINNER;
      }

      return {
        ...prev,
        groups: newGroups,
        phase: nextPhase,
        currentRound: nextRound,
        currentGroupIndex: nextGroupIndex,
        currentQuestionIndex: nextQuestionIndex,
        questionsAnswered,
        timer: INITIAL_TIMER,
        isTimerActive: true, // Timer starts automatically
        isQuestionResolved: false,
        lastEliminatedGroupId: lastEliminatedId,
        lastDecision: null,
        tieBreakerQuestions,
        tieBreakerIndex,
        isRandomElimination,
        tiedGroupIds,
      };
    });
  };

  const resumeFromElimination = () => {
    setGameState(prev => {
      // Sort active groups by ID to ensure consistent ordering - always start with lowest ID
      const activeGroups = prev.groups.filter(g => !g.isEliminated).sort((a, b) => a.id - b.id);
      
      if (activeGroups.length === 1) {
        return {
          ...prev,
          phase: GamePhase.WINNER,
        };
      }

      // Check if we need to move to next round
      let nextRound = prev.currentRound;
      let nextQuestionIndex = prev.currentQuestionIndex;
      let questionsAnswered = prev.questionsAnswered;

      if (prev.currentRound === GameRound.ROUND_1 && activeGroups.length === 3) {
        // Move to Round 2
        nextRound = GameRound.ROUND_2;
        nextQuestionIndex = 0;
        questionsAnswered = 0;
      } else if (prev.currentRound === GameRound.ROUND_2 && activeGroups.length === 2) {
        // Move to Round 3
        nextRound = GameRound.ROUND_3;
        nextQuestionIndex = 0;
        questionsAnswered = 0;
      }

      // Find first active group (lowest ID) - already sorted above
      const firstActiveGroup = activeGroups[0];
      nextQuestionIndex = 0; // Start from first question of new round

      return {
        ...prev,
        phase: GamePhase.PLAYING,
        currentRound: nextRound,
        currentGroupIndex: firstActiveGroup.id,
        currentQuestionIndex: nextQuestionIndex,
        questionsAnswered,
        timer: INITIAL_TIMER,
        isTimerActive: true, // Timer starts automatically
        isQuestionResolved: false, // Reset question resolved state for new round
        lastDecision: null, // Reset last decision
        isRandomElimination: false,
      };
    });
  };

  const resetGame = () => {
    setGameState({
      phase: GamePhase.SETUP,
      groups: [],
      currentRound: GameRound.ROUND_1,
      currentGroupIndex: 0,
      currentQuestionIndex: 0,
      questionsAnswered: 0,
      timer: INITIAL_TIMER,
      isTimerActive: false,
      isQuestionResolved: false,
      lastEliminatedGroupId: null,
      lastDecision: null,
      tieBreakerQuestions: [],
      tieBreakerIndex: 0,
      isRandomElimination: false,
      tiedGroupIds: [],
      isWinnerTieBreaker: false,
    });
  };

  const currentQuestion = getCurrentQuestion();
  const currentRoundData = getCurrentRoundData(gameState.currentRound);

  return (
    <div className="relative min-h-screen curtain-gradient flex flex-col overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <AnimatePresence mode="wait">
        {gameState.phase === GamePhase.SETUP && (
          <SetupScreen onStart={handleStartGame} />
        )}

        {(gameState.phase === GamePhase.PLAYING || gameState.phase === GamePhase.TIE_BREAKER) && currentQuestion && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-8 space-y-8 min-h-0"
          >
            <div className="flex justify-between items-center border-b border-[#d4af37]/30 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-[#d4af37] shadow-[0_0_10px_#d4af37]"></div>
                <h2 className="text-2xl font-cinzel text-[#d4af37] tracking-widest uppercase">
                  {gameState.phase === GamePhase.TIE_BREAKER 
                    ? (gameState.isWinnerTieBreaker ? 'Winner Tie-Breaker' : 'Sudden Death')
                    : `${gameState.groups[gameState.currentGroupIndex]?.name}'s Turn`}
                </h2>
                <span className="text-sm text-gray-400 font-cinzel">
                  Round {gameState.currentRound} - {currentRoundData.name}
                </span>
              </div>
              <div className="text-gray-400 font-cinzel tracking-wider">
                {gameState.phase === GamePhase.TIE_BREAKER 
                  ? `TIE-BREAKER ${gameState.tieBreakerIndex + 1}`
                  : `QUESTION ${gameState.questionsAnswered + 1} / ${getTotalQuestionsForRound(gameState.currentRound)}`}
              </div>
            </div>

            {gameState.isRandomElimination && (
              <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 text-center">
                <p className="text-yellow-500 font-cinzel text-lg">Randomly selected for elimination.</p>
              </div>
            )}

            <div className="flex-1 grid grid-cols-12 gap-8 items-start min-h-0">
              <div className="col-span-12 lg:col-span-9">
                <GameBoard 
                    question={currentQuestion}
                    onDecision={handleDecision}
                    onNext={handleNextTurn}
                    timer={gameState.timer}
                    isResolved={gameState.isQuestionResolved}
                    lastDecision={gameState.lastDecision}
                    isTieBreaker={gameState.phase === GamePhase.TIE_BREAKER}
                />
              </div>

              <div className="col-span-12 lg:col-span-3">
                <Scoreboard 
                    groups={gameState.groups} 
                    currentGroupIndex={gameState.currentGroupIndex}
                />
              </div>
            </div>
          </motion.div>
        )}

        {gameState.phase === GamePhase.ELIMINATION && gameState.lastEliminatedGroupId !== null && (
          <EliminationOverlay 
            group={gameState.groups[gameState.lastEliminatedGroupId]} 
            onComplete={resumeFromElimination}
            isRandomElimination={gameState.isRandomElimination}
          />
        )}

        {gameState.phase === GamePhase.RANDOM_SELECTION && (
          <RandomEliminationOverlay
            tiedGroups={gameState.groups.filter(g => gameState.tiedGroupIds.includes(g.id) && !g.isEliminated)}
            onSelect={(selectedGroup) => {
              setGameState(prev => {
                if (prev.isWinnerTieBreaker) {
                  // Random winner selection - mark all other tied groups as eliminated
                  const newGroups = prev.groups.map(g => {
                    if (prev.tiedGroupIds.includes(g.id) && g.id !== selectedGroup.id) {
                      return { ...g, isEliminated: true };
                    }
                    return g;
                  });
                  return {
                    ...prev,
                    groups: newGroups,
                    phase: GamePhase.WINNER,
                    tiedGroupIds: [],
                    isWinnerTieBreaker: false,
                  };
                } else {
                  // Random elimination
                  const newGroups = prev.groups.map(g => 
                    g.id === selectedGroup.id ? { ...g, isEliminated: true } : g
                  );
                  return {
                    ...prev,
                    groups: newGroups,
                    phase: GamePhase.ELIMINATION,
                    lastEliminatedGroupId: selectedGroup.id,
                    isRandomElimination: true,
                    tiedGroupIds: [],
                    isWinnerTieBreaker: false,
                  };
                }
              });
            }}
            isWinnerSelection={gameState.isWinnerTieBreaker}
          />
        )}

        {gameState.phase === GamePhase.WINNER && (
          <WinnerScreen 
            winner={gameState.groups.find(g => !g.isEliminated)!} 
            onRestart={resetGame}
          />
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent"></div>
    </div>
  );
};

export default App;
