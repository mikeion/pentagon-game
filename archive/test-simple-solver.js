// Test BFS solver with simple cases

// Simple BFS solver implementation (similar to the one in the project)
const adjacency = {
  0: [1, 4],
  1: [0, 2], 
  2: [1, 3],
  3: [2, 4],
  4: [3, 0],
};

const moves = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: -1, imag: 0 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 1, imag: 0 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
};

function getStateKey(state) {
  return state.map(v => `${v.real},${v.imag}`).join('|');
}

function applyMoveToState(state, vertex, moveType, operation = 'add') {
  const newState = state.map(v => ({ real: v.real, imag: v.imag }));
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

function solvePuzzle(startState, goalState, maxDepth = 6) {
  return new Promise((resolve) => {
    const startKey = getStateKey(startState);
    const goalKey = getStateKey(goalState);
    
    console.log(`Solver: Start key = ${startKey}`);
    console.log(`Solver: Goal key = ${goalKey}`);
    
    if (startKey === goalKey) {
      resolve({ found: true, moves: [], message: "Already solved!" });
      return;
    }
    
    const queue = [{ state: startState, moves: [], depth: 0 }];
    const visited = new Set([startKey]);
    const moveTypes = ['A', 'B', 'C', 'D'];
    const operations = ['add', 'subtract'];
    
    console.log('Starting BFS...');
    let nodesExplored = 0;
    
    while (queue.length > 0 && nodesExplored < 1000) { // Limit for testing
      const current = queue.shift();
      nodesExplored++;
      
      if (current.depth >= maxDepth) {
        continue;
      }
      
      // Try all possible moves
      for (let vertex = 0; vertex < 5; vertex++) {
        for (const moveType of moveTypes) {
          for (const operation of operations) {
            const newState = applyMoveToState(current.state, vertex, moveType, operation);
            const newKey = getStateKey(newState);
            
            // Check if we found the goal
            if (newKey === goalKey) {
              const solution = [...current.moves, { vertex, moveType, operation }];
              console.log(`Solution found! Moves: ${JSON.stringify(solution)}`);
              resolve({
                found: true,
                moves: solution,
                message: `Solved in ${solution.length} moves!`,
                nodesExplored: nodesExplored
              });
              return;
            }
            
            // Add to queue if not visited
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
      
      if (nodesExplored % 100 === 0) {
        console.log(`Explored ${nodesExplored} nodes, queue size: ${queue.length}`);
      }
    }
    
    console.log(`Search failed. Explored ${nodesExplored} nodes, found ${visited.size} unique states.`);
    resolve({
      found: false,
      moves: [],
      message: `No solution found within ${maxDepth} moves`,
      nodesExplored: nodesExplored
    });
  });
}

async function testSolver() {
  console.log('=== TESTING BFS SOLVER ===\n');
  
  // Test 1: Already solved (trivial case)
  const startState = [
    { real: 2, imag: 4 },
    { real: 2, imag: 0 },
    { real: 2, imag: 2 },
    { real: 3, imag: 4 },
    { real: 1, imag: 3 },
  ];
  
  console.log('Test 1: Already solved case');
  const result1 = await solvePuzzle(startState, startState, 3);
  console.log('Result:', result1);
  console.log('');
  
  // Test 2: Simple 1-move solution (Move A on vertex 0)
  const goalAfterMoveA = applyMoveToState(startState, 0, 'A', 'add');
  console.log('Test 2: 1-move solution (should be Move A subtract on vertex 0)');
  console.log('Goal state:', goalAfterMoveA.map((v, i) => `V${i}: ${v.real}${v.imag >= 0 ? '+' : ''}${v.imag}i`).join(', '));
  
  const result2 = await solvePuzzle(goalAfterMoveA, startState, 3);
  console.log('Result:', result2);
  console.log('');
  
  // Test 3: Your current puzzle (limited depth)
  const currentPuzzleGoal = [
    { real: -1, imag: 7 },
    { real: 2, imag: -3 },
    { real: 2, imag: 1 },
    { real: 2, imag: 5 },
    { real: 1, imag: -1 },
  ];
  
  console.log('Test 3: Current puzzle from screenshot (depth 4)');
  const result3 = await solvePuzzle(startState, currentPuzzleGoal, 4);
  console.log('Result:', result3);
}

testSolver().catch(console.error);