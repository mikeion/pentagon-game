/**
 * Pedagogical Solver - Example 3.11 Tutorial
 *
 * This solver follows the proof strategy from Theorem 3.8:
 * 1. Use B and -B firings to remove ALL imaginary chips (Lemma 3.4)
 * 2. Then use the K^-1 matrix to determine A firings needed
 *
 * This matches the pedagogical order in the paper and makes the
 * tutorial clearer: "First remove imaginary chips, then handle real chips"
 */

import { ComplexNumber } from '../types/game';

export interface PedagogicalStep {
  stepNumber: number;
  vertex?: number; // Optional for intro/explanation steps
  moveType?: 'A' | 'B' | '-A' | '-B'; // Optional for intro/explanation steps
  count?: number; // How many times to fire this move
  description: string;
  explanation: string;
  stateBefore?: ComplexNumber[]; // Optional for intro/explanation steps
  stateAfter?: ComplexNumber[];
  isExplanation?: boolean; // True for non-firing explanatory steps
}

// Pentagon adjacency
const adjacency: Record<number, number[]> = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0]
};

// Apply a single move to a state
function applyMove(
  state: ComplexNumber[],
  vertex: number,
  moveType: 'A' | 'B' | '-A' | '-B'
): ComplexNumber[] {
  const newState = state.map(v => ({ ...v }));

  // Move definitions from paper
  const moves = {
    'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
    'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 1, imag: 0 } },
    '-A': { vertex: { real: -1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
    '-B': { vertex: { real: 1, imag: -1 }, adjacent: { real: -1, imag: 0 } },
  };

  const move = moves[moveType];

  // Apply to vertex
  newState[vertex].real += move.vertex.real;
  newState[vertex].imag += move.vertex.imag;

  // Apply to adjacent vertices
  for (const adj of adjacency[vertex]) {
    newState[adj].real += move.adjacent.real;
    newState[adj].imag += move.adjacent.imag;
  }

  return newState;
}

// Apply a move multiple times
function applyMoveMultiple(
  state: ComplexNumber[],
  vertex: number,
  moveType: 'A' | 'B' | '-A' | '-B',
  count: number
): ComplexNumber[] {
  let currentState = state;
  for (let i = 0; i < count; i++) {
    currentState = applyMove(currentState, vertex, moveType);
  }
  return currentState;
}

/**
 * Generate the firing sequence for Example 3.11
 * Shows the K^-1 linear algebra calculation first, then applies the firings
 */
export function generateExample311Tutorial(): PedagogicalStep[] {
  // Initial state from Example 3.11
  const initial: ComplexNumber[] = [
    { real: 3, imag: 1 },    // v0
    { real: 4, imag: -6 },   // v1
    { real: 7, imag: 1 },    // v2
    { real: -8, imag: -8 },  // v3
    { real: 3, imag: 0 },    // v4
  ];

  const final: ComplexNumber[] = [
    { real: 0, imag: 0 },
    { real: 1, imag: 0 },
    { real: 0, imag: 0 },
    { real: 0, imag: 0 },
    { real: 0, imag: 0 },
  ];

  // From K^-1 calculation in Example 3.11:
  // K^-1(final - initial) = [-5-i, -4+i, -4+3i, 4-i, -1]
  // Real part (A-firings): [-5, -4, -4, 4, -1]
  // Imaginary part (B-firings): [-1, 1, 3, -1, 0]

  const steps: PedagogicalStep[] = [];
  let currentState = [...initial];
  let stepNumber = 1;

  // Add introductory explanation step
  steps.push({
    stepNumber: stepNumber++,
    description: 'Using Linear Algebra to Find the Firing Sequence',
    explanation: `Example 3.11 uses the K⁻¹ matrix to compute the exact firings needed. We calculate:\n\nK⁻¹(final - initial) = K⁻¹((0,1,0,0,0) - (3+i, 4-6i, 7+i, -8-8i, 3))\n\nThis gives the firing vector: [-5-i, -4+i, -4+3i, 4-i, -1]\n\n• Real part = A-firings needed at each vertex: [-5, -4, -4, 4, -1]\n• Imaginary part = B-firings needed: [-1, 1, 3, -1, 0]\n\nNegative values mean fire the opposite move (e.g., -5 A-firings = 5 -A firings).`,
    stateBefore: [...initial],
    stateAfter: [...initial],
    isExplanation: true,
  });

  // Add strategy explanation
  steps.push({
    stepNumber: stepNumber++,
    description: 'Strategy: Remove Imaginary Chips First (Lemma 3.4)',
    explanation: `Following Algorithm 3.10, we apply all B/-B firings first to remove imaginary chips, then all A/-A firings to reach the nice representative.\n\nIMPORTANT: You'll see imaginary chips appear during the process! This is expected - A-firings affect imaginary parts and B-firings affect real parts. The K⁻¹ calculation accounts for all these interactions.\n\nBecause S(R₁₀) is an abelian group, the ORDER doesn't matter - we could do these firings in any sequence and get the same result. We show them grouped by type for clarity.`,
    stateBefore: [...initial],
    stateAfter: [...initial],
    isExplanation: true,
  });

  const aFirings = [-5, -4, -4, 4, -1]; // Real part of K^-1 result
  const bFirings = [-1, 1, 3, -1, 0];   // Imaginary part of K^-1 result

  // STEP 1: Remove ALL imaginary chips first (Lemma 3.4)
  // Do all B/-B firings across all vertices
  for (let vertex = 0; vertex < 5; vertex++) {
    const bCount = bFirings[vertex];

    if (bCount !== 0) {
      const moveType = bCount > 0 ? 'B' : '-B';
      const count = Math.abs(bCount);
      const stateBefore = [...currentState];
      const stateAfter = applyMoveMultiple(currentState, vertex, moveType, count);

      const firingVectorInfo = `From K⁻¹: vertex ${vertex} needs ${bCount > 0 ? bCount : bCount} B-firings (imaginary part of firing vector).`;

      steps.push({
        stepNumber: stepNumber++,
        vertex,
        moveType,
        count,
        description: `Fire ${moveType} at v${vertex} [${count}×]`,
        explanation: `${firingVectorInfo}\n\n${moveType} adds ${moveType === 'B' ? '-1+i' : '1-i'} to v${vertex} and ${moveType === 'B' ? '+1' : '-1'} to neighbors v${adjacency[vertex].join(', v')}.\n\nNote: This also affects real chips! The final state will be correct after all firings.`,
        stateBefore,
        stateAfter,
      });

      currentState = stateAfter;
    }
  }

  // Add transition explanation before A-firings
  steps.push({
    stepNumber: stepNumber++,
    description: 'Transition: Now Apply A/-A Firings',
    explanation: `We've completed all B/-B firings from the firing vector. Now we apply the A/-A firings (real part of K⁻¹ result):\n\nA-firings needed: [-5, -4, -4, 4, -1]\n• v0: 5 -A firings\n• v1: 4 -A firings\n• v2: 4 -A firings\n• v3: 4 A firings\n• v4: 1 -A firing\n\nThese will finalize the transformation to the nice representative (0, 1, 0, 0, 0).`,
    stateBefore: [...currentState],
    stateAfter: [...currentState],
    isExplanation: true,
  });

  // STEP 2: Adjust real chips (Algorithm 3.10)
  // Do all A/-A firings across all vertices
  for (let vertex = 0; vertex < 5; vertex++) {
    const aCount = aFirings[vertex];

    if (aCount !== 0) {
      const moveType = aCount > 0 ? 'A' : '-A';
      const count = Math.abs(aCount);
      const stateBefore = [...currentState];
      const stateAfter = applyMoveMultiple(currentState, vertex, moveType, count);

      const firingVectorInfo = `From K⁻¹: vertex ${vertex} needs ${aCount > 0 ? aCount : aCount} A-firings (real part of firing vector).`;

      steps.push({
        stepNumber: stepNumber++,
        vertex,
        moveType,
        count,
        description: `Fire ${moveType} at v${vertex} [${count}×]`,
        explanation: `${firingVectorInfo}\n\n${moveType} adds ${moveType === 'A' ? '1+i' : '-1-i'} to v${vertex} and ${moveType === 'A' ? '-i' : '+i'} to neighbors v${adjacency[vertex].join(', v')}.`,
        stateBefore,
        stateAfter,
      });

      currentState = stateAfter;
    }
  }

  // Add final conclusion step
  steps.push({
    stepNumber: stepNumber++,
    description: 'Nice Representative Achieved!',
    explanation: `We've successfully reached (0, 1, 0, 0, 0) - the unique nice representative for the equivalence class containing our initial configuration (3+i, 4-6i, 7+i, -8-8i, 3).\n\nThis demonstrates Algorithm 3.10: using the K⁻¹ matrix calculation, we determined the exact firing sequence needed to reach this representative.`,
    stateBefore: [...currentState],
    stateAfter: [...currentState],
    isExplanation: true,
  });

  return steps;
}

/**
 * Format a complex number for display
 */
export function formatComplexNumber(c: ComplexNumber): string {
  if (c.real === 0 && c.imag === 0) return '0';

  let result = '';

  // Real part
  if (c.real !== 0 || c.imag === 0) {
    result += c.real.toString();
  }

  // Imaginary part
  if (c.imag !== 0) {
    if (c.imag > 0 && result !== '') result += '+';
    if (c.imag === 1) result += 'i';
    else if (c.imag === -1) result += '-i';
    else result += c.imag + 'i';
  }

  return result;
}

/**
 * Format a state as a tuple string
 */
export function formatState(state: ComplexNumber[]): string {
  return '(' + state.map(formatComplexNumber).join(', ') + ')';
}
