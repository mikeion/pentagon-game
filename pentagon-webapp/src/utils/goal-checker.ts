import { ComplexNumber, GoalType } from '@/types/game';

/**
 * Check if current state meets "all zeros" goal
 */
export function checkAllZerosGoal(vertices: ComplexNumber[]): boolean {
  return vertices.every(v => v.real === 0 && v.imag === 0);
}

/**
 * Check if current state meets "nice representative" goal (Theorem 3.7 from paper)
 *
 * Goal: Distinguished vertex (default V0) has 0 or 3 chips (real only)
 *       All other vertices have 0, 1, or 2 chips (real only)
 *
 * This gives exactly 2 × 3^4 = 162 representatives for the sandpile group
 */
export function checkNiceRepresentativeGoal(
  vertices: ComplexNumber[],
  distinguishedVertex: number = 0
): boolean {
  // Check all vertices have no imaginary part
  if (vertices.some(v => v.imag !== 0)) {
    return false;
  }

  // Check distinguished vertex: must be 0 or 3
  const distinguishedValue = vertices[distinguishedVertex].real;
  if (distinguishedValue !== 0 && distinguishedValue !== 3) {
    return false;
  }

  // Check all other vertices: must be 0, 1, or 2
  for (let i = 0; i < vertices.length; i++) {
    if (i === distinguishedVertex) continue;

    const value = vertices[i].real;
    if (![0, 1, 2].includes(value)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if current state meets the goal based on goal type
 */
export function checkGoal(
  vertices: ComplexNumber[],
  goalType: GoalType,
  distinguishedVertex?: number
): boolean {
  switch (goalType) {
    case 'all-zeros':
      return checkAllZerosGoal(vertices);
    case 'nice-representative':
      return checkNiceRepresentativeGoal(vertices, distinguishedVertex);
    default:
      return false;
  }
}
