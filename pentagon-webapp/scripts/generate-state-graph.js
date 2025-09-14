#!/usr/bin/env node

// Pre-compute the entire pentagon state graph
// This generates all reachable states and their transitions
// for fast runtime pathfinding

const fs = require('fs');
const path = require('path');

// Move definitions (from Alex's PDF)
const moves = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: -1, imag: 0 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 1, imag: 0 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
};

// Pentagon adjacency - each vertex connects to 2 neighbors
const adjacency = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0],
};

// Convert complex state to string key for hashing
function getStateKey(complexState) {
  return complexState.map(v => `${v.real},${v.imag}`).join('|');
}

// Apply a move to a specific vertex (matches game logic)
function applyMoveToVertex(complexState, vertex, moveType, operation = 'add') {
  const newState = complexState.map(v => ({ real: v.real, imag: v.imag }));
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

// Generate the complete state graph using BFS
function generateStateGraph() {
  console.log('🔨 Building complete pentagon state graph...');
  
  // Start from zero state
  const zeroState = Array(5).fill(null).map(() => ({ real: 0, imag: 0 }));
  const zeroKey = getStateKey(zeroState);
  
  // Graph structure: each node stores state and edges to other states
  const graph = new Map();
  graph.set(zeroKey, {
    state: zeroState,
    edges: [], // Will store { targetKey, move: {vertex, moveType, operation} }
    distanceFromZero: 0
  });
  
  // BFS to explore all reachable states
  const queue = [{ state: zeroState, key: zeroKey, distance: 0 }];
  const moveTypes = ['A', 'B', 'C', 'D'];
  const operations = ['add', 'subtract'];
  
  let maxDistance = 0;
  let statesProcessed = 0;
  
  while (queue.length > 0) {
    const current = queue.shift();
    statesProcessed++;
    
    if (statesProcessed % 10 === 0) {
      console.log(`  Processed ${statesProcessed} states, found ${graph.size} unique states...`);
    }
    
    const currentNode = graph.get(current.key);
    
    // Try all possible moves from current state
    for (let vertex = 0; vertex < 5; vertex++) {
      for (const moveType of moveTypes) {
        for (const operation of operations) {
          const newState = applyMoveToVertex(current.state, vertex, moveType, operation);
          const newKey = getStateKey(newState);
          
          // Add edge from current to new state
          currentNode.edges.push({
            targetKey: newKey,
            move: { vertex, moveType, operation }
          });
          
          // If this is a new state, add it to the graph
          if (!graph.has(newKey)) {
            const newDistance = current.distance + 1;
            maxDistance = Math.max(maxDistance, newDistance);
            
            graph.set(newKey, {
              state: newState,
              edges: [],
              distanceFromZero: newDistance
            });
            
            queue.push({
              state: newState,
              key: newKey,
              distance: newDistance
            });
          }
        }
      }
    }
  }
  
  console.log(`✅ Graph complete!`);
  console.log(`  Total states: ${graph.size}`);
  console.log(`  Max distance from zero: ${maxDistance}`);
  
  return graph;
}

// Convert graph to serializable format
function serializeGraph(graph) {
  const nodes = {};
  const edges = {};
  
  for (const [key, node] of graph.entries()) {
    nodes[key] = {
      state: node.state,
      distanceFromZero: node.distanceFromZero
    };
    edges[key] = node.edges;
  }
  
  return { nodes, edges };
}

// Generate puzzles by selecting interesting starting states
function selectPuzzleStates(graph) {
  console.log('\n📊 Selecting puzzle starting states...');
  
  const puzzles = [];
  const states = Array.from(graph.entries());
  
  // Group states by distance from zero
  const statesByDistance = {};
  for (const [key, node] of states) {
    const dist = node.distanceFromZero;
    if (!statesByDistance[dist]) statesByDistance[dist] = [];
    statesByDistance[dist].push({ key, state: node.state });
  }
  
  // Select puzzles from different difficulty levels
  const difficulties = [
    { name: 'easy', distances: [3, 4, 5], count: 6 },
    { name: 'medium', distances: [6, 7, 8], count: 6 },
    { name: 'hard', distances: [9, 10, 11, 12], count: 6 }
  ];
  
  for (const diff of difficulties) {
    const availableStates = [];
    for (const dist of diff.distances) {
      if (statesByDistance[dist]) {
        availableStates.push(...statesByDistance[dist]);
      }
    }
    
    // Randomly select states for this difficulty
    for (let i = 0; i < diff.count && availableStates.length > 0; i++) {
      const index = Math.floor(Math.random() * availableStates.length);
      const selected = availableStates.splice(index, 1)[0];
      
      puzzles.push({
        id: `${diff.name}_${i + 1}`,
        startState: selected.state,
        startKey: selected.key,
        difficulty: diff.name,
        optimalMoves: graph.get(selected.key).distanceFromZero
      });
    }
    
    console.log(`  Selected ${diff.count} ${diff.name} puzzles`);
  }
  
  return puzzles;
}

// Main function
async function main() {
  console.log('🎯 Pentagon State Graph Generator');
  console.log('==================================\n');
  
  // Generate the complete state graph
  const graph = generateStateGraph();
  
  // Select puzzle starting states
  const puzzles = selectPuzzleStates(graph);
  
  // Serialize the graph
  const serialized = serializeGraph(graph);
  
  // Prepare output data
  const outputData = {
    generated: new Date().toISOString(),
    totalStates: graph.size,
    graph: serialized,
    puzzles: puzzles,
    zeroStateKey: getStateKey(Array(5).fill(null).map(() => ({ real: 0, imag: 0 })))
  };
  
  // Save to file
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'state-graph.json');
  const dataDir = path.dirname(outputPath);
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  
  console.log(`\n💾 Saved to: ${outputPath}`);
  console.log(`📈 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
  
  // Print summary
  console.log('\n📊 Summary:');
  console.log(`  Total states in graph: ${graph.size}`);
  console.log(`  Total edges: ${Array.from(graph.values()).reduce((sum, node) => sum + node.edges.length, 0)}`);
  console.log(`  Puzzles generated: ${puzzles.length}`);
  
  const avgOptimal = puzzles.reduce((sum, p) => sum + p.optimalMoves, 0) / puzzles.length;
  console.log(`  Average optimal solution: ${avgOptimal.toFixed(1)} moves`);
}

// Run the generator
main().catch(console.error);