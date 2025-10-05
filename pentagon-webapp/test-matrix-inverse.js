// Test that our matrix inverse is correct
const math = require('mathjs');

// K̄ = I₅ - Di from the paper
const K = math.matrix([
  [math.complex(1, 1), math.complex(0, -1), math.complex(0, 0), math.complex(0, 0), math.complex(0, -1)],
  [math.complex(0, -1), math.complex(1, 1), math.complex(0, -1), math.complex(0, 0), math.complex(0, 0)],
  [math.complex(0, 0), math.complex(0, -1), math.complex(1, 1), math.complex(0, -1), math.complex(0, 0)],
  [math.complex(0, 0), math.complex(0, 0), math.complex(0, -1), math.complex(1, 1), math.complex(0, -1)],
  [math.complex(0, -1), math.complex(0, 0), math.complex(0, 0), math.complex(0, -1), math.complex(1, 1)]
]);

// Our claimed inverse (without the 1/6 scaling)
const K_inv = math.matrix([
  [math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1)],
  [math.complex(1, 1), math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1)],
  [math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1)],
  [math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1), math.complex(1, 1)],
  [math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1)]
]);

// K × K_inv should equal 6×I₅ (since we haven't applied the 1/6 scaling yet)
const product = math.multiply(K, K_inv);

console.log('K × K_inv =');
console.log(product.toString());

// Check if it equals 6×I₅
const expected = math.multiply(math.identity(5), 6);
console.log('\nExpected (6×I₅) =');
console.log(expected.toString());

// Also compute the actual inverse using math.js
console.log('\nComputing actual inverse with math.js...');
const actual_inverse = math.inv(K);
console.log('Actual K⁻¹ =');
console.log(actual_inverse.toString());

console.log('\nScaled by 6:');
const scaled_actual = math.multiply(actual_inverse, 6);
console.log(scaled_actual.toString());
