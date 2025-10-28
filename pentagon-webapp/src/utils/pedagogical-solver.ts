/**
 * Pedagogical Solver - Example 3.11 Tutorial
 *
 * This implements Algorithm 3.10 from the paper, which transforms any
 * chip configuration into its nice representative.
 *
 * The algorithm uses direct mathematical transformations:
 * - Steps 2-3: Add compensating real chips based on ψ values, then remove imaginary chips
 * - Steps 4-5: Apply A/-A firings to handle real chips
 * - Steps 6-8: Apply modulo operations and parity adjustments for normalization
 *
 * This demonstrates the constructive proof from Theorem 3.8.
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

  // The algorithm will transform the initial state into this nice representative
  const final: ComplexNumber[] = [
    { real: 0, imag: 0 },
    { real: 1, imag: 0 },
    { real: 0, imag: 0 },
    { real: 0, imag: 0 },
    { real: 0, imag: 0 },
  ];

  const steps: PedagogicalStep[] = [];
  // IMPORTANT: Use deep copy to avoid mutating the initial state
  let currentState = initial.map(v => ({ ...v }));
  let stepNumber = 1;

  // Add introductory explanation step
  steps.push({
    stepNumber: stepNumber++,
    description: 'Example 3.11: Find a Nice Representative',
    explanation: `We start with the configuration (3+i, 4-6i, 7+i, -8-8i, 3) and will apply Algorithm 3.10 to find its nice representative.\n\nAlgorithm 3.10 transforms any configuration into a nice representative (where V0 ∈ {0,3}, V1-V4 ∈ {0,1,2}, all real).\n\nThe algorithm uses direct mathematical transformations based on the current imaginary chip distribution (ψ values):\n• ψ(v0) = 1, ψ(v1) = -6, ψ(v2) = 1, ψ(v3) = -8, ψ(v4) = 0\n\nWe'll follow the algorithm step-by-step to see how it works!`,
    stateBefore: initial.map(v => ({ ...v })),
    stateAfter: initial.map(v => ({ ...v })),
    isExplanation: true,
  });

  // Add strategy explanation
  steps.push({
    stepNumber: stepNumber++,
    description: 'Algorithm 3.10 Strategy',
    explanation: `Algorithm 3.10 follows these steps:\n\n**Steps 2-3:** Use the formula ψ(vk) - ψ(vk+1) - ψ(vk-1) to add compensating real chips, then remove all imaginary chips. This is a direct mathematical transformation.\n\n**Steps 4-5:** Apply A/-A firings to each vertex to handle the real chips.\n\n**Steps 6-8:** Apply modulo operations and parity adjustments to ensure V0 ∈ {0,3} and V1-V4 ∈ {0,1,2}.\n\nThe result will be a nice representative in the same equivalence class as our initial configuration!`,
    stateBefore: initial.map(v => ({ ...v })),
    stateAfter: initial.map(v => ({ ...v })),
    isExplanation: true,
  });

  // These firing counts come from the Example 3.11 calculation in the paper
  const aFirings = [-5, -4, -4, 4, -1]; // A/-A firings needed at each vertex
  const bFirings = [-1, 1, 3, -1, 0];   // B/-B firings (used to compute compensating chips)

  // STEP 2: Add compensating real chips (Algorithm 3.10, Step 2)
  // At each node vk, add ψ(vk) - ψ(vk+1) - ψ(vk-1) real chips
  const stateBefore2 = currentState.map(v => ({ ...v }));

  for (let k = 0; k < 5; k++) {
    const kPlus1 = (k + 1) % 5;
    const kMinus1 = (k + 4) % 5; // (k - 1 + 5) % 5
    const realToAdd = stateBefore2[k].imag - stateBefore2[kPlus1].imag - stateBefore2[kMinus1].imag;
    currentState[k].real += realToAdd;
  }

  steps.push({
    stepNumber: stepNumber++,
    description: 'Step 2: Add Compensating Real Chips',
    explanation: `Using Algorithm 3.10 Step 2, we add real chips based on imaginary chip distribution:\n\nAt each vertex vk, add ψ(vk) - ψ(vk+1) - ψ(vk-1) real chips.\n\n• v0: ${stateBefore2[0].imag} - ${stateBefore2[1].imag} - ${stateBefore2[4].imag} = ${stateBefore2[0].imag - stateBefore2[1].imag - stateBefore2[4].imag} → add ${stateBefore2[0].imag - stateBefore2[1].imag - stateBefore2[4].imag} real chips\n• v1: ${stateBefore2[1].imag} - ${stateBefore2[2].imag} - ${stateBefore2[0].imag} = ${stateBefore2[1].imag - stateBefore2[2].imag - stateBefore2[0].imag} → add ${stateBefore2[1].imag - stateBefore2[2].imag - stateBefore2[0].imag} real chips\n• v2: ${stateBefore2[2].imag} - ${stateBefore2[3].imag} - ${stateBefore2[1].imag} = ${stateBefore2[2].imag - stateBefore2[3].imag - stateBefore2[1].imag} → add ${stateBefore2[2].imag - stateBefore2[3].imag - stateBefore2[1].imag} real chips\n• v3: ${stateBefore2[3].imag} - ${stateBefore2[4].imag} - ${stateBefore2[2].imag} = ${stateBefore2[3].imag - stateBefore2[4].imag - stateBefore2[2].imag} → add ${stateBefore2[3].imag - stateBefore2[4].imag - stateBefore2[2].imag} real chips\n• v4: ${stateBefore2[4].imag} - ${stateBefore2[0].imag} - ${stateBefore2[3].imag} = ${stateBefore2[4].imag - stateBefore2[0].imag - stateBefore2[3].imag} → add ${stateBefore2[4].imag - stateBefore2[0].imag - stateBefore2[3].imag} real chips\n\nThis formula pre-compensates for the interactions between B/-B firings.`,
    stateBefore: stateBefore2,
    stateAfter: currentState.map(v => ({ ...v })),
    isExplanation: true,
  });

  // STEP 3: Remove all imaginary chips (Algorithm 3.10, Step 3)
  const stateBefore3 = currentState.map(v => ({ ...v }));

  for (let k = 0; k < 5; k++) {
    currentState[k].imag = 0;
  }

  steps.push({
    stepNumber: stepNumber++,
    description: 'Step 3: Remove All Imaginary Chips',
    explanation: `Following Algorithm 3.10 Step 3, we remove all imaginary chips by setting imag = 0 at each vertex.\n\nThis direct transformation is mathematically equivalent to performing all the B/-B firings from the firing vector:\n• v0: ${bFirings[0]} B-firings\n• v1: ${bFirings[1]} B-firings\n• v2: ${bFirings[2]} B-firings\n• v3: ${bFirings[3]} B-firings\n• v4: ${bFirings[4]} B-firings\n\nThe compensating real chips we added in Step 2 ensure the final result is correct after removing imaginary parts.`,
    stateBefore: stateBefore3,
    stateAfter: currentState.map(v => ({ ...v })),
    isExplanation: true,
  });

  // STEPS 4-5: Introduce isEven variable and check initial parity
  const stateBefore4 = currentState.map(v => ({ ...v }));

  // Step 5: Count total chips BEFORE any transformations, set isEven flag
  const totalChipsBefore = currentState.reduce((sum, v) => sum + v.real, 0);
  const isEven = totalChipsBefore % 2 === 0;

  steps.push({
    stepNumber: stepNumber++,
    description: 'Steps 4-5: Introduce isEven Variable',
    explanation: `**Step 4:** Introduce a boolean variable isEven.\n\n**Step 5:** Count the total chips: ${currentState[0].real} + ${currentState[1].real} + ${currentState[2].real} + ${currentState[3].real} + ${currentState[4].real} = ${totalChipsBefore}\n\nSince ${totalChipsBefore} is ${totalChipsBefore % 2 === 0 ? 'EVEN' : 'ODD'}, set isEven = ${isEven ? 'True' : 'False'}`,
    stateBefore: stateBefore4,
    stateAfter: currentState.map(v => ({ ...v })),
    isExplanation: true,
  });

  // STEP 6: Subtract the distinguished node (V0) from every node
  const stateBefore6 = currentState.map(v => ({ ...v }));
  const v0Value = currentState[0].real;

  for (let k = 0; k < 5; k++) {
    currentState[k].real -= v0Value;
  }

  steps.push({
    stepNumber: stepNumber++,
    description: 'Step 6: Subtract Distinguished Node from All Nodes',
    explanation: `Subtract V0 (${v0Value}) from every node:\n• v0: ${stateBefore6[0].real} - ${v0Value} = ${currentState[0].real}\n• v1: ${stateBefore6[1].real} - ${v0Value} = ${currentState[1].real}\n• v2: ${stateBefore6[2].real} - ${v0Value} = ${currentState[2].real}\n• v3: ${stateBefore6[3].real} - ${v0Value} = ${currentState[3].real}\n• v4: ${stateBefore6[4].real} - ${v0Value} = ${currentState[4].real}`,
    stateBefore: stateBefore6,
    stateAfter: currentState.map(v => ({ ...v })),
    isExplanation: true,
  });

  // STEP 7: Apply modulo 3 to each node
  const stateBefore7 = currentState.map(v => ({ ...v }));

  for (let k = 0; k < 5; k++) {
    currentState[k].real = ((currentState[k].real % 3) + 3) % 3; // Handle negative modulo
  }

  steps.push({
    stepNumber: stepNumber++,
    description: 'Step 7: Apply Modulo 3 to All Nodes',
    explanation: `At each node, set the number of chips to the remainder after dividing by 3:\n• v0: ${stateBefore7[0].real} mod 3 = ${currentState[0].real}\n• v1: ${stateBefore7[1].real} mod 3 = ${currentState[1].real}\n• v2: ${stateBefore7[2].real} mod 3 = ${currentState[2].real}\n• v3: ${stateBefore7[3].real} mod 3 = ${currentState[3].real}\n• v4: ${stateBefore7[4].real} mod 3 = ${currentState[4].real}\n\nNow all vertices have values in {0, 1, 2}`,
    stateBefore: stateBefore7,
    stateAfter: currentState.map(v => ({ ...v })),
    isExplanation: true,
  });

  // STEP 8: Final parity check with isEven
  const totalChipsAfter = currentState.reduce((sum, v) => sum + v.real, 0);
  const stateBefore8 = currentState.map(v => ({ ...v }));

  // Check: if (total is even AND isEven = False) OR (total is odd AND isEven = True), add 3 to V0
  const shouldAdd3 = (totalChipsAfter % 2 === 0 && !isEven) || (totalChipsAfter % 2 === 1 && isEven);

  if (shouldAdd3) {
    currentState[0].real += 3;
  }

  steps.push({
    stepNumber: stepNumber++,
    description: 'Step 8: Final Parity Check',
    explanation: `Count the total chips: ${stateBefore8[0].real} + ${stateBefore8[1].real} + ${stateBefore8[2].real} + ${stateBefore8[3].real} + ${stateBefore8[4].real} = ${totalChipsAfter}\n\nTotal is ${totalChipsAfter % 2 === 0 ? 'EVEN' : 'ODD'} and isEven = ${isEven ? 'True' : 'False'}\n\n${shouldAdd3 ? `Since (total is ${totalChipsAfter % 2 === 0 ? 'even' : 'odd'} AND isEven = ${isEven ? 'True' : 'False'}), we add 3 to V0.\n\nFinal: (${currentState.map(v => v.real).join(', ')})` : `No adjustment needed.\n\nFinal: (${currentState.map(v => v.real).join(', ')})`}\n\nThis ensures V0 ∈ {0, 3} and preserves the correct equivalence class!`,
    stateBefore: stateBefore8,
    stateAfter: currentState.map(v => ({ ...v })),
    isExplanation: true,
  });

  // Add final conclusion step
  steps.push({
    stepNumber: stepNumber++,
    description: 'Nice Representative Achieved!',
    explanation: `We've successfully reached (0, 1, 0, 0, 0) - the unique nice representative for the equivalence class containing our initial configuration (3+i, 4-6i, 7+i, -8-8i, 3).\n\nAlgorithm 3.10 used direct mathematical transformations (not individual firings!) to find this representative:\n• Steps 2-3: Handled imaginary chips using formulas\n• Steps 4-5: Applied modulo operations\n• Steps 6-7: Normalized to ensure V0 ∈ {0,3}, V1-V4 ∈ {0,1,2}\n• Step 8: Final parity adjustment\n\n**Verification (optional):** You can verify these configurations are equivalent by computing K⁻¹((0,1,0,0,0) - (3+i, 4-6i, 7+i, -8-8i, 3)) = (-5-i, -4+i, -4+3i, 4-i, -1), which gives the firing vector needed to transform one into the other.`,
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
