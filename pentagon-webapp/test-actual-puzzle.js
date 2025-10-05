// Test with the actual puzzle state from the logs
const math = require('mathjs');

// K̄ from main-2.tex
const K = math.matrix([
  [math.complex(1, 1), math.complex(0, -1), math.complex(0, 0), math.complex(0, 0), math.complex(0, -1)],
  [math.complex(0, -1), math.complex(1, 1), math.complex(0, -1), math.complex(0, 0), math.complex(0, 0)],
  [math.complex(0, 0), math.complex(0, -1), math.complex(1, 1), math.complex(0, -1), math.complex(0, 0)],
  [math.complex(0, 0), math.complex(0, 0), math.complex(0, -1), math.complex(1, 1), math.complex(0, -1)],
  [math.complex(0, -1), math.complex(0, 0), math.complex(0, 0), math.complex(0, -1), math.complex(1, 1)]
]);

// From the logs: V0: -3+0i, V1: -4-1i, V2: 5+3i, V3: -4-1i, V4: 3+0i
const current = math.matrix([
  math.complex(-3, 0),
  math.complex(-4, -1),
  math.complex(5, 3),
  math.complex(-4, -1),
  math.complex(3, 0)
]);

console.log('Current state from logs');

// Calculate difference to goal (0)
const diff = math.multiply(current, -1);
console.log('\nDifference vector:', diff.toString());

// Compute solution
const K_inv = math.inv(K);
const solution = math.multiply(K_inv, diff);
console.log('\nSolution vector:', solution.toString());

// Parse solution
console.log('\nSolution coefficients:');
for (let i = 0; i < 5; i++) {
  const val = math.subset(solution, math.index(i));
  console.log(`  V${i}: ${val.re.toFixed(3)} + ${val.im.toFixed(3)}i (rounded: ${Math.round(val.re)}B, ${Math.round(val.im)}A)`);
}

// From the logs, the solution said:
// V0: 2.000+0.000i → 2B, 0A
// V1: 2.000-1.000i → 2B, -1A (= 2B, 1C)
// V2: -2.000+1.000i → -2B, 1A (= 2D, 1A)
// V3: 0.000-1.000i → 0B, -1A (= 1C)
// V4: 0.000+2.000i → 0B, 2A

console.log('\nGenerated moves should be: 2B0, 2B1, 1C1, 1A2, 2D2, 1C3, 2A4');
console.log('Which simplifies to: A2, A4, A4, B0, B0, B1, B1, C1, C3, D2, D2');

// Now what did we GENERATE from?
console.log('\n=== PUZZLE GENERATION ===');
console.log('Puzzle was generated with: -A, V0 → -A, V0 → -A, V1 → -A, V1 → B, V1 → A, V2 → A, V2 → -B, V2 → B, V3 → -B, V4 → -B, V4');
console.log('Which is: C0, C0, C1, C1, B1, A2, A2, D2, B3, D4, D4');
console.log('Per-vertex: V0: -2A, 0B | V1: -2A, 1B | V2: 2A, -1B | V3: 0A, 1B | V4: 0A, -2B');
console.log('Simplified: V0: 2C | V1: 2C, 1B | V2: 2A, 1D | V3: 1B | V4: 2D');

// So to UNDO this, we need the OPPOSITE:
console.log('\n=== TO UNDO ===');
console.log('V0: -2C = 2A');
console.log('V1: -2C, -1B = 2A, 1D');
console.log('V2: -2A, -1D = 2C, 1B');
console.log('V3: -1B = 1D');
console.log('V4: -2D = 2B');

console.log('\nExpected solution: 2A0, 2A1, 1D1, 2C2, 1B2, 1D3, 2B4');
console.log('Sorted: A0, A0, A1, A1, B2, B4, B4, C2, C2, D1, D3');

console.log('\n=== WHAT WE GOT ===');
console.log('A2, A4, A4, B0, B0, B1, B1, C1, C3, D2, D2');

console.log('\n=== THEY DON\'T MATCH! ===');
