// Test that the abelian property holds: order of moves shouldn't matter

// Simulate applying moves
function applyMove(state, vertex, moveType) {
  const newState = state.map(v => ({ ...v }));

  const moves = {
    'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
    'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 1, imag: 0 } },
    'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
    'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: -1, imag: 0 } },
  };

  const adjacency = {
    0: [1, 4],
    1: [0, 2],
    2: [1, 3],
    3: [2, 4],
    4: [3, 0],
  };

  const move = moves[moveType];

  newState[vertex].real += move.vertex.real;
  newState[vertex].imag += move.vertex.imag;

  for (const adj of adjacency[vertex]) {
    newState[adj].real += move.adjacent.real;
    newState[adj].imag += move.adjacent.imag;
  }

  return newState;
}

function stateToString(state) {
  return state.map((v, i) => `V${i}:(${v.real},${v.imag}i)`).join(' ');
}

// Start from zero
let state1 = [
  { real: 0, imag: 0 },
  { real: 0, imag: 0 },
  { real: 0, imag: 0 },
  { real: 0, imag: 0 },
  { real: 0, imag: 0 },
];

let state2 = JSON.parse(JSON.stringify(state1));

// Apply moves in different orders
console.log('Initial state:', stateToString(state1));

// Order 1: A1, D1
state1 = applyMove(state1, 1, 'A');
console.log('After A1:', stateToString(state1));
state1 = applyMove(state1, 1, 'D');
console.log('After D1:', stateToString(state1));

// Order 2: D1, A1
state2 = applyMove(state2, 1, 'D');
console.log('\nAfter D1:', stateToString(state2));
state2 = applyMove(state2, 1, 'A');
console.log('After A1:', stateToString(state2));

console.log('\nFinal states match?', JSON.stringify(state1) === JSON.stringify(state2));
