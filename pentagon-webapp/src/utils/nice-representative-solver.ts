import { ComplexNumber } from '@/types/game';

/**
 * Algorithm 3.10 from the paper: Find a nice representative for any chip configuration
 *
 * Input: An element of Z[i]^5, thought of as a chip configuration.
 * Output: A nice representative in the same equivalence class
 *
 * Nice representative has:
 * - Distinguished vertex (v0): 0 or 3 real chips, 0 imaginary
 * - Other vertices (v1-v4): 0, 1, or 2 real chips, 0 imaginary
 */

interface AlgorithmStep {
  step: number;
  description: string;
  state: ComplexNumber[];
  moves?: string[];
}

export function findNiceRepresentative(
  vertices: ComplexNumber[],
  distinguishedVertex: number = 0
): { representative: ComplexNumber[]; steps: AlgorithmStep[] } {

  const steps: AlgorithmStep[] = [];
  let currentState = vertices.map(v => ({ ...v }));

  // Helper: ψ(vk) = number of imaginary chips at node vk
  const psi = (k: number) => currentState[k].imag;

  // Helper: modulo that works with negative numbers
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  // Step 1: Label vertices v0, v1, v2, v3, v4 and let ψ(vk) be the number of imaginary chips
  steps.push({
    step: 1,
    description: 'Count imaginary chips at each vertex',
    state: currentState.map(v => ({ ...v })),
  });

  // Step 2: At each node vk, add ψ(vk) - ψ(vk+1) - ψ(vk-1) real chips
  const newState = currentState.map((v, k) => {
    const kPlus1 = mod(k + 1, 5);
    const kMinus1 = mod(k - 1, 5);
    const realToAdd = psi(k) - psi(kPlus1) - psi(kMinus1);

    return {
      real: v.real + realToAdd,
      imag: v.imag
    };
  });

  currentState = newState;
  steps.push({
    step: 2,
    description: 'Add real chips to prepare for imaginary removal: at vk add ψ(vk) - ψ(vk+1) - ψ(vk-1)',
    state: currentState.map(v => ({ ...v })),
  });

  // Step 3: Remove all imaginary chips
  currentState = currentState.map(v => ({
    real: v.real,
    imag: 0
  }));

  steps.push({
    step: 3,
    description: 'Remove all imaginary chips',
    state: currentState.map(v => ({ ...v })),
  });

  // Step 4-5: Track parity of total chips
  const totalChips = currentState.reduce((sum, v) => sum + v.real, 0);
  const isEven = totalChips % 2 === 0;

  steps.push({
    step: 4-5,
    description: `Count total chips (${totalChips}). Parity is ${isEven ? 'even' : 'odd'}`,
    state: currentState.map(v => ({ ...v })),
  });

  // Step 6: Subtract the number of chips at the distinguished vertex from every vertex
  const chipsAtDistinguished = currentState[distinguishedVertex].real;
  currentState = currentState.map(v => ({
    real: v.real - chipsAtDistinguished,
    imag: 0
  }));

  steps.push({
    step: 6,
    description: `Subtract V${distinguishedVertex}'s chips (${chipsAtDistinguished}) from all vertices`,
    state: currentState.map(v => ({ ...v })),
  });

  // Step 7: At each node, set the number of chips to the remainder after dividing by 3
  currentState = currentState.map(v => ({
    real: mod(v.real, 3),
    imag: 0
  }));

  steps.push({
    step: 7,
    description: 'Reduce each vertex modulo 3 (remainder after dividing by 3)',
    state: currentState.map(v => ({ ...v })),
  });

  // Step 8: Count total chips. If parity changed, add 3 chips to distinguished vertex
  const finalTotalChips = currentState.reduce((sum, v) => sum + v.real, 0);
  const finalIsEven = finalTotalChips % 2 === 0;

  if ((finalIsEven && !isEven) || (!finalIsEven && isEven)) {
    currentState[distinguishedVertex].real += 3;

    steps.push({
      step: 8,
      description: `Parity changed (was ${isEven ? 'even' : 'odd'}, now ${finalIsEven ? 'even' : 'odd'}). Add 3 chips to V${distinguishedVertex}`,
      state: currentState.map(v => ({ ...v })),
    });
  } else {
    steps.push({
      step: 8,
      description: `Parity unchanged. No adjustment needed.`,
      state: currentState.map(v => ({ ...v })),
    });
  }

  return {
    representative: currentState,
    steps
  };
}

/**
 * Check if a configuration is already a nice representative
 */
export function isNiceRepresentative(
  vertices: ComplexNumber[],
  distinguishedVertex: number = 0
): boolean {
  // Check distinguished vertex: must have 0 or 3 chips, no imaginary
  const distinguished = vertices[distinguishedVertex];
  if (distinguished.imag !== 0) return false;
  if (distinguished.real !== 0 && distinguished.real !== 3) return false;

  // Check other vertices: must have 0, 1, or 2 chips, no imaginary
  for (let i = 0; i < vertices.length; i++) {
    if (i === distinguishedVertex) continue;

    const v = vertices[i];
    if (v.imag !== 0) return false;
    if (v.real < 0 || v.real > 2) return false;
  }

  return true;
}

/**
 * Get progress toward nice representative
 */
export function getNiceRepresentativeProgress(
  vertices: ComplexNumber[],
  distinguishedVertex: number = 0
): {
  hasImaginary: boolean;
  v0Valid: boolean;
  othersValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for imaginary parts
  const hasImaginary = vertices.some(v => v.imag !== 0);
  if (hasImaginary) {
    const imaginaryVertices = vertices
      .map((v, i) => v.imag !== 0 ? `V${i}` : null)
      .filter(Boolean);
    issues.push(`Has imaginary chips on: ${imaginaryVertices.join(', ')}`);
  }

  // Check distinguished vertex
  const v0 = vertices[distinguishedVertex];
  const v0Valid = v0.imag === 0 && (v0.real === 0 || v0.real === 3);
  if (!v0Valid) {
    if (v0.imag !== 0) {
      issues.push(`V${distinguishedVertex} has imaginary part (${v0.real}${v0.imag >= 0 ? '+' : ''}${v0.imag}i)`);
    } else {
      issues.push(`V${distinguishedVertex} has ${v0.real} chips (must be 0 or 3)`);
    }
  }

  // Check other vertices
  let othersValid = true;
  for (let i = 0; i < vertices.length; i++) {
    if (i === distinguishedVertex) continue;

    const v = vertices[i];
    if (v.imag !== 0) {
      othersValid = false;
      // Already covered in hasImaginary check
    }
    if (v.real < 0 || v.real > 2) {
      othersValid = false;
      issues.push(`V${i} has ${v.real} chips (must be 0, 1, or 2)`);
    }
  }

  return {
    hasImaginary,
    v0Valid,
    othersValid,
    issues
  };
}
