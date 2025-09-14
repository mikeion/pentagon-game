// Test the correct mathematical solution
// Run with: node test-correct-solution.js

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

function simulateMove(state, vertex, moveType, operation = 'add') {
  const newState = state.map(v => ({ ...v }));
  const move = MOVES[moveType];
  const multiplier = operation === 'subtract' ? -1 : 1;

  // Apply to selected vertex
  newState[vertex].real += move.vertex.real * multiplier;
  newState[vertex].imag += move.vertex.imag * multiplier;

  // Apply to adjacent vertices
  for (const adj of adjacency[vertex]) {
    newState[adj].real += move.adjacent.real * multiplier;
    newState[adj].imag += move.adjacent.imag * multiplier;
  }

  return newState;
}

function printState(state, label) {
  console.log(`${label}:`);
  state.forEach((v, i) => {
    console.log(`  V${i}: ${v.real}+${v.imag}i`);
  });
  const distance = state.reduce((sum, v) => sum + Math.sqrt(v.real * v.real + v.imag * v.imag), 0);
  console.log(`  Distance from zero: ${distance.toFixed(3)}\n`);
}

console.log('Testing Mathematical Solution: x1 = -1');
console.log('=====================================\n');

printState(currentState, 'Initial state');

// The math says we need to apply -1 "move unit" at vertex 1
// This means we need to find a move that when applied negatively gives us the solution

console.log('Math.js solution says x1 = -1, meaning we need a negative move at vertex 1');
console.log('Let\'s test all possible moves at vertex 1 in both directions:\n');

for (const moveType of ['A', 'B', 'C', 'D']) {
  console.log(`--- Testing ${moveType}1 (positive) ---`);
  const result1 = simulateMove(currentState, 1, moveType, 'add');
  printState(result1, `After ${moveType}1 (add)`);

  console.log(`--- Testing ${moveType}1 (negative) ---`);
  const result2 = simulateMove(currentState, 1, moveType, 'subtract');
  printState(result2, `After ${moveType}1 (subtract)`);
}

// Based on mathematical solution, let's specifically test what happens
// if we could apply exactly -1 of the "base move effect" at vertex 1
console.log('--- What the mathematical solution means ---');
console.log('x1 = -1 means we need to subtract one "fundamental move unit" at vertex 1');
console.log('But we need to figure out which of our A,B,C,D moves corresponds to this unit');