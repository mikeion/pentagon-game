// Test the matrix solver integration
// Run with: node test-matrix-integration.js

// Matrix solver implementation in JavaScript for testing
const MATRIX_INVERSE = [
  [{ r: 3/6, i: 1/6 }, { r: 1/6, i: -1/6 }, { r: -1/6, i: -1/6 }, { r: -1/6, i: -1/6 }, { r: 1/6, i: -1/6 }],
  [{ r: 1/6, i: -1/6 }, { r: 3/6, i: 1/6 }, { r: 1/6, i: -1/6 }, { r: -1/6, i: -1/6 }, { r: -1/6, i: -1/6 }],
  [{ r: -1/6, i: -1/6 }, { r: 1/6, i: -1/6 }, { r: 3/6, i: 1/6 }, { r: 1/6, i: -1/6 }, { r: -1/6, i: -1/6 }],
  [{ r: -1/6, i: -1/6 }, { r: -1/6, i: -1/6 }, { r: 1/6, i: -1/6 }, { r: 3/6, i: 1/6 }, { r: 1/6, i: -1/6 }],
  [{ r: 1/6, i: -1/6 }, { r: -1/6, i: -1/6 }, { r: -1/6, i: -1/6 }, { r: 1/6, i: -1/6 }, { r: 3/6, i: 1/6 }]
];

const MOVES = {
  'A': { vertex: { r: 1, i: 1 }, adjacent: { r: -1, i: 0 } },
  'B': { vertex: { r: -1, i: 1 }, adjacent: { r: 0, i: -1 } },
  'C': { vertex: { r: 1, i: -1 }, adjacent: { r: 1, i: 0 } },
  'D': { vertex: { r: 1, i: -1 }, adjacent: { r: 0, i: 1 } },
};

const adjacency = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0]
};

function complexMultiply(a, b) {
  return {
    r: a.r * b.r - a.i * b.i,
    i: a.r * b.i + a.i * b.r
  };
}

function complexAdd(a, b) {
  return { r: a.r + b.r, i: a.i + b.i };
}

function matrixVectorMultiply(matrix, vector) {
  const result = [];
  for (let i = 0; i < 5; i++) {
    let sum = { r: 0, i: 0 };
    for (let j = 0; j < 5; j++) {
      const product = complexMultiply(matrix[i][j], vector[j]);
      sum = complexAdd(sum, product);
    }
    result.push(sum);
  }
  return result;
}

function applyMove(state, vertex, moveType) {
  const newState = state.map(v => ({ ...v }));
  const move = MOVES[moveType];

  // Apply to selected vertex
  newState[vertex].r += move.vertex.r;
  newState[vertex].i += move.vertex.i;

  // Apply to adjacent vertices
  for (const adj of adjacency[vertex]) {
    newState[adj].r += move.adjacent.r;
    newState[adj].i += move.adjacent.i;
  }

  return newState;
}

function findBestMove(state) {
  let bestMove = null;
  let bestDistance = Infinity;

  // Calculate current distance from zero
  const currentDistance = state.reduce((sum, v) =>
    sum + Math.sqrt(v.r * v.r + v.i * v.i), 0);

  // Try all possible moves
  for (let vertex = 0; vertex < 5; vertex++) {
    for (const moveType of ['A', 'B', 'C', 'D']) {
      const newState = applyMove(state, vertex, moveType);
      const distance = newState.reduce((sum, v) =>
        sum + Math.sqrt(v.r * v.r + v.i * v.i), 0);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestMove = { vertex, type: moveType, newState };
      }
    }
  }

  // Only return move if it improves the state
  if (bestDistance < currentDistance) {
    return bestMove;
  }
  return null;
}

function solveGreedy(initialState, maxMoves = 20) {
  const moves = [];
  let state = initialState.map(v => ({ ...v }));

  console.log('\nGreedy solver starting...');
  console.log('Initial state:', state.map(v => `${v.r.toFixed(2)}+${v.i.toFixed(2)}i`));

  for (let i = 0; i < maxMoves; i++) {
    const distance = state.reduce((sum, v) =>
      sum + Math.sqrt(v.r * v.r + v.i * v.i), 0);

    if (distance < 0.01) {
      console.log(`Reached zero in ${i} moves!`);
      break;
    }

    const bestMove = findBestMove(state);
    if (!bestMove) {
      console.log(`No improving move found after ${i} moves`);
      break;
    }

    moves.push(`${bestMove.type}${bestMove.vertex}`);
    state = bestMove.newState;
    console.log(`Move ${i+1}: ${bestMove.type}${bestMove.vertex} -> distance: ${distance.toFixed(3)}`);
  }

  console.log('Final state:', state.map(v => `${v.r.toFixed(2)}+${v.i.toFixed(2)}i`));
  console.log('Moves:', moves.join(' '));
  return moves;
}

// Test with the game state from the screenshot
function testWithGameState() {
  console.log('Testing Matrix Solver with Game State');
  console.log('=====================================\n');

  // State from the screenshot
  const gameState = [
    { r: 1, i: 2 },   // V0: 1+2i
    { r: -1, i: -1 }, // V1: -1-1i
    { r: 1, i: 0 },   // V2: 1+0i
    { r: 0, i: 2 },   // V3: 0+2i
    { r: 2, i: -2 }   // V4: 2-2i
  ];

  console.log('Current game state:');
  gameState.forEach((v, i) => console.log(`  V${i}: ${v.r} + ${v.i}i`));

  // Calculate difference vector (negative of current state for zero goal)
  const difference = gameState.map(v => ({ r: -v.r, i: -v.i }));

  console.log('\nDifference vector (to reach zero):');
  difference.forEach((v, i) => console.log(`  V${i}: ${v.r} + ${v.i}i`));

  // Apply inverse matrix
  const solution = matrixVectorMultiply(MATRIX_INVERSE, difference);

  console.log('\nSolution vector:');
  solution.forEach((v, i) => {
    const magnitude = Math.sqrt(v.r * v.r + v.i * v.i);
    console.log(`  V${i}: ${v.r.toFixed(3)} + ${v.i.toFixed(3)}i (magnitude: ${magnitude.toFixed(3)})`);
  });

  console.log('\n--- Attempting Greedy Solution ---');
  const moves = solveGreedy(gameState);

  // Verify solution
  console.log('\n--- Verification ---');
  let testState = gameState.map(v => ({ ...v }));
  for (const moveStr of moves) {
    const moveType = moveStr[0];
    const vertex = parseInt(moveStr[1]);
    testState = applyMove(testState, vertex, moveType);
  }
  console.log('State after applying moves:', testState.map(v => `${v.r.toFixed(2)}+${v.i.toFixed(2)}i`));
}

testWithGameState();