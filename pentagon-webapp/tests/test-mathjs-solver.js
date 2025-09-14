// Test the new math.js matrix solver
// Run with: node test-mathjs-solver.js

const { create, all } = require('mathjs');
const math = create(all);

// Simple test state: vertex 0 has 1+0i, rest are 0
const testState = {
  vertices: [
    { real: 1, imag: 0 },   // V0: 1+0i
    { real: 0, imag: 0 },   // V1: 0+0i
    { real: 0, imag: 0 },   // V2: 0+0i
    { real: 0, imag: 0 },   // V3: 0+0i
    { real: 0, imag: 0 }    // V4: 0+0i
  ]
};

// Test the matrix operations manually
console.log('Testing Math.js Matrix Operations');
console.log('==================================\n');

// Create the 5×5 complex matrix M̄⁻¹ from Alex's LaTeX
const matrixInverse = math.matrix([
  [math.complex(3, 1), math.complex(1, -1), math.complex(-1, -1), math.complex(-1, -1), math.complex(1, -1)],
  [math.complex(1, -1), math.complex(3, 1), math.complex(1, -1), math.complex(-1, -1), math.complex(-1, -1)],
  [math.complex(-1, -1), math.complex(1, -1), math.complex(3, 1), math.complex(1, -1), math.complex(-1, -1)],
  [math.complex(-1, -1), math.complex(-1, -1), math.complex(1, -1), math.complex(3, 1), math.complex(1, -1)],
  [math.complex(1, -1), math.complex(-1, -1), math.complex(-1, -1), math.complex(1, -1), math.complex(3, 1)]
]);

// Scale by 1/6
const scaledMatrixInverse = math.multiply(matrixInverse, 1/6);

console.log('Matrix M̄⁻¹ (scaled by 1/6):');
console.log(scaledMatrixInverse.toString());

// Create state vector (goal is always zero, so difference = -current)
const stateVector = math.matrix([
  math.complex(-1, 0),  // -V0
  math.complex(0, 0),   // -V1
  math.complex(0, 0),   // -V2
  math.complex(0, 0),   // -V3
  math.complex(0, 0)    // -V4
]);

console.log('\nDifference vector (-current state):');
console.log(stateVector.toString());

// Apply matrix multiplication to get solution
const solution = math.multiply(scaledMatrixInverse, stateVector);

console.log('\nSolution vector (M̄⁻¹ × difference):');
console.log(solution.toString());

// Extract individual components
console.log('\nSolution components:');
for (let i = 0; i < 5; i++) {
  const val = math.subset(solution, math.index(i));
  console.log(`x${i}: ${val.toString()}`);
}

console.log('\nThis solution tells us how many moves to apply at each vertex to solve the puzzle!');