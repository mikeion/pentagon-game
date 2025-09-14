#!/usr/bin/env node

// Offline puzzle generation script
// This runs on our development machine to pre-compute solutions

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

function toZ10Vector(complexState) {
  return [
    ...complexState.map(c => c.real),    // First 5: real parts
    ...complexState.map(c => c.imag)     // Last 5: imaginary parts  
  ];
}

function getStateId(vector) {
  return vector.join(',');
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

// Generate a single puzzle by applying random moves from zero state
function generatePuzzle(difficulty = 'medium') {
  const moveCount = {
    easy: 5,
    medium: 8,
    hard: 12
  }[difficulty] || 8;

  // Start from zero state
  let currentState = Array(5).fill(null).map(() => ({ real: 0, imag: 0 }));
  const moveTypes = ['A', 'B', 'C', 'D'];
  const operations = ['add', 'subtract'];
  
  console.log(`Generating ${difficulty} puzzle with ${moveCount} moves...`);
  
  // Apply random moves to create puzzle
  for (let i = 0; i < moveCount; i++) {
    const vertex = Math.floor(Math.random() * 5); // Random vertex 0-4
    const moveType = moveTypes[Math.floor(Math.random() * 4)];
    const operation = operations[Math.floor(Math.random() * 2)];
    
    currentState = applyMoveToVertex(currentState, vertex, moveType, operation);
    console.log(`  Applied ${moveType} ${operation} to vertex ${vertex}`);
  }
  
  return {
    startState: currentState,
    goalState: Array(5).fill({ real: 0, imag: 0 }),
    difficulty,
    generationMoves: moveCount
  };
}

// Simple BFS solver optimized for pre-computation
function solvePuzzleBFS(startState, goalState, maxDepth = 8) {
  const startKey = getStateId(toZ10Vector(startState));
  const goalKey = getStateId(toZ10Vector(goalState));
  
  if (startKey === goalKey) {
    return { found: true, moves: [] };
  }
  
  const queue = [{ state: startState, moves: [], depth: 0 }];
  const visited = new Set([startKey]);
  const moveTypes = ['A', 'B', 'C', 'D'];
  const operations = ['add', 'subtract'];
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    if (current.depth >= maxDepth) continue;
    
    // Try all moves on all vertices (5 vertices × 4 moves × 2 operations = 40 possibilities)
    for (let vertex = 0; vertex < 5; vertex++) {
      for (const moveType of moveTypes) {
        for (const operation of operations) {
          const newState = applyMoveToVertex(current.state, vertex, moveType, operation);
          const newKey = getStateId(toZ10Vector(newState));
          
          // Check if we found the goal
          if (newKey === goalKey) {
            const solution = [...current.moves, { vertex, moveType, operation }];
            return { found: true, moves: solution };
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
  }
  
  return { found: false, moves: [] };
}

async function generatePuzzleDatabase() {
  console.log('🎯 Pre-computing Pentagon Puzzle Database...');
  
  const puzzles = [];
  const difficulties = ['easy', 'medium', 'hard'];
  const puzzlesPerDifficulty = 6;
  
  for (const difficulty of difficulties) {
    console.log(`\n📊 Generating ${puzzlesPerDifficulty} ${difficulty} puzzles...`);
    
    for (let i = 0; i < puzzlesPerDifficulty; i++) {
      const puzzle = generatePuzzle(difficulty);
      
      console.log(`  Solving puzzle ${i + 1}/${puzzlesPerDifficulty}...`);
      const solution = solvePuzzleBFS(puzzle.startState, puzzle.goalState, 10);
      
      if (solution.found) {
        puzzles.push({
          id: `${difficulty}_${i + 1}`,
          ...puzzle,
          solution: solution.moves,
          solutionLength: solution.moves.length
        });
        console.log(`    ✅ Solved in ${solution.moves.length} moves`);
      } else {
        console.log(`    ❌ Could not solve - regenerating...`);
        i--; // Retry this puzzle
      }
    }
  }
  
  console.log(`\n🎉 Generated ${puzzles.length} puzzles total!`);
  
  // Save to JSON file
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'precomputed-puzzles.json');
  
  // Ensure data directory exists
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const puzzleData = {
    generated: new Date().toISOString(),
    count: puzzles.length,
    puzzles: puzzles
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(puzzleData, null, 2));
  console.log(`💾 Saved to: ${outputPath}`);
  
  // Print summary
  console.log('\n📈 Summary:');
  for (const difficulty of difficulties) {
    const count = puzzles.filter(p => p.difficulty === difficulty).length;
    const avgLength = puzzles
      .filter(p => p.difficulty === difficulty)
      .reduce((sum, p) => sum + p.solutionLength, 0) / count;
    console.log(`  ${difficulty}: ${count} puzzles, avg solution: ${avgLength.toFixed(1)} moves`);
  }
}

// Run the generator
generatePuzzleDatabase().catch(console.error);