const math = require('mathjs');

// K matrix from paper (line 208): K = I_5 - Di
const K_MATRIX = math.matrix([
  [math.complex(1, 1), math.complex(0, -1), math.complex(0, 0), math.complex(0, 0), math.complex(0, -1)],
  [math.complex(0, -1), math.complex(1, 1), math.complex(0, -1), math.complex(0, 0), math.complex(0, 0)],
  [math.complex(0, 0), math.complex(0, -1), math.complex(1, 1), math.complex(0, -1), math.complex(0, 0)],
  [math.complex(0, 0), math.complex(0, 0), math.complex(0, -1), math.complex(1, 1), math.complex(0, -1)],
  [math.complex(0, -1), math.complex(0, 0), math.complex(0, 0), math.complex(0, -1), math.complex(1, 1)]
]);

// The hardcoded inverse (times 6) from the current code
const EXPECTED_INVERSE_TIMES_6 = math.matrix([
  [math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1)],
  [math.complex(1, 1), math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1)],
  [math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1)],
  [math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1), math.complex(1, 1)],
  [math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1)]
]);

console.log('K Matrix:');
console.log(K_MATRIX.toString());
console.log('\n');

// Compute K^-1 using math.inv()
const K_INVERSE = math.inv(K_MATRIX);

console.log('Computed K^-1:');
console.log(K_INVERSE.toString());
console.log('\n');

// Scale by 6 to compare with expected
const K_INVERSE_TIMES_6 = math.multiply(K_INVERSE, 6);

console.log('Computed K^-1 × 6:');
console.log(K_INVERSE_TIMES_6.toString());
console.log('\n');

console.log('Expected K^-1 × 6 (hardcoded):');
console.log(EXPECTED_INVERSE_TIMES_6.toString());
console.log('\n');

// Verify: K × K^-1 should equal identity
const IDENTITY_CHECK = math.multiply(K_MATRIX, K_INVERSE);
console.log('K × K^-1 (should be identity):');
console.log(IDENTITY_CHECK.toString());
