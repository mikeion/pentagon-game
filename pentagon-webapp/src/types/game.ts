export interface ComplexNumber {
  real: number;
  imag: number;
}

// Internal: All 4 moves for solver (C = -A, D = -B mathematically)
export type MoveType = 'A' | 'B' | 'C' | 'D';

// UI: Only show A and B to users (right-click applies negative)
export type UIMoveType = 'A' | 'B';

export interface Move {
  vertex: ComplexNumber;
  adjacent: ComplexNumber;
}

export interface GameState {
  vertices: ComplexNumber[];
  goalVertices: ComplexNumber[];
  currentMoveType: MoveType;
  selectedVertex: number | undefined;
  isWon: boolean;
}

export interface SolverResult {
  found: boolean;
  moves: SolverMove[];
  message: string;
  nodesExplored?: number;
}

export interface SolverMove {
  vertex: number;
  moveType: MoveType;
  operation: 'add' | 'subtract';
}

export interface VertexPosition {
  x: number;
  y: number;
}

// Puzzle & Campaign System
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Puzzle {
  id: string;
  name: string;
  difficulty: Difficulty;
  par: number; // Optimal move count
  category?: string; // e.g., "Tutorial", "Advanced", "Expert"
  startState: ComplexNumber[]; // Initial vertex values
  description?: string;
}

export interface PuzzleAttempt {
  puzzleId: string;
  completed: boolean;
  moves: number;
  time: number; // milliseconds
  stars: 1 | 2 | 3;
  hintsUsed: number;
  solutionViewed: boolean;
  timestamp: number;
}

export interface PuzzleRecord {
  puzzleId: string;
  bestMoves: number;
  bestTime: number;
  bestStars: 1 | 2 | 3;
  attempts: number;
  completions: number;
  firstCompletedAt?: number;
  lastCompletedAt?: number;
}

// Player Stats & Progress
export interface PlayerStats {
  totalPuzzlesSolved: number;
  totalStarsEarned: number;
  totalMoves: number;
  totalPlayTime: number; // milliseconds
  averageMoves: number;
  averageTime: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string; // ISO date string
  hintsUsed: number;
  solutionsViewed: number;
  achievementsUnlocked: string[];
}

export interface CampaignProgress {
  unlockedPuzzles: string[]; // Puzzle IDs
  completedPuzzles: string[]; // Puzzle IDs
  puzzleRecords: Record<string, PuzzleRecord>; // puzzleId -> PuzzleRecord
  currentPuzzle: string | null; // Currently active puzzle ID
}

// Achievements
export type AchievementId =
  | 'first_steps'
  | 'perfectionist_10'
  | 'star_collector_50'
  | 'constellation_150'
  | 'hot_streak_5'
  | 'einstein'
  | 'speed_demon'
  | 'sharpshooter'
  | 'mathematician'
  | 'night_owl'
  | 'early_bird'
  | 'century_100'
  | 'group_theory_master'
  | 'challenger_10'
  | 'dedicated_30';

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  unlocked: boolean;
  unlockedAt?: number; // timestamp
  progress?: number; // for progressive achievements
  maxProgress?: number; // for progressive achievements
}

// Daily Challenge
export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  puzzle: Puzzle;
  completed: boolean;
  attempt?: PuzzleAttempt;
}

// Settings
export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  theme: 'dark' | 'light' | 'auto';
  showTutorial: boolean;
}