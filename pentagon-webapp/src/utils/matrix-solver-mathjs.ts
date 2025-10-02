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


// Convert solution vector to move sequence by interpreting coefficients
// The solution vector tells us the linear combination of A and B moves per vertex
function solutionToMoves(solution: unknown, currentState: ComplexNumber[]): string[] {
  // Convert math.js solution back to array of ComplexNumbers
  const solutionArray = [];
  for (let i = 0; i < 5; i++) {
    const complexVal = math.subset(solution as Parameters<typeof math.subset>[0], math.index(i));
    solutionArray.push(fromMathComplex(complexVal));
  }
  console.log('Math.js solution vector:', solutionArray);

  console.log('Solution vector coefficients:', solutionArray.map((v, i) =>
    `V${i}: ${v.real.toFixed(3)}${v.imag >= 0 ? '+' : ''}${v.imag.toFixed(3)}i`
  ).join(', '));

  // The solution vector coefficient at vertex i is: real*B + imag*A
  // We need to round to nearest integer and apply that many moves
  const moves: string[] = [];

  for (let vertex = 0; vertex < 5; vertex++) {
    const coeff = solutionArray[vertex];

    // Round to nearest integers
    const numBMoves = Math.round(coeff.real);
    const numAMoves = Math.round(coeff.imag);

    // Apply A moves (or -A if negative)
    if (numAMoves > 0) {
      for (let i = 0; i < numAMoves; i++) {
        moves.push(`A${vertex}`);
      }
    } else if (numAMoves < 0) {
      for (let i = 0; i < -numAMoves; i++) {
        moves.push(`C${vertex}`);
      }
    }

    // Apply B moves (or -B if negative)
    if (numBMoves > 0) {
      for (let i = 0; i < numBMoves; i++) {
        moves.push(`B${vertex}`);
      }
    } else if (numBMoves < 0) {
      for (let i = 0; i < -numBMoves; i++) {
        moves.push(`D${vertex}`);
      }
    }
  }

  console.log(`Generated ${moves.length} moves from solution coefficients:`, moves);
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

// Simplify and organize move sequence
// Since the group is abelian, we can reorder and combine moves
// Returns moves organized as: all A moves, then B moves, then -A (C), then -B (D)
function simplifyMoves(moves: string[]): string[] {
  // Count moves per vertex: moveCount[vertex][moveType] = count
  const moveCount: Record<number, Record<string, number>> = {};

  for (const moveStr of moves) {
    const vertex = parseInt(moveStr.slice(-1));
    const moveType = moveStr.slice(0, -1);

    if (!moveCount[vertex]) {
      moveCount[vertex] = {};
    }
    moveCount[vertex][moveType] = (moveCount[vertex][moveType] || 0) + 1;
  }

  // Now simplify: A and C cancel, B and D cancel
  // Then organize by move type: A, B, -A (C), -B (D)
  const aMoves: string[] = [];
  const bMoves: string[] = [];
  const cMoves: string[] = [];
  const dMoves: string[] = [];

  for (const vertex of Object.keys(moveCount).map(Number).sort()) {
    const counts = moveCount[vertex];

    // A - C (net A moves)
    const netA = (counts['A'] || 0) - (counts['C'] || 0);
    // B - D (net B moves)
    const netB = (counts['B'] || 0) - (counts['D'] || 0);

    // Add net A moves
    if (netA > 0) {
      for (let i = 0; i < netA; i++) {
        aMoves.push(`A${vertex}`);
      }
    } else if (netA < 0) {
      for (let i = 0; i < -netA; i++) {
        cMoves.push(`C${vertex}`);
      }
    }

    // Add net B moves
    if (netB > 0) {
      for (let i = 0; i < netB; i++) {
        bMoves.push(`B${vertex}`);
      }
    } else if (netB < 0) {
      for (let i = 0; i < -netB; i++) {
        dMoves.push(`D${vertex}`);
      }
    }
  }

  // Concatenate in order: A, B, -A (C), -B (D)
  const simplified = [...aMoves, ...bMoves, ...cMoves, ...dMoves];

  console.log(`Simplified ${moves.length} moves to ${simplified.length} moves (organized by type)`);
  console.log(`Breakdown: ${aMoves.length} A moves, ${bMoves.length} B moves, ${cMoves.length} -A moves, ${dMoves.length} -B moves`);

  return simplified;
}

// Get full solution sequence using direct matrix solution
export async function getFullSolution(
  initialState: GameState
): Promise<string[]> {
  console.log('Computing full solution using matrix inverse K̄⁻¹');

  // Use matrix solver to get the complete solution in one shot
  const solution = await solveWithMatrix(initialState);

  if (!solution || solution.moves.length === 0) {
    console.log('Matrix solver found no solution');
    return [];
  }

  console.log(`Matrix solution generated ${solution.moves.length} moves`);

  // Simplify and organize the move sequence
  const simplifiedMoves = simplifyMoves(solution.moves);

  return simplifiedMoves;
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