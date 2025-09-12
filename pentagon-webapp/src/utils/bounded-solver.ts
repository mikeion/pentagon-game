// Simple bounded BFS solver for real-time hints
// Keeps coefficients in reasonable range for playable game

import { ComplexNumber, SolverMove } from '@/types/game';

// Move definitions
const moves = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: -1, imag: 0 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 1, imag: 0 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
};

// Pentagon adjacency
const adjacency: Record<number, number[]> = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0],
};

// Get state key for memoization
function getStateKey(state: ComplexNumber[]): string {
  return state.map(v => `${v.real},${v.imag}`).join('|');
}

// Apply move to specific vertex
function applyMove(
  state: ComplexNumber[], 
  vertex: number, 
  moveType: 'A' | 'B' | 'C' | 'D', 
  operation: 'add' | 'subtract' = 'add'
): ComplexNumber[] {
  const newState = state.map(v => ({ real: v.real, imag: v.imag }));
  const move = moves[moveType];
  const multiplier = operation === 'subtract' ? -1 : 1;
  
  // Apply to selected vertex
  newState[vertex].real += move.vertex.real * multiplier;
  newState[vertex].imag += move.vertex.imag * multiplier;
  
  // Apply to adjacent vertices
  for (const adj of adjacency[vertex]) {
    newState[adj].real += move.adjacent.real * multiplier;
    newState[adj].imag += move.adjacent.imag * multiplier;
  }
  
  return newState;
}

// Check if state is within reasonable bounds
function isStateBounded(state: ComplexNumber[], minBound = -10, maxBound = 10): boolean {
  return state.every(v => 
    v.real >= minBound && v.real <= maxBound &&
    v.imag >= minBound && v.imag <= maxBound
  );
}

export interface HintResult {
  found: boolean;
  hint: string;
  moves?: SolverMove[];
  timeMs: number;
}

// Fast BFS solver with bounds checking
export async function getHint(
  currentState: ComplexNumber[],
  goalState: ComplexNumber[],
  maxDepth: number = 6,
  timeoutMs: number = 3000
): Promise<HintResult> {
  const startTime = Date.now();
  
  // Check if already at goal
  const currentKey = getStateKey(currentState);
  const goalKey = getStateKey(goalState);
  
  if (currentKey === goalKey) {
    return {
      found: true,
      hint: 'Already solved! 🎉',
      moves: [],
      timeMs: 0
    };
  }
  
  // BFS with bounded search
  const queue = [{ 
    state: currentState, 
    moves: [] as SolverMove[], 
    depth: 0 
  }];
  
  const visited = new Set<string>([currentKey]);
  const moveTypes: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const operations: ('add' | 'subtract')[] = ['add', 'subtract'];
  
  let nodesExplored = 0;
  
  while (queue.length > 0) {
    // Check timeout
    if (Date.now() - startTime > timeoutMs) {
      return {
        found: false,
        hint: `Hint timeout - try making some moves and ask again!`,
        timeMs: Date.now() - startTime
      };
    }
    
    const current = queue.shift()!;
    nodesExplored++;
    
    if (current.depth >= maxDepth) continue;
    
    // Try all possible moves
    for (let vertex = 0; vertex < 5; vertex++) {
      for (const moveType of moveTypes) {
        for (const operation of operations) {
          const newState = applyMove(current.state, vertex, moveType, operation);
          
          // Skip if out of bounds
          if (!isStateBounded(newState)) continue;
          
          const newKey = getStateKey(newState);
          
          // Check if we found the goal
          if (newKey === goalKey) {
            const nextMove = { vertex, moveType, operation };
            const moves = [...current.moves, nextMove];
            const opText = operation === 'add' ? 'Tap' : 'Long press';
            
            return {
              found: true,
              hint: `${opText} Move ${moveType} on V${vertex} (${moves.length} moves to goal)`,
              moves: moves,
              timeMs: Date.now() - startTime
            };
          }
          
          // Add to queue if not visited
          if (!visited.has(newKey)) {
            visited.add(newKey);
            queue.push({
              state: newState,
              moves: [...current.moves, { vertex, moveType, operation }],
              depth: current.depth + 1
            });
          }
        }
      }
    }
    
    // Yield control periodically
    if (nodesExplored % 50 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  // No solution found within depth
  return {
    found: false,
    hint: `No solution found within ${maxDepth} moves. Try Reset or New Puzzle!`,
    timeMs: Date.now() - startTime
  };
}