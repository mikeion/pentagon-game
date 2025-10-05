/**
 * Generate solvable campaign levels by applying moves from zero state
 * This ensures all levels are solvable by reversing the moves
 */

interface ComplexNumber {
  real: number;
  imag: number;
}

interface Move {
  vertex: ComplexNumber;
  adjacent: ComplexNumber;
}

const moves: Record<string, Move> = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 1, imag: 0 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: -1, imag: 0 } },
};

const adjacency: Record<number, number[]> = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0],
};

function applyMove(vertices: ComplexNumber[], moveType: string, vertexIndex: number): ComplexNumber[] {
  const result = vertices.map(v => ({ ...v }));
  const move = moves[moveType];

  result[vertexIndex].real += move.vertex.real;
  result[vertexIndex].imag += move.vertex.imag;

  for (const adj of adjacency[vertexIndex]) {
    result[adj].real += move.adjacent.real;
    result[adj].imag += move.adjacent.imag;
  }

  return result;
}

function generateLevel(moveSequence: Array<{ move: string; vertex: number }>): ComplexNumber[] {
  let vertices: ComplexNumber[] = Array(5).fill(null).map(() => ({ real: 0, imag: 0 }));

  for (const { move, vertex } of moveSequence) {
    vertices = applyMove(vertices, move, vertex);
  }

  return vertices;
}

function formatState(vertices: ComplexNumber[]): string {
  return `        startState: [\n${vertices.map(v => `          { real: ${v.real}, imag: ${v.imag} },`).join('\n')}\n        ],`;
}

// Chapter 1: Learning the Moves
console.log('// === CHAPTER 1: LEARNING THE MOVES ===\n');

console.log('// Level 1-1: Meet Move A (Par: 1)');
console.log('// Solution: A on V0');
const ch1_1 = generateLevel([{ move: 'A', vertex: 0 }]);
console.log(formatState(ch1_1));
console.log();

console.log('// Level 1-2: Meet Move B (Par: 1)');
console.log('// Solution: B on V0');
const ch1_2 = generateLevel([{ move: 'B', vertex: 0 }]);
console.log(formatState(ch1_2));
console.log();

console.log('// Level 1-3: Neighbors Matter (Par: 1)');
console.log('// Solution: A on V1');
const ch1_3 = generateLevel([{ move: 'A', vertex: 1 }]);
console.log(formatState(ch1_3));
console.log();

console.log('// Level 1-4: Combining A and B (Par: 2)');
console.log('// Solution: B on V1, then A on V2');
const ch1_4 = generateLevel([
  { move: 'B', vertex: 1 },
  { move: 'A', vertex: 2 }
]);
console.log(formatState(ch1_4));
console.log();

// Chapter 2: Eliminating Imaginary
console.log('// === CHAPTER 2: ELIMINATING IMAGINARY CHIPS ===\n');

console.log('// Level 2-1: Pure Imaginary (Par: 1)');
console.log('// Solution: A on V0 (demonstrates -i to neighbors)');
const ch2_1 = generateLevel([{ move: 'A', vertex: 0 }]);
console.log(formatState(ch2_1));
console.log();

console.log('// Level 2-2: Mixed Numbers (Par: 3)');
console.log('// Solution: A on V0, B on V1, A on V2');
const ch2_2 = generateLevel([
  { move: 'A', vertex: 0 },
  { move: 'B', vertex: 1 },
  { move: 'A', vertex: 2 }
]);
console.log(formatState(ch2_2));
console.log();

console.log('// Level 2-3: All Imaginary (Par: 5)');
console.log('// Solution: A on each vertex');
const ch2_3 = generateLevel([
  { move: 'A', vertex: 0 },
  { move: 'A', vertex: 1 },
  { move: 'A', vertex: 2 },
  { move: 'A', vertex: 3 },
  { move: 'A', vertex: 4 }
]);
console.log(formatState(ch2_3));
console.log();

// Chapter 3: Special Element H
console.log('// === CHAPTER 3: THE SPECIAL ELEMENT H ===\n');

console.log('// Level 3-1: One Chip Each (Par: varies - harder)');
console.log('// Complex pattern with multiple moves');
const ch3_1 = generateLevel([
  { move: 'A', vertex: 0 },
  { move: 'B', vertex: 1 },
  { move: 'A', vertex: 2 },
  { move: 'B', vertex: 3 },
  { move: 'A', vertex: 4 }
]);
console.log(formatState(ch3_1));
console.log();

console.log('// Level 3-2: Three on One (Par: varies)');
console.log('// Multiple moves on same vertex');
const ch3_2 = generateLevel([
  { move: 'A', vertex: 0 },
  { move: 'A', vertex: 0 },
  { move: 'B', vertex: 1 },
  { move: 'B', vertex: 2 }
]);
console.log(formatState(ch3_2));
console.log();

console.log('\n// Copy these states to campaign-levels.ts');
