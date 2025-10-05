// Manually test the matrix solver with a simple case
const math = require('mathjs');

// K̄ from main-2.tex line 208
const K = math.matrix([
  [math.complex(1, 1), math.complex(0, -1), math.complex(0, 0), math.complex(0, 0), math.complex(0, -1)],
  [math.complex(0, -1), math.complex(1, 1), math.complex(0, -1), math.complex(0, 0), math.complex(0, 0)],
  [math.complex(0, 0), math.complex(0, -1), math.complex(1, 1), math.complex(0, -1), math.complex(0, 0)],
  [math.complex(0, 0), math.complex(0, 0), math.complex(0, -1), math.complex(1, 1), math.complex(0, -1)],
  [math.complex(0, -1), math.complex(0, 0), math.complex(0, 0), math.complex(0, -1), math.complex(1, 1)]
]);

// Simple test: start from state V0=1+0i, rest zero
const current = math.matrix([
  math.complex(1, 0),
  math.complex(0, 0),
  math.complex(0, 0),
  math.complex(0, 0),
  math.complex(0, 0)
]);

console.log('Current state: V0=1+0i, rest zero');

// Calculate difference to goal (0)
const diff = math.multiply(current, -1);
console.log('\nDifference vector:', diff.toString());

// Compute solution
const K_inv = math.inv(K);
const solution = math.multiply(K_inv, diff);
console.log('\nSolution vector:', solution.toString());

// Parse solution
console.log('\nSolution coefficients:');
for (let i = 0; i < 5; i++) {
  const val = math.subset(solution, math.index(i));
  console.log(`  V${i}: ${val.re.toFixed(3)} + ${val.im.toFixed(3)}i`);
}

// Now let's manually verify: if we apply these moves, do we get to zero?
console.log('\n=== MANUAL VERIFICATION ===');
console.log('Starting from V0=1+0i, applying solution moves...\n');

// We'll manually simulate applying the moves
const state = [
  { real: 1, imag: 0 },
  { real: 0, imag: 0 },
  { real: 0, imag: 0 },
  { real: 0, imag: 0 },
  { real: 0, imag: 0 }
];

const adjacency = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0]
};

const moves = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 1, imag: 0 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: -1, imag: 0 } },
};

function applyMove(state, vertex, moveType) {
  const newState = state.map(v => ({ ...v }));
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

// The solution vector tells us: coefficient = real*B + imag*A
// So if V0 has coefficient a+bi, we apply b A-moves and a B-moves to V0

console.log('Initial:', stateToString(state));

// Parse the solution for V0
const v0_sol = math.subset(solution, math.index(0));
const v0_b_moves = Math.round(v0_sol.re);  // B moves
const v0_a_moves = Math.round(v0_sol.im);  // A moves

console.log(`\nFor V0: ${v0_b_moves} B-moves, ${v0_a_moves} A-moves`);

let currentState = state;
for (let i = 0; i < Math.abs(v0_a_moves); i++) {
  currentState = applyMove(currentState, 0, v0_a_moves > 0 ? 'A' : 'C');
  console.log(`After ${v0_a_moves > 0 ? 'A' : 'C'}0:`, stateToString(currentState));
}

for (let i = 0; i < Math.abs(v0_b_moves); i++) {
  currentState = applyMove(currentState, 0, v0_b_moves > 0 ? 'B' : 'D');
  console.log(`After ${v0_b_moves > 0 ? 'B' : 'D'}0:`, stateToString(currentState));
}

console.log('\nFinal state:', stateToString(currentState));
console.log('Is zero?', currentState.every(v => v.real === 0 && v.imag === 0));
