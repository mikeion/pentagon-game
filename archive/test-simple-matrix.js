// Simple test of the matrix solver logic
// Run with: node test-simple-matrix.js

// Test with a very simple state that should be easy to solve
const simpleState = [
  { real: 1, imag: 0 },   // V0: 1+0i
  { real: 0, imag: 0 },   // V1: 0+0i
  { real: 0, imag: 0 },   // V2: 0+0i
  { real: 0, imag: 0 },   // V3: 0+0i
  { real: 0, imag: 0 }    // V4: 0+0i
];

const MOVES = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: -1, imag: 0 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'C': { vertex: { real: 1, imag: -1 }, adjacent: { real: 1, imag: 0 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
};

const adjacency = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0]
};

function applyMove(state, vertex, moveType) {
  const newState = state.map(v => ({ ...v }));
  const move = MOVES[moveType];

  console.log(`Applying move ${moveType} at vertex ${vertex}`);
  console.log(`  Before:`, newState.map(v => `${v.real}+${v.imag}i`));

  // Apply to selected vertex
  newState[vertex].real += move.vertex.real;
  newState[vertex].imag += move.vertex.imag;

  // Apply to adjacent vertices
  for (const adj of adjacency[vertex]) {
    newState[adj].real += move.adjacent.real;
    newState[adj].imag += move.adjacent.imag;
  }

  console.log(`  After:`, newState.map(v => `${v.real}+${v.imag}i`));
  return newState;
}

function testSimpleMoves() {
  console.log('Testing Simple Moves');
  console.log('===================\n');

  console.log('Initial state:', simpleState.map(v => `${v.real}+${v.imag}i`));
  console.log('Goal: Get vertex 0 from 1+0i to 0+0i\n');

  // The simplest approach: vertex 0 has value 1+0i
  // To get it to 0+0i, we need to subtract 1+0i
  // Move C at vertex 0: adds (1-i) to vertex, (1+0i) to adjacent
  // That would make vertex 0: 1 + (1-i) = 2-i (wrong direction)

  // Let's try move A at vertex 0: adds (1+i) to vertex, (-1+0i) to adjacent
  // That would make vertex 0: 1 + (1+i) = 2+i (wrong direction)

  // We need a move that subtracts from vertex 0
  // Looking at the move definitions, we need the inverse moves

  console.log('Trying to understand what moves do to vertex 0:');
  let testState = [...simpleState.map(v => ({...v}))];

  for (const moveType of ['A', 'B', 'C', 'D']) {
    const result = applyMove(testState, 0, moveType);
    console.log(`Move ${moveType} at V0 results in V0: ${result[0].real}+${result[0].imag}i`);
  }
}

testSimpleMoves();