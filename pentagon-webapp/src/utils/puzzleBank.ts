/**
 * Pentagon Game - Puzzle Bank
 *
 * 50 curated puzzles with varying difficulty levels.
 * Each puzzle is pre-generated to ensure quality and solvability.
 */

import { Puzzle, ComplexNumber } from '@/types/game';

// Helper function to create puzzle
function createPuzzle(
  id: string,
  name: string,
  difficulty: 'easy' | 'medium' | 'hard',
  par: number,
  startState: ComplexNumber[],
  description?: string,
  category?: string
): Puzzle {
  return {
    id,
    name,
    difficulty,
    par,
    startState,
    description,
    category,
  };
}

// Puzzle Bank: 50 puzzles organized by difficulty
export const PUZZLE_BANK: Puzzle[] = [
  // EASY PUZZLES (1-15): 8-12 optimal moves
  createPuzzle(
    'puzzle-001',
    'First Steps',
    'easy',
    8,
    [
      { real: 1, imag: 1 },
      { real: 0, imag: -1 },
      { real: 0, imag: 0 },
      { real: 0, imag: 0 },
      { real: 0, imag: -1 },
    ],
    'Your first puzzle! Get familiar with the basic moves.',
    'Tutorial'
  ),

  createPuzzle(
    'puzzle-002',
    'Simple Symmetry',
    'easy',
    9,
    [
      { real: -1, imag: 1 },
      { real: 1, imag: 0 },
      { real: 0, imag: 0 },
      { real: 0, imag: 0 },
      { real: 1, imag: 0 },
    ],
    'Notice the symmetric pattern. Use it to your advantage!',
    'Tutorial'
  ),

  createPuzzle(
    'puzzle-003',
    'Real Focus',
    'easy',
    8,
    [
      { real: 2, imag: 0 },
      { real: -1, imag: 0 },
      { real: -1, imag: 0 },
      { real: 0, imag: 0 },
      { real: 0, imag: 0 },
    ],
    'All values are real numbers. Can you clear them efficiently?',
    'Tutorial'
  ),

  createPuzzle(
    'puzzle-004',
    'Imaginary World',
    'easy',
    9,
    [
      { real: 0, imag: 2 },
      { real: 0, imag: -1 },
      { real: 0, imag: 0 },
      { real: 0, imag: -1 },
      { real: 0, imag: 0 },
    ],
    'Pure imaginary numbers only. Think about move B!',
    'Tutorial'
  ),

  createPuzzle(
    'puzzle-005',
    'Corner Start',
    'easy',
    10,
    [
      { real: 3, imag: 2 },
      { real: -1, imag: 0 },
      { real: 0, imag: 0 },
      { real: 0, imag: 0 },
      { real: 0, imag: -1 },
    ],
    'One vertex has a large value. Start there!',
    'Beginner'
  ),

  createPuzzle(
    'puzzle-006',
    'Adjacent Pair',
    'easy',
    10,
    [
      { real: 2, imag: 1 },
      { real: -1, imag: 2 },
      { real: 0, imag: -1 },
      { real: 0, imag: 0 },
      { real: 0, imag: -1 },
    ],
    'Two adjacent vertices need attention.',
    'Beginner'
  ),

  createPuzzle(
    'puzzle-007',
    'Spread Out',
    'easy',
    11,
    [
      { real: 1, imag: 1 },
      { real: 1, imag: 0 },
      { real: 0, imag: 1 },
      { real: 1, imag: 0 },
      { real: 0, imag: 1 },
    ],
    'Values are distributed across all vertices.',
    'Beginner'
  ),

  createPuzzle(
    'puzzle-008',
    'Negative Territory',
    'easy',
    10,
    [
      { real: -2, imag: 1 },
      { real: 1, imag: -1 },
      { real: 1, imag: 0 },
      { real: 0, imag: 0 },
      { real: 0, imag: 1 },
    ],
    'Some vertices have negative values. Use -A and -B wisely!',
    'Beginner'
  ),

  createPuzzle(
    'puzzle-009',
    'Cluster Challenge',
    'easy',
    11,
    [
      { real: 2, imag: -1 },
      { real: 1, imag: 1 },
      { real: 1, imag: 1 },
      { real: 0, imag: -1 },
      { real: 0, imag: 0 },
    ],
    'Three vertices form a cluster.',
    'Beginner'
  ),

  createPuzzle(
    'puzzle-010',
    'Balanced Act',
    'easy',
    12,
    [
      { real: 1, imag: 2 },
      { real: 0, imag: -1 },
      { real: 1, imag: 0 },
      { real: 0, imag: -1 },
      { real: 1, imag: 0 },
    ],
    'Alternate between moves to balance things out.',
    'Beginner'
  ),

  createPuzzle(
    'puzzle-011',
    'Mixed Signals',
    'easy',
    11,
    [
      { real: -1, imag: 2 },
      { real: 2, imag: -1 },
      { real: 0, imag: 1 },
      { real: -1, imag: 0 },
      { real: 0, imag: 0 },
    ],
    'Positive and negative values mixed together.',
    'Intermediate'
  ),

  createPuzzle(
    'puzzle-012',
    'Chain Reaction',
    'easy',
    12,
    [
      { real: 3, imag: 1 },
      { real: -1, imag: 1 },
      { real: 0, imag: -2 },
      { real: 0, imag: 0 },
      { real: 1, imag: 0 },
    ],
    'Each move affects the next. Find the right sequence!',
    'Intermediate'
  ),

  createPuzzle(
    'puzzle-013',
    'Ring Around',
    'easy',
    11,
    [
      { real: 1, imag: 0 },
      { real: 0, imag: 1 },
      { real: 1, imag: 0 },
      { real: 0, imag: 1 },
      { real: 1, imag: 0 },
    ],
    'Values alternate around the pentagon.',
    'Intermediate'
  ),

  createPuzzle(
    'puzzle-014',
    'Double Trouble',
    'easy',
    12,
    [
      { real: 2, imag: 2 },
      { real: -1, imag: -1 },
      { real: 0, imag: 0 },
      { real: 0, imag: 0 },
      { real: -1, imag: -1 },
    ],
    'Large values that need careful reduction.',
    'Intermediate'
  ),

  createPuzzle(
    'puzzle-015',
    'Graduation',
    'easy',
    12,
    [
      { real: 2, imag: -2 },
      { real: 1, imag: 1 },
      { real: -1, imag: 1 },
      { real: 1, imag: -1 },
      { real: 0, imag: 1 },
    ],
    'Final easy puzzle. Ready for medium difficulty?',
    'Intermediate'
  ),

  // MEDIUM PUZZLES (16-35): 12-16 optimal moves
  createPuzzle(
    'puzzle-016',
    'Medium Debut',
    'medium',
    13,
    [
      { real: 3, imag: -1 },
      { real: -2, imag: 2 },
      { real: 1, imag: 0 },
      { real: 0, imag: -1 },
      { real: 1, imag: 0 },
    ],
    'Welcome to medium difficulty!',
    'Intermediate'
  ),

  createPuzzle(
    'puzzle-017',
    'Complex Cluster',
    'medium',
    14,
    [
      { real: 2, imag: 3 },
      { real: -1, imag: -2 },
      { real: 2, imag: 0 },
      { real: -1, imag: 1 },
      { real: 0, imag: -1 },
    ],
    'Large imaginary components dominate.',
    'Intermediate'
  ),

  createPuzzle(
    'puzzle-018',
    'Pentagon Puzzle',
    'medium',
    13,
    [
      { real: 1, imag: 2 },
      { real: 2, imag: 1 },
      { real: 1, imag: -2 },
      { real: -2, imag: 1 },
      { real: 1, imag: -1 },
    ],
    'All five vertices active.',
    'Intermediate'
  ),

  createPuzzle(
    'puzzle-019',
    'Zigzag Pattern',
    'medium',
    14,
    [
      { real: 3, imag: 0 },
      { real: 0, imag: -2 },
      { real: 2, imag: 0 },
      { real: 0, imag: -2 },
      { real: 1, imag: 1 },
    ],
    'Values zigzag around the pentagon.',
    'Intermediate'
  ),

  createPuzzle(
    'puzzle-020',
    'Heavy Hitter',
    'medium',
    15,
    [
      { real: 4, imag: 2 },
      { real: -2, imag: 0 },
      { real: 1, imag: -1 },
      { real: 0, imag: 1 },
      { real: -1, imag: 0 },
    ],
    'One vertex has very large values.',
    'Advanced'
  ),

  createPuzzle(
    'puzzle-021',
    'Symmetry Break',
    'medium',
    14,
    [
      { real: 2, imag: 2 },
      { real: 2, imag: -2 },
      { real: -1, imag: 0 },
      { real: 0, imag: 1 },
      { real: 0, imag: 1 },
    ],
    'Looks symmetric but isn\'t!',
    'Advanced'
  ),

  createPuzzle(
    'puzzle-022',
    'Opposites Attract',
    'medium',
    15,
    [
      { real: 3, imag: -2 },
      { real: -3, imag: 2 },
      { real: 1, imag: 0 },
      { real: 0, imag: -1 },
      { real: 1, imag: 1 },
    ],
    'Opposite values across the pentagon.',
    'Advanced'
  ),

  createPuzzle(
    'puzzle-023',
    'Cascade',
    'medium',
    15,
    [
      { real: 2, imag: 1 },
      { real: 1, imag: 2 },
      { real: 2, imag: 1 },
      { real: 1, imag: -2 },
      { real: -1, imag: 1 },
    ],
    'One move cascades into the next.',
    'Advanced'
  ),

  createPuzzle(
    'puzzle-024',
    'Magnitude',
    'medium',
    16,
    [
      { real: 3, imag: 3 },
      { real: -2, imag: -1 },
      { real: 1, imag: 0 },
      { real: 0, imag: -2 },
      { real: 1, imag: 0 },
    ],
    'High magnitude complex numbers.',
    'Advanced'
  ),

  createPuzzle(
    'puzzle-025',
    'Rotation',
    'medium',
    14,
    [
      { real: 1, imag: 3 },
      { real: 0, imag: -1 },
      { real: 3, imag: 0 },
      { real: -1, imag: 0 },
      { real: 0, imag: -1 },
    ],
    'Think about rotating around the center.',
    'Advanced'
  ),

  createPuzzle(
    'puzzle-026',
    'Tricky Trio',
    'medium',
    15,
    [
      { real: 2, imag: -2 },
      { real: 2, imag: 2 },
      { real: -2, imag: 2 },
      { real: 0, imag: -1 },
      { real: 1, imag: 0 },
    ],
    'Three vertices with large values.',
    'Advanced'
  ),

  createPuzzle(
    'puzzle-027',
    'Wave Function',
    'medium',
    16,
    [
      { real: 1, imag: 2 },
      { real: 2, imag: -1 },
      { real: 1, imag: 2 },
      { real: -2, imag: 1 },
      { real: 1, imag: -2 },
    ],
    'Values oscillate like a wave.',
    'Expert'
  ),

  createPuzzle(
    'puzzle-028',
    'Complex Web',
    'medium',
    15,
    [
      { real: 3, imag: 1 },
      { real: -1, imag: 3 },
      { real: 2, imag: -2 },
      { real: -1, imag: 0 },
      { real: 0, imag: -1 },
    ],
    'Interconnected dependencies.',
    'Expert'
  ),

  createPuzzle(
    'puzzle-029',
    'Precision Required',
    'medium',
    16,
    [
      { real: 4, imag: 0 },
      { real: -2, imag: 2 },
      { real: 0, imag: -2 },
      { real: 2, imag: 0 },
      { real: -1, imag: 1 },
    ],
    'Exact move sequence needed.',
    'Expert'
  ),

  createPuzzle(
    'puzzle-030',
    'Midpoint Marathon',
    'medium',
    16,
    [
      { real: 3, imag: -3 },
      { real: -2, imag: 2 },
      { real: 2, imag: -1 },
      { real: -1, imag: 2 },
      { real: 1, imag: -1 },
    ],
    'You\'re halfway through!',
    'Expert'
  ),

  createPuzzle(
    'puzzle-031',
    'Distribution',
    'medium',
    14,
    [
      { real: 2, imag: 2 },
      { real: 1, imag: 1 },
      { real: 1, imag: 1 },
      { real: 1, imag: -1 },
      { real: -1, imag: 1 },
    ],
    'Evenly distributed complexity.',
    'Expert'
  ),

  createPuzzle(
    'puzzle-032',
    'Star Pattern',
    'medium',
    15,
    [
      { real: 3, imag: 0 },
      { real: 0, imag: 3 },
      { real: -3, imag: 0 },
      { real: 0, imag: -3 },
      { real: 2, imag: 2 },
    ],
    'Values form a star shape in complex plane.',
    'Expert'
  ),

  createPuzzle(
    'puzzle-033',
    'Convergence',
    'medium',
    16,
    [
      { real: 2, imag: 3 },
      { real: 3, imag: -2 },
      { real: -2, imag: -1 },
      { real: 1, imag: 2 },
      { real: 0, imag: -2 },
    ],
    'All paths lead to zero.',
    'Expert'
  ),

  createPuzzle(
    'puzzle-034',
    'Complexity Peak',
    'medium',
    16,
    [
      { real: 4, imag: -2 },
      { real: -3, imag: 3 },
      { real: 2, imag: 0 },
      { real: -1, imag: -1 },
      { real: 1, imag: 2 },
    ],
    'Maximum complexity for medium.',
    'Expert'
  ),

  createPuzzle(
    'puzzle-035',
    'Gateway',
    'medium',
    16,
    [
      { real: 3, imag: 2 },
      { real: -2, imag: 3 },
      { real: 2, imag: -2 },
      { real: -2, imag: 2 },
      { real: 2, imag: -2 },
    ],
    'Ready for hard mode?',
    'Expert'
  ),

  // HARD PUZZLES (36-50): 16-20 optimal moves
  createPuzzle(
    'puzzle-036',
    'Hard Launch',
    'hard',
    17,
    [
      { real: 4, imag: 3 },
      { real: -3, imag: 2 },
      { real: 2, imag: -3 },
      { real: -1, imag: 1 },
      { real: 2, imag: -1 },
    ],
    'Welcome to hard difficulty!',
    'Expert'
  ),

  createPuzzle(
    'puzzle-037',
    'Labyrinth',
    'hard',
    18,
    [
      { real: 5, imag: -2 },
      { real: -3, imag: 4 },
      { real: 2, imag: -2 },
      { real: -2, imag: 2 },
      { real: 1, imag: -3 },
    ],
    'Many paths, one solution.',
    'Expert'
  ),

  createPuzzle(
    'puzzle-038',
    'Maximum Load',
    'hard',
    19,
    [
      { real: 5, imag: 3 },
      { real: -4, imag: -2 },
      { real: 3, imag: -3 },
      { real: -2, imag: 3 },
      { real: 2, imag: -2 },
    ],
    'Large values everywhere.',
    'Expert'
  ),

  createPuzzle(
    'puzzle-039',
    'Interference',
    'hard',
    18,
    [
      { real: 4, imag: -4 },
      { real: -3, imag: 3 },
      { real: 3, imag: -2 },
      { real: -2, imag: 2 },
      { real: 2, imag: -3 },
    ],
    'Moves interfere with each other.',
    'Master'
  ),

  createPuzzle(
    'puzzle-040',
    'Pentagonal Prime',
    'hard',
    19,
    [
      { real: 5, imag: 2 },
      { real: -3, imag: -3 },
      { real: 4, imag: 0 },
      { real: -2, imag: 3 },
      { real: 0, imag: -4 },
    ],
    'Prime complexity level.',
    'Master'
  ),

  createPuzzle(
    'puzzle-041',
    'Chaos Theory',
    'hard',
    20,
    [
      { real: 6, imag: -3 },
      { real: -4, imag: 4 },
      { real: 3, imag: -3 },
      { real: -3, imag: 3 },
      { real: 2, imag: -4 },
    ],
    'Small changes, big effects.',
    'Master'
  ),

  createPuzzle(
    'puzzle-042',
    'Group Theory',
    'hard',
    19,
    [
      { real: 5, imag: -4 },
      { real: -5, imag: 3 },
      { real: 4, imag: -2 },
      { real: -2, imag: 4 },
      { real: 3, imag: -3 },
    ],
    'The math behind the game.',
    'Master'
  ),

  createPuzzle(
    'puzzle-043',
    'Orbital Configuration',
    'hard',
    18,
    [
      { real: 4, imag: 4 },
      { real: -4, imag: -3 },
      { real: 3, imag: 2 },
      { real: -2, imag: -2 },
      { real: 2, imag: 3 },
    ],
    'One of the 162 orbits.',
    'Master'
  ),

  createPuzzle(
    'puzzle-044',
    'Quantum State',
    'hard',
    20,
    [
      { real: 6, imag: 0 },
      { real: -3, imag: 5 },
      { real: 0, imag: -4 },
      { real: 4, imag: 0 },
      { real: -2, imag: 3 },
    ],
    'Superposition of moves.',
    'Master'
  ),

  createPuzzle(
    'puzzle-045',
    'Near Impossible',
    'hard',
    20,
    [
      { real: 5, imag: 5 },
      { real: -5, imag: -4 },
      { real: 4, imag: -3 },
      { real: -3, imag: 4 },
      { real: 3, imag: -3 },
    ],
    'You\'ve come so far!',
    'Master'
  ),

  createPuzzle(
    'puzzle-046',
    'Endurance Test',
    'hard',
    19,
    [
      { real: 6, imag: -2 },
      { real: -4, imag: 4 },
      { real: 3, imag: -4 },
      { real: -3, imag: 3 },
      { real: 4, imag: -2 },
    ],
    'Stay focused!',
    'Master'
  ),

  createPuzzle(
    'puzzle-047',
    'Penultimate',
    'hard',
    20,
    [
      { real: 5, imag: -5 },
      { real: -5, imag: 4 },
      { real: 4, imag: -4 },
      { real: -4, imag: 3 },
      { real: 3, imag: -2 },
    ],
    'Almost there!',
    'Master'
  ),

  createPuzzle(
    'puzzle-048',
    'Final Challenge',
    'hard',
    20,
    [
      { real: 6, imag: -4 },
      { real: -5, imag: 5 },
      { real: 4, imag: -5 },
      { real: -4, imag: 4 },
      { real: 3, imag: -3 },
    ],
    'The ultimate test.',
    'Master'
  ),

  createPuzzle(
    'puzzle-049',
    'Bonus Round',
    'hard',
    18,
    [
      { real: 4, imag: 5 },
      { real: -4, imag: -4 },
      { real: 5, imag: -2 },
      { real: -3, imag: 3 },
      { real: 2, imag: -4 },
    ],
    'Bonus puzzle for the dedicated.',
    'Master'
  ),

  createPuzzle(
    'puzzle-050',
    'Perfect Completion',
    'hard',
    20,
    [
      { real: 7, imag: -3 },
      { real: -5, imag: 5 },
      { real: 4, imag: -6 },
      { real: -4, imag: 5 },
      { real: 5, imag: -4 },
    ],
    'Congratulations, mathematician! You\'ve mastered the Pentagon Game!',
    'Master'
  ),
];

// Utility functions
export function getPuzzleById(id: string): Puzzle | undefined {
  return PUZZLE_BANK.find(p => p.id === id);
}

export function getPuzzlesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Puzzle[] {
  return PUZZLE_BANK.filter(p => p.difficulty === difficulty);
}

export function getNextPuzzle(currentId: string): Puzzle | null {
  const currentIndex = PUZZLE_BANK.findIndex(p => p.id === currentId);
  if (currentIndex === -1 || currentIndex === PUZZLE_BANK.length - 1) {
    return null;
  }
  return PUZZLE_BANK[currentIndex + 1];
}

export function getPreviousPuzzle(currentId: string): Puzzle | null {
  const currentIndex = PUZZLE_BANK.findIndex(p => p.id === currentId);
  if (currentIndex <= 0) {
    return null;
  }
  return PUZZLE_BANK[currentIndex - 1];
}

export function getTotalPuzzles(): number {
  return PUZZLE_BANK.length;
}

export function getTotalStars(): number {
  return PUZZLE_BANK.length * 3; // 3 stars per puzzle
}
