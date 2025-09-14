// Debug the hint system with the current game state
// Run with: node test-hint-debug.js

const { create, all } = require('mathjs');
const math = create(all);

// Current state from the screenshot
const currentState = [
  { real: 0, imag: 1 },   // V0: 0+1i
  { real: 1, imag: -1 },  // V1: 1-1i
  { real: 0, imag: 1 },   // V2: 0+1i
  { real: 0, imag: 0 },   // V3: 0+0i
  { real: 0, imag: 0 }    // V4: 0+0i
];

// Move definitions from the game
const MOVES = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: -1, imag: 0 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 1, imag: 0 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
};

const adjacency = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0]
};

function simulateMove(state, vertex, moveType) {
  const newState = state.map(v => ({ ...v }));
  const move = MOVES[moveType];

  // Apply to selected vertex
  newState[vertex].real += move.vertex.real;
  newState[vertex].imag += move.vertex.imag;

  // Apply to adjacent vertices
  for (const adj of adjacency[vertex]) {
    newState[adj].real += move.adjacent.real;
    newState[adj].imag += move.adjacent.imag;
  }

  return newState;
}

function printState(state, label) {
  console.log(`${label}:`);
  state.forEach((v, i) => {
    console.log(`  V${i}: ${v.real}+${v.imag}i`);
  });
  console.log();
}

console.log('Testing Hint: B0 B1');
console.log('===================\n');

printState(currentState, 'Initial state');

// Test the suggested hint: B0 B1
console.log('Applying B0 (Move B at vertex 0)...');
let state1 = simulateMove(currentState, 0, 'B');
printState(state1, 'After B0');

console.log('Applying B1 (Move B at vertex 1)...');
let state2 = simulateMove(state1, 1, 'B');
printState(state2, 'After B0 B1');

// Check if we're closer to the goal
const distance = state2.reduce((sum, v) => sum + Math.sqrt(v.real * v.real + v.imag * v.imag), 0);
console.log(`Total distance from zero: ${distance.toFixed(3)}`);

// Test the math.js solver too
console.log('\n--- Math.js Solver Analysis ---');

const matrixInverse = math.matrix([
  [math.complex(3, 1), math.complex(1, -1), math.complex(-1, -1), math.complex(-1, -1), math.complex(1, -1)],
  [math.complex(1, -1), math.complex(3, 1), math.complex(1, -1), math.complex(-1, -1), math.complex(-1, -1)],
  [math.complex(-1, -1), math.complex(1, -1), math.complex(3, 1), math.complex(1, -1), math.complex(-1, -1)],
  [math.complex(-1, -1), math.complex(-1, -1), math.complex(1, -1), math.complex(3, 1), math.complex(1, -1)],
  [math.complex(1, -1), math.complex(-1, -1), math.complex(-1, -1), math.complex(1, -1), math.complex(3, 1)]
]);

const scaledMatrixInverse = math.multiply(matrixInverse, 1/6);

// Difference vector (goal is zero, so difference = -current)
const differenceVector = math.matrix([
  math.complex(-currentState[0].real, -currentState[0].imag),
  math.complex(-currentState[1].real, -currentState[1].imag),
  math.complex(-currentState[2].real, -currentState[2].imag),
  math.complex(-currentState[3].real, -currentState[3].imag),
  math.complex(-currentState[4].real, -currentState[4].imag)
]);

console.log('Difference vector:', differenceVector.toString());

const solution = math.multiply(scaledMatrixInverse, differenceVector);
console.log('Solution vector:', solution.toString());

console.log('\nSolution components:');
for (let i = 0; i < 5; i++) {
  const val = math.subset(solution, math.index(i));
  console.log(`x${i}: ${val.toString()}`);
}