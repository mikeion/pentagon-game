// Test the CORRECTED solver with the full puzzle
const math = require('mathjs');

const MATRIX_INVERSE = math.matrix([
  [math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1)],
  [math.complex(1, 1), math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1)],
  [math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1)],
  [math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1), math.complex(1, 1)],
  [math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1)]
]);
const SCALED = math.multiply(MATRIX_INVERSE, 1/6);

// Puzzle: V0: -3+0i, V1: -4-1i, V2: 5+3i, V3: -4-1i, V4: 3+0i
const state = math.matrix([
  math.complex(-3, 0),
  math.complex(-4, -1),
  math.complex(5, 3),
  math.complex(-4, -1),
  math.complex(3, 0)
]);

const diff = math.multiply(state, -1);
const sol = math.multiply(SCALED, diff);

console.log('Puzzle state: V0:-3+0i, V1:-4-1i, V2:5+3i, V3:-4-1i, V4:3+0i');
console.log('Generated with: C0, C0, C1, C1, B1, A2, A2, D2, B3, D4, D4');
console.log('Per-vertex: V0:2C, V1:2C+1B, V2:2A+1D, V3:1B, V4:2D');
console.log('');
console.log('Expected solution to UNDO:');
console.log('V0:-2C=2A, V1:-2C-1B=2A+1D, V2:-2A-1D=2C+1B, V3:-1B=1D, V4:-2D=2B');
console.log('Sorted: A0, A0, A1, A1, B2, B4, B4, C2, C2, D1, D3');
console.log('');

console.log('=== SOLVER OUTPUT (CORRECTED) ===');
const moves = [];
for (let i = 0; i < 5; i++) {
  const v = math.subset(sol, math.index(i));
  const numA = Math.round(v.re);
  const numB = Math.round(v.im);

  console.log(`V${i}: ${v.re.toFixed(3)}${v.im >= 0 ? '+' : ''}${v.im.toFixed(3)}i → ${numA}A, ${numB}B`);

  for (let j = 0; j < Math.abs(numA); j++) {
    moves.push(numA > 0 ? `A${i}` : `C${i}`);
  }
  for (let j = 0; j < Math.abs(numB); j++) {
    moves.push(numB > 0 ? `B${i}` : `D${i}`);
  }
}

const aMoves = moves.filter(m => m.startsWith('A')).sort();
const bMoves = moves.filter(m => m.startsWith('B')).sort();
const cMoves = moves.filter(m => m.startsWith('C')).sort();
const dMoves = moves.filter(m => m.startsWith('D')).sort();
const sorted = [...aMoves, ...bMoves, ...cMoves, ...dMoves];

console.log('');
console.log('Generated moves:', sorted.join(', '));
console.log('Expected moves:  A0, A0, A1, A1, B2, B4, B4, C2, C2, D1, D3');
console.log('');
console.log(sorted.join(', ') === 'A0, A0, A1, A1, B2, B4, B4, C2, C2, D1, D3' ? '✅ MATCH!' : '❌ NO MATCH');
