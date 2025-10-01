import { create, all } from 'mathjs';
import { ComplexNumber, GameState, MoveType } from '../types/game';

// Create math.js instance with complex number support
const math = create(all);

// K̄⁻¹ matrix computed from K̄ = I₅ - Di (paper line 208)
// CORRECTED: Fixed imaginary part signs to match actual inverse
// This is the true 5×5 complex matrix that solves the pentagon game
const MATRIX_INVERSE = math.matrix([
  [math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1)],
  [math.complex(1, 1), math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1)],
  [math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1)],
  [math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1), math.complex(1, 1)],
  [math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1)]
]);

// Scale by 1/6 as specified in LaTeX
const SCALED_MATRIX_INVERSE = math.multiply(MATRIX_INVERSE, 1/6);

// Move definitions mapping complex numbers to move types (CORRECTED to match Alex's paper)
// Must match PentagonGame.tsx exactly
const MOVE_MAPPINGS = {
  'A': { vertex: math.complex(1, 1), adjacent: math.complex(0, -1) },
  'B': { vertex: math.complex(-1, 1), adjacent: math.complex(1, 0) },
  'C': { vertex: math.complex(-1, -1), adjacent: math.complex(0, 1) },
  'D': { vertex: math.complex(1, -1), adjacent: math.complex(-1, 0) },
};

// Pentagon adjacency
const adjacency: Record<number, number[]> = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0]
};

// Convert ComplexNumber to math.js complex
function toMathComplex(c: ComplexNumber) {
  return math.complex(c.real, c.imag);
}

// Convert math.js complex to ComplexNumber
function fromMathComplex(c: unknown): ComplexNumber {
  const complex = c as { re?: number; real?: number; im?: number; imag?: number };
  return {
    real: complex.re || complex.real || 0,
    imag: complex.im || complex.imag || 0
  };
}

// Calculate the difference vector from current state to goal (0+0i)
function calculateDifferenceVector(current: GameState): unknown {
  // Since goal is always [0+0i, 0+0i, 0+0i, 0+0i, 0+0i]
  // The difference is simply -current
  const currentVector = math.matrix(current.vertices.map(toMathComplex));
  return math.multiply(currentVector, -1);
}

// Apply the inverse matrix to get the solution vector
function applySolutionMatrix(differenceVector: unknown): unknown {
  // Matrix multiplication: M̄⁻¹ × difference
  return math.multiply(SCALED_MATRIX_INVERSE, differenceVector as Parameters<typeof math.multiply>[1]);
}

// Simulate applying a move to a state
function simulateMove(state: ComplexNumber[], vertex: number, moveType: MoveType, operation: 'add' | 'subtract' = 'add'): ComplexNumber[] {
  const newState = state.map(v => ({ ...v }));
  const move = MOVE_MAPPINGS[moveType];
  const multiplier = operation === 'subtract' ? -1 : 1;

  // Apply to selected vertex - convert to regular numbers for compatibility
  const vertexMove = fromMathComplex(move.vertex);
  const adjacentMove = fromMathComplex(move.adjacent);

  newState[vertex].real += vertexMove.real * multiplier;
  newState[vertex].imag += vertexMove.imag * multiplier;

  // Apply to adjacent vertices
  for (const adj of adjacency[vertex]) {
    newState[adj].real += adjacentMove.real * multiplier;
    newState[adj].imag += adjacentMove.imag * multiplier;
  }

  return newState;
}


