const { solvePuzzle } = require('./pentagon-webapp/src/utils/solver.ts');

// Current state from the screenshot:
// V0: 2+4i, V1: 2+0i, V2: 2+2i, V3: 3+4i, V4: 1+3i
const currentState = [
  { real: 2, imag: 4 },  // V0
  { real: 2, imag: 0 },  // V1  
  { real: 2, imag: 2 },  // V2
  { real: 3, imag: 4 },  // V3
  { real: 1, imag: 3 },  // V4
];

// Goal state from the screenshot:
// V0: -1+7i, V1: 2-3i, V2: 2+1i, V3: 2+5i, V4: 1-1i
const goalState = [
  { real: -1, imag: 7 },  // V0
  { real: 2, imag: -3 },  // V1
  { real: 2, imag: 1 },   // V2  
  { real: 2, imag: 5 },   // V3
  { real: 1, imag: -1 },  // V4
];

console.log('Testing solver with current puzzle...');
console.log('Current state:', currentState);
console.log('Goal state:', goalState);

// Test with different max depths
async function testSolver() {
  try {
    console.log('\n--- Testing with max depth 5 ---');
    const result5 = await solvePuzzle(currentState, goalState, 5);
    console.log('Result:', result5);
    
    console.log('\n--- Testing with max depth 7 ---');
    const result7 = await solvePuzzle(currentState, goalState, 7);
    console.log('Result:', result7);
  } catch (error) {
    console.error('Solver error:', error);
  }
}

testSolver();