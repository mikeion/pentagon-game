import { create, all } from 'mathjs';
import { ComplexNumber, GameState, MoveType } from '../types/game';

// Create math.js instance with complex number support
const math = create(all);

// K matrix from paper (line 208): K = I_5 - Di
// where D is the pentagon adjacency matrix with diagonal 1s and -1s for adjacent vertices
const K_MATRIX = math.matrix([
  [math.complex(1, 1), math.complex(0, -1), math.complex(0, 0), math.complex(0, 0), math.complex(0, -1)],
  [math.complex(0, -1), math.complex(1, 1), math.complex(0, -1), math.complex(0, 0), math.complex(0, 0)],
  [math.complex(0, 0), math.complex(0, -1), math.complex(1, 1), math.complex(0, -1), math.complex(0, 0)],
  [math.complex(0, 0), math.complex(0, 0), math.complex(0, -1), math.complex(1, 1), math.complex(0, -1)],
  [math.complex(0, -1), math.complex(0, 0), math.complex(0, 0), math.complex(0, -1), math.complex(1, 1)]
]);

// Compute K^-1 using math.js inv() function (verified to match hardcoded inverse)
const K_INVERSE = math.inv(K_MATRIX);

// Move definitions mapping complex numbers to move types
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


// A couple of functions to move from complex number to javascript complex number and back

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

// Calculate the difference vector from current state to goal
function calculateDifferenceVector(current: ComplexNumber[], goal: ComplexNumber[]): unknown {
  const currentVector = math.matrix(current.map(toMathComplex));
  const goalVector = math.matrix(goal.map(toMathComplex));

  // difference = goal - current
  return math.subtract(goalVector, currentVector);
}

// Apply the inverse matrix to get the solution vector
function applySolutionMatrix(differenceVector: unknown): unknown {
  // Matrix multiplication: K^-1 × difference
  return math.multiply(K_INVERSE, differenceVector as Parameters<typeof math.multiply>[1]);
}

// Simulate applying a move to a state
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function solutionToMoves(solution: unknown, currentState: ComplexNumber[]): string[] {
  // Convert math.js solution back to array of ComplexNumbers
  const solutionArray = [];
  for (let i = 0; i < 5; i++) {
    const complexVal = math.subset(solution as Parameters<typeof math.subset>[0], math.index(i));
    solutionArray.push(fromMathComplex(complexVal));
  }
  // Solution vector coefficient a+bi interpretation:
  // - Real part (a) = number of A moves needed (Alex you can help me think on this but this is what I got from the how does the firing work pdf)
  // - Imaginary part (b) = number of B moves needed
  const moves: string[] = [];

  for (let vertex = 0; vertex < 5; vertex++) {
    const coeff = solutionArray[vertex];

    // Real part = A moves, Imaginary part = B moves
    const numAMoves = Math.round(coeff.real);
    const numBMoves = Math.round(coeff.imag);

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
    // Use goalVertices from GameState (works for both base game and campaign)
    const differenceVector = calculateDifferenceVector(initialState.vertices, initialState.goalVertices);
    const solutionVector = applySolutionMatrix(differenceVector);
    const moves = solutionToMoves(solutionVector, initialState.vertices);

    // Convert solution back to ComplexNumber array for return
    const solutionArray = [];
    for (let i = 0; i < 5; i++) {
      const complexVal = math.subset(solutionVector as Parameters<typeof math.subset>[0], math.index(i));
      solutionArray.push(fromMathComplex(complexVal));
    }

    return {
      moves,
      solutionVector: solutionArray,
      isExact: true
    };
  } catch (error) {
    console.error('Math.js Matrix solver error:', error);
    return null;
  }
}

// Get hint based on current button selection
// Returns the vertex that needs the most moves of the selected type
// If selected type not needed, returns best alternative move type
export async function getMatrixHint(
  currentState: GameState,
  selectedMoveType: MoveType
): Promise<{ vertex: number; moveType: MoveType } | null> {
  const solution = await solveWithMatrix(currentState);

  if (solution && solution.moves.length > 0) {
    const simplified = simplifyMoves(solution.moves);

    // Count how many times each move type is needed per vertex
    const moveCount: Record<number, Record<MoveType, number>> = {};

    for (const move of simplified) {
      const cleanMove = move.replace(' (long press)', '');
      const moveType = cleanMove[0] as MoveType;
      const vertex = parseInt(cleanMove[1]);

      if (!moveCount[vertex]) {
        moveCount[vertex] = { A: 0, B: 0, C: 0, D: 0 };
      }
      moveCount[vertex][moveType]++;
    }

    // Find the vertex with the most moves of the selected type
    let bestVertex = -1;
    let maxCount = 0;

    for (const [vertex, counts] of Object.entries(moveCount)) {
      const count = counts[selectedMoveType];
      if (count > maxCount) {
        maxCount = count;
        bestVertex = parseInt(vertex);
      }
    }

    if (bestVertex >= 0 && maxCount > 0) {
      return { vertex: bestVertex, moveType: selectedMoveType };
    }

    // If selected move type not needed, find the best alternative
    // Look for the move type with the highest total count across all vertices
    const totalCounts: Record<MoveType, number> = { A: 0, B: 0, C: 0, D: 0 };
    for (const counts of Object.values(moveCount)) {
      totalCounts.A += counts.A;
      totalCounts.B += counts.B;
      totalCounts.C += counts.C;
      totalCounts.D += counts.D;
    }

    // Find best alternative move type
    let bestMoveType: MoveType | null = null;
    let bestTotalCount = 0;
    for (const [moveType, count] of Object.entries(totalCounts)) {
      if (count > bestTotalCount) {
        bestTotalCount = count;
        bestMoveType = moveType as MoveType;
      }
    }

    if (bestMoveType && bestTotalCount > 0) {
      // Find vertex with most moves of this type
      let altVertex = -1;
      let altMaxCount = 0;
      for (const [vertex, counts] of Object.entries(moveCount)) {
        const count = counts[bestMoveType];
        if (count > altMaxCount) {
          altMaxCount = count;
          altVertex = parseInt(vertex);
        }
      }

      if (altVertex >= 0) {
        return { vertex: altVertex, moveType: bestMoveType };
      }
    }
  }

  return null;
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
  return [...aMoves, ...bMoves, ...cMoves, ...dMoves];
}

// Get full solution sequence using direct matrix solution
export async function getFullSolution(
  initialState: GameState
): Promise<string[]> {
  const solution = await solveWithMatrix(initialState);

  if (!solution || solution.moves.length === 0) {
    return [];
  }

  return simplifyMoves(solution.moves);
}