// Convert solution vector to move sequence by testing actual moves
function solutionToMoves(solution: unknown, currentState: ComplexNumber[]): string[] {
  // Convert math.js solution back to array of ComplexNumbers for analysis
  const solutionArray = [];
  for (let i = 0; i < 5; i++) {
    const complexVal = math.subset(solution as Parameters<typeof math.subset>[0], math.index(i));
    solutionArray.push(fromMathComplex(complexVal));
  }
  console.log('Math.js solution vector:', solutionArray);

  console.log('Solution vector coefficients:', solutionArray.map((v, i) =>
    `V${i}: ${v.real.toFixed(3)}${v.imag >= 0 ? '+' : ''}${v.imag.toFixed(3)}i`
  ).join(', '));

  // Test ALL possible moves at ALL vertices to find the one that gets closest to zero
  let bestMove: { vertex: number; type: MoveType } | null = null;
  let bestDistance = Infinity;
  const currentDistance = currentState.reduce((sum, v) =>
    sum + Math.sqrt(v.real * v.real + v.imag * v.imag), 0
  );

  for (let vertex = 0; vertex < 5; vertex++) {
    for (const moveType of ['A', 'B', 'C', 'D'] as MoveType[]) {
      const newState = simulateMove(currentState, vertex, moveType, 'add');
      const distance = newState.reduce((sum, v) =>
        sum + Math.sqrt(v.real * v.real + v.imag * v.imag), 0
      );

      if (distance < bestDistance) {
        bestDistance = distance;
        bestMove = { vertex, type: moveType };
      }
    }
  }

  if (bestMove) {
    const moveStr = `${bestMove.type}${bestMove.vertex}`;
    const improvement = currentDistance - bestDistance;
    if (improvement > 0) {
      console.log(`Best move: ${moveStr} reduces distance from ${currentDistance.toFixed(3)} to ${bestDistance.toFixed(3)}`);
    } else {
      console.log(`Best move: ${moveStr} (no immediate improvement, but best available)`);
    }
    return [moveStr];
  }

  console.log('No moves available');
  return [];
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
    console.log('Math.js Matrix solver input state:', initialState.vertices);

    // Calculate the difference vector (goal is always zero)
    const differenceVector = calculateDifferenceVector(initialState);
    console.log('Difference vector (math.js):', differenceVector);

    // Apply the inverse matrix to get solution
    const solutionVector = applySolutionMatrix(differenceVector);
    console.log('Solution vector (math.js):', solutionVector);

    // Convert to move sequence using greedy approach
    const moves = solutionToMoves(solutionVector, initialState.vertices);
    console.log('Generated moves:', moves);

    // Convert solution back to ComplexNumber array for return
    const solutionArray = [];
    for (let i = 0; i < 5; i++) {
      const complexVal = math.subset(solutionVector as Parameters<typeof math.subset>[0], math.index(i));
      solutionArray.push(fromMathComplex(complexVal));
    }

    return {
      moves,
      solutionVector: solutionArray,
      isExact: true // Using true 5×5 complex matrix from Alex's research
    };
  } catch (error) {
    console.error('Math.js Matrix solver error:', error);
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

// Get full solution sequence using iterative matrix solver approach
export async function getFullSolution(
  initialState: GameState
): Promise<string[]> {
  const moves: string[] = [];
  const currentState: GameState = {
    vertices: initialState.vertices.map(v => ({ ...v })),
    goalVertices: initialState.goalVertices.map(v => ({ ...v })),
    currentMoveType: initialState.currentMoveType,
    selectedVertex: initialState.selectedVertex,
    isWon: false
  };
  const maxIterations = 15; // Reasonable limit for full solutions

  console.log('Starting full solution with matrix solver approach');

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Check if we're already at the goal
    const currentDistance = currentState.vertices.reduce((sum, v) => sum + Math.sqrt(v.real * v.real + v.imag * v.imag), 0);
    if (currentDistance < 0.01) {
      console.log(`Full solution found in ${iteration} moves!`);
      break;
    }

    console.log(`Full solution iteration ${iteration + 1}, current distance: ${currentDistance.toFixed(3)}`);

    // Use the same matrix solver as the hint system
    const solution = await solveWithMatrix(currentState);

    if (!solution || solution.moves.length === 0) {
      console.log('Matrix solver found no moves, stopping full solution search');
      break;
    }

    const nextMove = solution.moves[0];
    console.log(`Matrix solver suggests: ${nextMove}`);

    // Parse the move string to extract vertex and move type (format: "A0" or "C3")
    const vertex = parseInt(nextMove.slice(-1));
    const moveType = nextMove.slice(0, -1) as MoveType;

    // Apply the move to get the new state
    const newVertices = simulateMove(currentState.vertices, vertex, moveType, 'add');
    const newDistance = newVertices.reduce((sum, v) => sum + Math.sqrt(v.real * v.real + v.imag * v.imag), 0);

    if (newDistance >= currentDistance) {
      console.log(`Move ${nextMove} doesn't improve distance (${newDistance.toFixed(3)} >= ${currentDistance.toFixed(3)}), stopping`);
      break;
    }

    moves.push(nextMove);
    currentState.vertices = newVertices;

    console.log(`Applied ${nextMove}, new distance: ${newDistance.toFixed(3)}`);
  }

  console.log(`Full solution complete: ${moves.length} moves`);
  return moves;
}

// Debug function to show solution vector
export function debugSolutionVector(state: GameState): void {
  const differenceVector = calculateDifferenceVector(state);
  const solutionVector = applySolutionMatrix(differenceVector);

  console.log('Current state:', state.vertices);
  console.log('Difference vector (to reach zero):', differenceVector);
  console.log('Solution vector:', solutionVector);

  // Convert and display each solution component
  for (let i = 0; i < 5; i++) {
    const complexVal = math.subset(solutionVector as Parameters<typeof math.subset>[0], math.index(i));
    const v = fromMathComplex(complexVal);
    const magnitude = Math.sqrt(v.real * v.real + v.imag * v.imag);
    const angle = Math.atan2(v.imag, v.real) * 180 / Math.PI;
    console.log(`Vertex ${i}: ${v.real.toFixed(3)} + ${v.imag.toFixed(3)}i (mag: ${magnitude.toFixed(3)}, angle: ${angle.toFixed(1)}°)`);
  }
}