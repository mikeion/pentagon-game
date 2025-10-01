import { ComplexNumber, GameState, MoveType } from '../types/game';

// Matrix representation from Alex's LaTeX document (main.tex)
// This is the correct M̄⁻¹ matrix: (1/6) * the matrix below
const MATRIX_INVERSE = [
  [{ real: 3/6, imag: 1/6 }, { real: 1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }, { real: 1/6, imag: -1/6 }],
  [{ real: 1/6, imag: -1/6 }, { real: 3/6, imag: 1/6 }, { real: 1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }],
  [{ real: -1/6, imag: -1/6 }, { real: 1/6, imag: -1/6 }, { real: 3/6, imag: 1/6 }, { real: 1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }],
  [{ real: -1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }, { real: 1/6, imag: -1/6 }, { real: 3/6, imag: 1/6 }, { real: 1/6, imag: -1/6 }],
  [{ real: 1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }, { real: 1/6, imag: -1/6 }, { real: 3/6, imag: 1/6 }]
];

// Move definitions mapping complex numbers to move types (CORRECTED to match Alex's paper)
// Must match PentagonGame.tsx exactly
const MOVE_MAPPINGS = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 1, imag: 0 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: -1, imag: 0 } },
};

// Pentagon adjacency
const adjacency: Record<number, number[]> = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0]
};

function complexMultiply(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return {
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real
  };
}

function complexAdd(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return {
    real: a.real + b.real,
    imag: a.imag + b.imag
  };
}

// Removed unused function - we use negation directly in calculateDifferenceVector

// Calculate the difference vector from current state to goal (0+0i)
function calculateDifferenceVector(current: GameState): ComplexNumber[] {
  // Since goal is always [0+0i, 0+0i, 0+0i, 0+0i, 0+0i]
  // The difference is simply -current
  return current.vertices.map(vertex => ({
    real: -vertex.real,
    imag: -vertex.imag
  }));
}

// Apply the inverse matrix to get the solution vector
function applySolutionMatrix(difference: ComplexNumber[]): ComplexNumber[] {
  const solution: ComplexNumber[] = [];

  for (let i = 0; i < 5; i++) {
    let sum: ComplexNumber = { real: 0, imag: 0 };
    for (let j = 0; j < 5; j++) {
      const product = complexMultiply(MATRIX_INVERSE[i][j], difference[j]);
      sum = complexAdd(sum, product);
    }
    solution.push(sum);
  }

  return solution;
}

// Simulate applying a move to a state
function simulateMove(state: ComplexNumber[], vertex: number, moveType: MoveType): ComplexNumber[] {
  const newState = state.map(v => ({ ...v }));
  const move = MOVE_MAPPINGS[moveType];

  // Apply to selected vertex
  newState[vertex].real += move.vertex.real;
  newState[vertex].imag += move.vertex.imag;

  // Apply to adjacent vertices
  for (const adj of adjacency[vertex]) {
    newState[adj].real += move.adjacent.real;
    newState[adj].imag += move.adjacent.imag;
  }

  return newState;
}

// Check if state is close to zero
function isNearZero(state: ComplexNumber[], epsilon: number = 0.01): boolean {
  return state.every(v =>
    Math.abs(v.real) < epsilon && Math.abs(v.imag) < epsilon
  );
}

// Convert solution vector to move sequence using greedy approach
function solutionToMoves(_solution: ComplexNumber[], currentState: ComplexNumber[]): string[] {
  const moves: string[] = [];
  let state = currentState.map(v => ({ ...v }));
  const maxIterations = 20;

  // Try to find moves that reduce the distance to zero
  for (let iter = 0; iter < maxIterations; iter++) {
    if (isNearZero(state)) break;

    let bestMove: { vertex: number; type: MoveType } | null = null;
    let bestDistance = Infinity;

    // Try all possible moves
    for (let vertex = 0; vertex < 5; vertex++) {
      for (const moveType of ['A', 'B', 'C', 'D'] as MoveType[]) {
        const newState = simulateMove(state, vertex, moveType);
        const distance = newState.reduce((sum, v) =>
          sum + Math.sqrt(v.real * v.real + v.imag * v.imag), 0
        );

        if (distance < bestDistance) {
          bestDistance = distance;
          bestMove = { vertex, type: moveType };
        }
      }
    }

    if (bestMove && bestDistance < state.reduce((sum, v) =>
      sum + Math.sqrt(v.real * v.real + v.imag * v.imag), 0)) {
      moves.push(`${bestMove.type}${bestMove.vertex}`);
      state = simulateMove(state, bestMove.vertex, bestMove.type);
    } else {
      break; // No improvement found
    }
  }

  return moves;
}

export interface MatrixSolution {
  moves: string[];
  solutionVector: ComplexNumber[];
  isExact: boolean;
}

export async function solveWithMatrix(
  initialState: GameState
): Promise<MatrixSolution | null> {
  try {
    console.log('Matrix solver input state:', initialState.vertices);

    // Calculate the difference vector (goal is always zero)
    const difference = calculateDifferenceVector(initialState);
    console.log('Difference vector:', difference);

    // Apply the inverse matrix to get solution
    const solutionVector = applySolutionMatrix(difference);
    console.log('Solution vector:', solutionVector);

    // Convert to move sequence using greedy approach
    const moves = solutionToMoves(solutionVector, initialState.vertices);
    console.log('Generated moves:', moves);

    return {
      moves,
      solutionVector,
      isExact: false // Using greedy approximation
    };
  } catch (error) {
    console.error('Matrix solver error:', error);
    return null;
  }
}

// Get hint using matrix solver
export async function getMatrixHint(
  currentState: GameState,
  maxMoves: number = 3
): Promise<string[]> {
  const solution = await solveWithMatrix(currentState);

  if (solution && solution.moves.length > 0) {
    return solution.moves.slice(0, maxMoves);
  }

  return [];
}

// Debug function to show solution vector
export function debugSolutionVector(state: GameState): void {
  const difference = calculateDifferenceVector(state);
  const solution = applySolutionMatrix(difference);

  console.log('Current state:', state.vertices);
  console.log('Difference vector (to reach zero):', difference);
  console.log('Solution vector:', solution);

  solution.forEach((v, i) => {
    const magnitude = Math.sqrt(v.real * v.real + v.imag * v.imag);
    const angle = Math.atan2(v.imag, v.real) * 180 / Math.PI;
    console.log(`Vertex ${i}: ${v.real.toFixed(3)} + ${v.imag.toFixed(3)}i (mag: ${magnitude.toFixed(3)}, angle: ${angle.toFixed(1)}°)`);
  });
}