import { ComplexNumber, MoveType, SolverResult, SolverMove } from '@/types/game';

// Move definitions (corrected to match Alex's PDF)
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

function getStateKey(state: ComplexNumber[]): string {
  return state.map(v => `${v.real},${v.imag}`).join('|');
}

function applyMoveToState(
  state: ComplexNumber[], 
  vertex: number, 
  moveType: MoveType, 
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

export function solvePuzzle(
  startState: ComplexNumber[], 
  goalState: ComplexNumber[], 
  maxDepth: number = 6
): Promise<SolverResult> {
  return new Promise((resolve) => {
    const startKey = getStateKey(startState);
    const goalKey = getStateKey(goalState);
    
    if (startKey === goalKey) {
      resolve({ found: true, moves: [], message: "Already solved!" });
      return;
    }
    
    // BFS queue: {state, moves, depth}
    const queue = [{ state: startState, moves: [] as SolverMove[], depth: 0 }];
    const visited = new Set([startKey]);
    const moveTypes: MoveType[] = ['A', 'B', 'C', 'D'];
    const operations: ('add' | 'subtract')[] = ['add', 'subtract'];
    
    console.log('Starting BFS solver...');
    let nodesExplored = 0;
    let maxQueueSize = 0;
    
    const processNextBatch = () => {
      const batchSize = 100; // Process in batches to avoid blocking
      let processed = 0;
      
      while (queue.length > 0 && processed < batchSize) {
        const current = queue.shift()!;
        nodesExplored++;
        processed++;
        
        if (current.depth >= maxDepth) {
          continue;
        }
        
        // Try all possible moves from current state
        for (let vertex = 0; vertex < 5; vertex++) {
          for (const moveType of moveTypes) {
            for (const operation of operations) {
              const newState = applyMoveToState(current.state, vertex, moveType, operation);
              const newKey = getStateKey(newState);
              
              // Check if we found the goal
              if (newKey === goalKey) {
                const solution = [...current.moves, { vertex, moveType, operation }];
                console.log(`Solution found in ${solution.length} moves after exploring ${nodesExplored} nodes!`);
                resolve({
                  found: true,
                  moves: solution,
                  message: `Solved in ${solution.length} moves!`,
                  nodesExplored: nodesExplored
                });
                return;
              }
              
              // Add to queue if not visited
              if (!visited.has(newKey)) {
                visited.add(newKey);
                queue.push({
                  state: newState,
                  moves: [...current.moves, { vertex, moveType, operation }],
                  depth: current.depth + 1
                });
                maxQueueSize = Math.max(maxQueueSize, queue.length);
              }
            }
          }
        }
      }
      
      // Progress indicator
      if (nodesExplored % 500 === 0) {
        console.log(`Explored ${nodesExplored} nodes, ${visited.size} unique states, queue: ${queue.length}`);
      }
      
      if (queue.length > 0) {
        // Continue processing in next tick
        setTimeout(processNextBatch, 0);
      } else {
        // Search completed without finding solution
        console.log(`Search completed. Explored ${nodesExplored} nodes, found ${visited.size} unique states.`);
        console.log(`Max queue size: ${maxQueueSize}`);
        
        resolve({
          found: false,
          moves: [],
          message: `No solution found within ${maxDepth} moves`,
          nodesExplored: nodesExplored
        });
      }
    };
    
    // Start processing
    processNextBatch();
  });
}

export function getHint(
  currentState: ComplexNumber[], 
  goalState: ComplexNumber[]
): Promise<SolverResult> {
  return solvePuzzle(currentState, goalState, 5); // Limit depth for faster hints
}