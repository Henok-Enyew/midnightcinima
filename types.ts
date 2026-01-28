
export interface Group {
  id: number;
  name: string;
  score: number;
  isEliminated: boolean;
}

export interface Question {
  id: number;
  text: string;
  points: number;
}

export interface RoundData {
  name: string;
  questions: Question[];
  reserves: Question[];
}

export interface QuestionsData {
  round1: RoundData;
  round2: RoundData;
  round3: RoundData;
}

export enum GamePhase {
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  ELIMINATION = 'ELIMINATION',
  TIE_BREAKER = 'TIE_BREAKER',
  RANDOM_SELECTION = 'RANDOM_SELECTION',
  WINNER = 'WINNER'
}

export enum GameRound {
  ROUND_1 = 1,
  ROUND_2 = 2,
  ROUND_3 = 3
}

export interface GameState {
  phase: GamePhase;
  groups: Group[];
  currentRound: GameRound;
  currentGroupIndex: number;
  currentQuestionIndex: number;
  questionsAnswered: number; // Track questions answered in current round
  timer: number;
  isTimerActive: boolean;
  isQuestionResolved: boolean;
  lastEliminatedGroupId: number | null;
  lastDecision: 'correct' | 'incorrect' | 'timeout' | null;
  tieBreakerQuestions: Question[]; // Questions from reserves for tie-breaker
  tieBreakerIndex: number; // Current tie-breaker question index
  isRandomElimination: boolean; // Flag for random elimination message
  tiedGroupIds: number[]; // IDs of groups that are tied and participating in tie-breaker
}
