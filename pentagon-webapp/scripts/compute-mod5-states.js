#!/usr/bin/env node

// Compute all reachable states in the pentagon game with mod 5 arithmetic
// This should give us Alex's 162 states

const fs = require('fs');
const path = require('path');

// Move definitions (from Alex's PDF)
const moves = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: -1, imag: 0 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 1, imag: 0 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
};

// Pentagon adjacency
const adjacency = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0],
};

// Modulo operation that handles negative numbers correctly
function mod(n, m) {
  return ((n % m) + m) % m;
}

// Get state key for hashing
function getStateKey(state) {
  return state.map(v => `${v.real},${v.imag}`).join('|');
}

// Apply move to vertex with mod 5 arithmetic
function applyMoveToVertexMod5(state, vertex, moveType, operation = 'add') {
  const newState = state.map(v => ({ real: v.real, imag: v.imag }));
  const move = moves[moveType];
  const multiplier = operation === 'subtract' ? -1 : 1;
  
  // Apply to selected vertex with mod 5
  newState[vertex].real = mod(newState[vertex].real + move.vertex.real * multiplier, 5);
  newState[vertex].imag = mod(newState[vertex].imag + move.vertex.imag * multiplier, 5);
  
  // Apply to adjacent vertices with mod 5
  for (const adj of adjacency[vertex]) {
    newState[adj].real = mod(newState[adj].real + move.adjacent.real * multiplier, 5);
    newState[adj].imag = mod(newState[adj].imag + move.adjacent.imag * multiplier, 5);
  }
  
  return newState;
}

// Compute all reachable states using BFS
function computeAllStates() {
  console.log('🔢 Computing all reachable states with mod 5 arithmetic...\n');
  
  // Start from zero state
  const zeroState = Array(5).fill(null).map(() => ({ real: 0, imag: 0 }));
  const zeroKey = getStateKey(zeroState);
  
  const states = new Map();
  states.set(zeroKey, {
    state: zeroState,
    distance: 0,
    parent: null,
    move: null
  });
  
  const queue = [{ state: zeroState, key: zeroKey, distance: 0 }];
  const moveTypes = ['A', 'B', 'C', 'D'];
  const operations = ['add', 'subtract'];
  
  let maxDistance = 0;
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    // Try all possible moves
    for (let vertex = 0; vertex < 5; vertex++) {
      for (const moveType of moveTypes) {
        for (const operation of operations) {
          const newState = applyMoveToVertexMod5(current.state, vertex, moveType, operation);
          const newKey = getStateKey(newState);
          
          // If this is a new state, add it
          if (!states.has(newKey)) {
            const newDistance = current.distance + 1;
            maxDistance = Math.max(maxDistance, newDistance);
            
            states.set(newKey, {
              state: newState,
              distance: newDistance,
              parent: current.key,
              move: { vertex, moveType, operation }
            });
            
            queue.push({
              state: newState,
              key: newKey,
              distance: newDistance
            });
            
            if (states.size % 10 === 0) {
              console.log(`  Found ${states.size} states so far...`);
            }
          }
        }
      }
    }
  }
  
  console.log(`\n✅ Computation complete!`);
  console.log(`📊 Total reachable states: ${states.size}`);
  console.log(`📏 Maximum distance from zero: ${maxDistance}`);
  
  // Analyze the structure
  const byDistance = {};
  for (const [key, data] of states.entries()) {
    const dist = data.distance;
    if (!byDistance[dist]) byDistance[dist] = 0;
    byDistance[dist]++;
  }
  
  console.log(`\n📈 States by distance from zero:`);
  for (let d = 0; d <= maxDistance; d++) {
    if (byDistance[d]) {
      console.log(`  Distance ${d}: ${byDistance[d]} states`);
    }
  }
  
  // Check if it's 162
  if (states.size === 162) {
    console.log(`\n🎉 SUCCESS! We found exactly 162 states as Alex predicted!`);
  } else {
    console.log(`\n🤔 We found ${states.size} states, not 162. Maybe try a different modulus?`);
  }
  
  // Save the results
  const output = {
    generated: new Date().toISOString(),
    modulus: 5,
    totalStates: states.size,
    maxDistance: maxDistance,
    statesByDistance: byDistance,
    states: Array.from(states.entries()).map(([key, data]) => ({
      key,
      state: data.state,
      distance: data.distance
    }))
  };
  
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'mod5-states.json');
  const dataDir = path.dirname(outputPath);
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 Saved to: ${outputPath}`);
  
  return states.size;
}

// Run the computation
computeAllStates();