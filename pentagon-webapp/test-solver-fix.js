// Test the actual solver with the corrected coefficient interpretation
const math = require('mathjs');

// Our corrected matrix and solver
const MATRIX_INVERSE = math.matrix([
  [math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1)],
  [math.complex(1, 1), math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1)],
  [math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1)],
  [math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1), math.complex(1, 1)],
  [math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1)]
]);

const SCALED_MATRIX_INVERSE = math.multiply(MATRIX_INVERSE, 1/6);

// Puzzle state: V0: -3+0i, V1: -4-1i, V2: 5+3i, V3: -4-1i, V4: 3+0i
const currentState = [
  { real: -3, imag: 0 },
  { real: -4, imag: -1 },
  { real: 5, imag: 3 },
  { real: -4, imag: -1 },
  { real: 3, imag: 0 }
];

// Calculate difference
const currentVector = math.matrix(currentState.map(v => math.complex(v.real, v.imag)));
const diff = math.multiply(currentVector, -1);

console.log('Current state:', currentState.map((v, i) => `V${i}:${v.real}+${v.imag}i`).join(', '));
console.log('Difference:', diff.toString());

// Apply inverse
const solution = math.multiply(SCALED_MATRIX_INVERSE, diff);

console.log('\nSolution vector:');
const solutionArray = [];
for (let i = 0; i < 5; i++) {
  const val = math.subset(solution, math.index(i));
  solutionArray.push({ real: val.re, imag: val.im });
  console.log(`  V${i}: ${val.re.toFixed(3)}${val.im >= 0 ? '+' : ''}${val.im.toFixed(3)}i`);
}

// NEW INTERPRETATION: real = D moves, imag = C moves
// D = -B, C = -A
// So we need -real B-moves and -imag A-moves
console.log('\n=== NEW INTERPRETATION ===');
const moves = [];
for (let i = 0; i < 5; i++) {
  const coeff = solutionArray[i];
  const numBMoves = -Math.round(coeff.real);
  const numAMoves = -Math.round(coeff.imag);

  console.log(`V${i}: coeff=${coeff.real.toFixed(1)}${coeff.imag >= 0 ? '+' : ''}${coeff.imag.toFixed(1)}i → ${numAMoves}A, ${numBMoves}B`);

  for (let j = 0; j < Math.abs(numAMoves); j++) {
    moves.push(numAMoves > 0 ? `A${i}` : `C${i}`);
  }
  for (let j = 0; j < Math.abs(numBMoves); j++) {
    moves.push(numBMoves > 0 ? `B${i}` : `D${i}`);
  }
}

console.log('\nGenerated moves:', moves);

// Sort them
const aMoves = moves.filter(m => m.startsWith('A')).sort();
const bMoves = moves.filter(m => m.startsWith('B')).sort();
const cMoves = moves.filter(m => m.startsWith('C')).sort();
const dMoves = moves.filter(m => m.startsWith('D')).sort();
const sorted = [...aMoves, ...bMoves, ...cMoves, ...dMoves];

console.log('Sorted moves:', sorted.join(', '));

console.log('\n=== EXPECTED ===');
console.log('A0, A0, A1, A1, B2, B4, B4, C2, C2, D1, D3');

console.log('\n=== MATCH? ===');
const expected = 'A0, A0, A1, A1, B2, B4, B4, C2, C2, D1, D3';
const got = sorted.join(', ');
console.log(expected === got ? '✓ YES!' : '✗ NO');
