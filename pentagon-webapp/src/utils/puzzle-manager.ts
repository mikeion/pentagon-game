// Pre-computed puzzle management system
import { ComplexNumber, SolverMove } from '@/types/game';
import puzzleData from '@/data/precomputed-puzzles.json';

export interface PrecomputedPuzzle {
  id: string;
  startState: ComplexNumber[];
  goalState: ComplexNumber[];
  difficulty: 'easy' | 'medium' | 'hard';
  solution: SolverMove[];
  solutionLength: number;
  generationMoves: number;
}

export interface PuzzleDatabase {
  generated: string;
  count: number;
  puzzles: PrecomputedPuzzle[];
}

class PuzzleManager {
  private puzzles: PrecomputedPuzzle[] = [];
  private currentPuzzleIndex = 0;

  constructor() {
    this.loadPuzzles();
  }

  private loadPuzzles() {
    const data = puzzleData as PuzzleDatabase;
    this.puzzles = data.puzzles;
    console.log(`🎯 Loaded ${this.puzzles.length} pre-computed puzzles`);
    console.log(`📅 Generated: ${data.generated}`);
  }

  // Get current puzzle
  getCurrentPuzzle(): PrecomputedPuzzle {
    return this.puzzles[this.currentPuzzleIndex];
  }

  // Get next puzzle (cycles through all puzzles)
  getNextPuzzle(): PrecomputedPuzzle {
    this.currentPuzzleIndex = (this.currentPuzzleIndex + 1) % this.puzzles.length;
    const puzzle = this.getCurrentPuzzle();
    console.log(`🎲 Switched to puzzle: ${puzzle.id} (${puzzle.difficulty})`);
    return puzzle;
  }

  // Get random puzzle of specific difficulty
  getRandomPuzzle(difficulty?: 'easy' | 'medium' | 'hard'): PrecomputedPuzzle {
    const filteredPuzzles = difficulty 
      ? this.puzzles.filter(p => p.difficulty === difficulty)
      : this.puzzles;
    
    const randomIndex = Math.floor(Math.random() * filteredPuzzles.length);
    const selectedPuzzle = filteredPuzzles[randomIndex];
    
    // Update current index to match the selected puzzle
    this.currentPuzzleIndex = this.puzzles.indexOf(selectedPuzzle);
    
    console.log(`🎲 Selected random ${difficulty || 'any'} puzzle: ${selectedPuzzle.id}`);
    return selectedPuzzle;
  }

  // Find puzzle by exact state match
  findPuzzleByState(state: ComplexNumber[]): PrecomputedPuzzle | null {
    const stateKey = this.getStateKey(state);
    
    for (const puzzle of this.puzzles) {
      if (this.getStateKey(puzzle.startState) === stateKey) {
        console.log(`🔍 Found matching puzzle: ${puzzle.id}`);
        return puzzle;
      }
    }
    
    console.log('🔍 No matching puzzle found for current state');
    return null;
  }

  // Get hint for current game state
  getHint(currentState: ComplexNumber[]): { hint: string; nextMove?: SolverMove } | null {
    const puzzle = this.findPuzzleByState(currentState);
    
    if (!puzzle) {
      return { hint: "No hint available for this puzzle state." };
    }

    if (puzzle.solution.length === 0) {
      return { hint: "Already solved! 🎉" };
    }

    const nextMove = puzzle.solution[0];
    const operation = nextMove.operation === 'add' ? 'Apply' : 'Subtract';
    
    return {
      hint: `${operation} Move ${nextMove.moveType} (${puzzle.solutionLength} moves total)`,
      nextMove
    };
  }

  // Get puzzle statistics
  getStats() {
    const stats = {
      total: this.puzzles.length,
      easy: this.puzzles.filter(p => p.difficulty === 'easy').length,
      medium: this.puzzles.filter(p => p.difficulty === 'medium').length,
      hard: this.puzzles.filter(p => p.difficulty === 'hard').length,
      avgSolutionLength: this.puzzles.reduce((sum, p) => sum + p.solutionLength, 0) / this.puzzles.length
    };
    
    return stats;
  }

  private getStateKey(state: ComplexNumber[]): string {
    return state.map(v => `${v.real},${v.imag}`).join('|');
  }
}

// Singleton instance
export const puzzleManager = new PuzzleManager();