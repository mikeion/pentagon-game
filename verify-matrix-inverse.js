// Verify that the inverse matrix in matrix-solver-mathjs.ts is correct
const math = require('mathjs');

// Define K̄ = I₅ - Di from the paper (line 208)
const K_bar = math.matrix([
  [math.complex(1, 1), math.complex(0, -1), math.complex(0, 0), math.complex(0, 0), math.complex(0, -1)],
  [math.complex(0, -1), math.complex(1, 1), math.complex(0, -1), math.complex(0, 0), math.complex(0, 0)],
  [math.complex(0, 0), math.complex(0, -1), math.complex(1, 1), math.complex(0, -1), math.complex(0, 0)],
  [math.complex(0, 0), math.complex(0, 0), math.complex(0, -1), math.complex(1, 1), math.complex(0, -1)],
  [math.complex(0, -1), math.complex(0, 0), math.complex(0, 0), math.complex(0, -1), math.complex(1, 1)]
]);

console.log('K̄ matrix (from paper):');
console.log(K_bar.toString());

// Compute K̄⁻¹
const K_bar_inverse = math.inv(K_bar);

console.log('\nK̄⁻¹ (computed):');
console.log(K_bar_inverse.toString());

// Our hardcoded matrix from matrix-solver-mathjs.ts (unscaled)
const OUR_MATRIX = math.matrix([
  [math.complex(3, 1), math.complex(1, -1), math.complex(-1, -1), math.complex(-1, -1), math.complex(1, -1)],
  [math.complex(1, -1), math.complex(3, 1), math.complex(1, -1), math.complex(-1, -1), math.complex(-1, -1)],
  [math.complex(-1, -1), math.complex(1, -1), math.complex(3, 1), math.complex(1, -1), math.complex(-1, -1)],
  [math.complex(-1, -1), math.complex(-1, -1), math.complex(1, -1), math.complex(3, 1), math.complex(1, -1)],
  [math.complex(1, -1), math.complex(-1, -1), math.complex(-1, -1), math.complex(1, -1), math.complex(3, 1)]
]);

console.log('\nOur hardcoded matrix (before 1/6 scaling):');
console.log(OUR_MATRIX.toString());

// Scale by 1/6 as we do in the code
const OUR_SCALED = math.multiply(OUR_MATRIX, 1/6);
console.log('\nOur matrix (after 1/6 scaling):');
console.log(OUR_SCALED.toString());

// Check if they're equal
console.log('\n=== VERIFICATION ===');
console.log('Are they equal?');
const diff = math.subtract(K_bar_inverse, OUR_SCALED);
const maxDiff = math.max(math.abs(diff));
console.log('Maximum difference:', maxDiff.toString());

if (maxDiff < 0.0001) {
  console.log('✓ CORRECT: Our matrix matches K̄⁻¹ from the paper!');
} else {
  console.log('✗ ERROR: Our matrix does NOT match K̄⁻¹!');
  console.log('\nExpected K̄⁻¹:');
  for (let i = 0; i < 5; i++) {
    let row = [];
    for (let j = 0; j < 5; j++) {
      const val = K_bar_inverse.get([i, j]);
      row.push(`(${val.re.toFixed(4)} ${val.im >= 0 ? '+' : ''}${val.im.toFixed(4)}i)`);
    }
    console.log(row.join(', '));
  }
}

// Verify that K̄ * K̄⁻¹ = I
console.log('\n=== IDENTITY CHECK ===');
const identity = math.multiply(K_bar, K_bar_inverse);
console.log('K̄ × K̄⁻¹ (should be identity):');
console.log(identity.toString());
