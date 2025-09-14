// Simple solver verification using pure JavaScript
console.log('🧪 SOLVER VERIFICATION TESTS\n');

// Recreate the solver logic in pure JS for testing
const moves = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: -1, imag: 0 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 1, imag: 0 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: 0, imag: 1 } }
};

const adjacency = {
  0: [1, 4],
  1: [0, 2], 
  2: [1, 3],
  3: [2, 4],
  4: [3, 0]
};

function getStateKey(state) {
  return state.map(v => `${v.real},${v.imag}`).join('|');
}

function applyMove(state, vertex, moveType, operation = 'add') {
  const newState = state.map(v => ({ ...v }));
  const move = moves[moveType];
  const multiplier = operation === 'subtract' ? -1 : 1;
  
  newState[vertex].real += move.vertex.real * multiplier;
  newState[vertex].imag += move.vertex.imag * multiplier;
  
  for (const adj of adjacency[vertex]) {
    newState[adj].real += move.adjacent.real * multiplier;
    newState[adj].imag += move.adjacent.imag * multiplier;
  }
  
  return newState;
}

function solvePuzzleSync(startState, goalState, maxDepth = 5) {
  const startKey = getStateKey(startState);
  const goalKey = getStateKey(goalState);
  
  if (startKey === goalKey) {
    return { found: true, moves: [], message: "Already solved!" };
  }
  
  const queue = [{ state: startState, moves: [], depth: 0 }];
  const visited = new Set([startKey]);
  const moveTypes = ['A', 'B', 'C', 'D'];
  const operations = ['add', 'subtract'];
  
  let nodesExplored = 0;
  
  while (queue.length > 0 && nodesExplored < 5000) { // Prevent infinite loops
    const current = queue.shift();
    nodesExplored++;
    
    if (current.depth >= maxDepth) {
      continue;
    }
    
    for (let vertex = 0; vertex < 5; vertex++) {
      for (const moveType of moveTypes) {
        for (const operation of operations) {
          const newState = applyMove(current.state, vertex, moveType, operation);
          const newKey = getStateKey(newState);
          
          if (newKey === goalKey) {
            const solution = [...current.moves, { vertex, moveType, operation }];
            return {
              found: true,
              moves: solution,
              message: `Solved in ${solution.length} moves!`,
              nodesExplored: nodesExplored
            };
          }
          
          if (!visited.has(newKey)) {
            visited.add(newKey);
            queue.push({
              state: newState,
              moves: [...current.moves, { vertex, moveType, operation }],
              depth: current.depth + 1
            });
          }
        }
      }
    }
  }
  
  return {
    found: false,
    moves: [],
    message: `No solution found within ${maxDepth} moves`,
    nodesExplored: nodesExplored
  };
}

// Test 1: Already solved
console.log('Test 1: Already solved case');
const zeroState = [
  { real: 0, imag: 0 },
  { real: 0, imag: 0 },
  { real: 0, imag: 0 },
  { real: 0, imag: 0 },
  { real: 0, imag: 0 }
];

const result1 = solvePuzzleSync(zeroState, zeroState, 3);
console.log('✅ Result:', result1);
console.log('Expected: 0 moves, Got:', result1.moves.length, 'moves\n');

// Test 2: Simple 1-move case
console.log('Test 2: Simple 1-move case (reverse of Move A add on V0)');

// Apply Move A to vertex 0 starting from zeros
const afterMoveA = applyMove(zeroState, 0, 'A', 'add');
console.log('After Move A add on V0:', afterMoveA.map((v, i) => `V${i}: ${v.real}${v.imag >= 0 ? '+' : ''}${v.imag}i`).join(', '));

// Now try to solve back to zeros
const result2 = solvePuzzleSync(afterMoveA, zeroState, 5);
console.log('✅ Solver result:', result2);

if (result2.found && result2.moves.length > 0) {
  const move = result2.moves[0];
  console.log('First move found:', `${move.moveType} ${move.operation} on V${move.vertex}`);
  console.log('Expected: A subtract on V0');
  
  // Verify the solution actually works
  let testState = [...afterMoveA];
  for (const move of result2.moves) {
    testState = applyMove(testState, move.vertex, move.moveType, move.operation);
  }
  
  const isBackToZero = testState.every(v => v.real === 0 && v.imag === 0);
  console.log('✅ Solution verification:', isBackToZero ? 'PASSED - reaches goal' : 'FAILED - does not reach goal');
}

console.log('\n🎯 SUMMARY:');
console.log('If Test 2 finds "A subtract on V0" in 1 move and verification passes,');
console.log('the solver is working correctly!');