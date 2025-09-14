// Simple Node.js test to verify the solver logic

// Pentagon adjacency
const adjacency = {
  0: [1, 4],
  1: [0, 2], 
  2: [1, 3],
  3: [2, 4],
  4: [3, 0],
};

// Move definitions (from your corrected version)
const moves = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: -1, imag: 0 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 1, imag: 0 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
};

function applyMove(state, vertex, moveType, operation = 'add') {
  const newState = state.map(v => ({ real: v.real, imag: v.imag }));
  const move = moves[moveType];
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

function stateToString(state) {
  return state.map((v, i) => `V${i}: ${v.real}${v.imag >= 0 ? '+' : ''}${v.imag}i`).join(', ');
}

function statesEqual(state1, state2) {
  return state1.every((v, i) => 
    Math.abs(v.real - state2[i].real) < 0.001 && 
    Math.abs(v.imag - state2[i].imag) < 0.001
  );
}

// Test 1: Start with initial state, apply Move A to vertex 0, see if we can solve back
console.log('=== SOLVER VERIFICATION TEST ===\n');

const initialState = [
  { real: 2, imag: 4 },  // V0
  { real: 2, imag: 0 },  // V1
  { real: 2, imag: 2 },  // V2
  { real: 3, imag: 4 },  // V3
  { real: 1, imag: 3 },  // V4
];

console.log('1. Initial state:');
console.log(stateToString(initialState));

// Apply Move A to vertex 0
const afterMoveA = applyMove(initialState, 0, 'A', 'add');
console.log('\n2. After applying Move A to V0:');
console.log(stateToString(afterMoveA));
console.log('Changes:');
console.log(`  V0: ${initialState[0].real}+${initialState[0].imag}i → ${afterMoveA[0].real}+${afterMoveA[0].imag}i (vertex gets +1+i)`);
console.log(`  V1: ${initialState[1].real}+${initialState[1].imag}i → ${afterMoveA[1].real}+${afterMoveA[1].imag}i (adjacent gets -1)`);
console.log(`  V4: ${initialState[4].real}+${initialState[4].imag}i → ${afterMoveA[4].real}+${afterMoveA[4].imag}i (adjacent gets -1)`);

// Now try to solve back: can we get from afterMoveA back to initialState?
console.log('\n3. Testing if we can solve back with Move A subtract:');
const backToInitial = applyMove(afterMoveA, 0, 'A', 'subtract');
console.log('After Move A subtract on V0:');
console.log(stateToString(backToInitial));

if (statesEqual(backToInitial, initialState)) {
  console.log('✅ SUCCESS: Move A subtract correctly reversed Move A add');
} else {
  console.log('❌ FAILURE: Move A subtract did not reverse Move A add');
}

console.log('\n=== TESTING CURRENT PUZZLE ===\n');

// The puzzle from your screenshot
const currentPuzzleStart = [
  { real: 2, imag: 4 },  // V0
  { real: 2, imag: 0 },  // V1  
  { real: 2, imag: 2 },  // V2
  { real: 3, imag: 4 },  // V3
  { real: 1, imag: 3 },  // V4
];

const currentPuzzleGoal = [
  { real: -1, imag: 7 },  // V0
  { real: 2, imag: -3 },  // V1
  { real: 2, imag: 1 },   // V2  
  { real: 2, imag: 5 },   // V3
  { real: 1, imag: -1 },  // V4
];

console.log('Current puzzle start:');
console.log(stateToString(currentPuzzleStart));
console.log('\nCurrent puzzle goal:');
console.log(stateToString(currentPuzzleGoal));

// Calculate what changes are needed
console.log('\nChanges needed:');
for (let i = 0; i < 5; i++) {
  const realDiff = currentPuzzleGoal[i].real - currentPuzzleStart[i].real;
  const imagDiff = currentPuzzleGoal[i].imag - currentPuzzleStart[i].imag;
  console.log(`V${i}: needs ${realDiff >= 0 ? '+' : ''}${realDiff} real, ${imagDiff >= 0 ? '+' : ''}${imagDiff}i imag`);
}

console.log('\n=== MANUAL SOLUTION ATTEMPT ===');

// Try some moves manually
let current = currentPuzzleStart.map(v => ({...v}));
let moveCount = 0;

// V1 needs -3i, let's try Move B on V1 (gives vertex -1+i, adjacent -i)
console.log(`\nMove ${++moveCount}: Move B on V1`);
current = applyMove(current, 1, 'B', 'add');
console.log(stateToString(current));

// Check progress toward goal
let totalError = 0;
for (let i = 0; i < 5; i++) {
  const realDiff = Math.abs(currentPuzzleGoal[i].real - current[i].real);
  const imagDiff = Math.abs(currentPuzzleGoal[i].imag - current[i].imag);
  totalError += realDiff + imagDiff;
}
console.log(`Total error: ${totalError.toFixed(1)}`);