// Verification script to test if the solver actually works
const { solvePuzzle } = require('./pentagon-webapp/src/utils/solver.ts');

// Test cases to verify solver functionality
async function verifySolver() {
  console.log('🧪 SOLVER VERIFICATION TESTS\n');
  
  // Test 1: Already solved (should return 0 moves)
  const alreadySolved = [
    { real: 0, imag: 0 },
    { real: 0, imag: 0 },
    { real: 0, imag: 0 },
    { real: 0, imag: 0 },
    { real: 0, imag: 0 }
  ];
  
  console.log('Test 1: Already solved case');
  try {
    const result1 = await solvePuzzle(alreadySolved, alreadySolved, 3);
    console.log('✅ Result:', result1);
    console.log('Expected: 0 moves, Got:', result1.moves.length, 'moves\n');
  } catch (error) {
    console.log('❌ Error:', error.message, '\n');
  }
  
  // Test 2: Simple 1-move case - apply Move A to V0, then solve back
  const zeroState = [
    { real: 0, imag: 0 },
    { real: 0, imag: 0 },
    { real: 0, imag: 0 },
    { real: 0, imag: 0 },
    { real: 0, imag: 0 }
  ];
  
  // Manually apply Move A add to vertex 0
  // Move A: vertex gets +1+i, adjacent vertices (1,4) get -1+0i
  const afterMoveA = [
    { real: 1, imag: 1 },   // V0: 0+0i + (1+1i) = 1+1i
    { real: -1, imag: 0 },  // V1: 0+0i + (-1+0i) = -1+0i  
    { real: 0, imag: 0 },   // V2: unchanged
    { real: 0, imag: 0 },   // V3: unchanged
    { real: -1, imag: 0 }   // V4: 0+0i + (-1+0i) = -1+0i
  ];
  
  console.log('Test 2: Simple 1-move case (reverse of Move A add on V0)');
  console.log('Start state:', afterMoveA.map((v, i) => `V${i}: ${v.real}${v.imag >= 0 ? '+' : ''}${v.imag}i`).join(', '));
  console.log('Goal state: All zeros');
  
  try {
    const result2 = await solvePuzzle(afterMoveA, zeroState, 5);
    console.log('✅ Result:', result2);
    console.log('Expected: 1 move (Move A subtract on V0), Got:', result2.moves.length, 'moves');
    if (result2.found && result2.moves.length > 0) {
      const move = result2.moves[0];
      console.log('First move:', `${move.moveType} ${move.operation} on V${move.vertex}`);
      console.log('Expected: A subtract on V0');
    }
    console.log('');
  } catch (error) {
    console.log('❌ Error:', error.message, '\n');
  }
  
  // Test 3: Verify the move application logic
  console.log('Test 3: Verify move application logic');
  
  // Apply Move A subtract to afterMoveA state - should get back to zeros
  const moves = {
    'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: -1, imag: 0 } }
  };
  const adjacency = { 0: [1, 4], 1: [0, 2], 2: [1, 3], 3: [2, 4], 4: [3, 0] };
  
  function applyMove(state, vertex, moveType, operation) {
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
  
  const backToZero = applyMove(afterMoveA, 0, 'A', 'subtract');
  console.log('After applying Move A subtract to V0:', backToZero.map((v, i) => `V${i}: ${v.real}${v.imag >= 0 ? '+' : ''}${v.imag}i`).join(', '));
  
  const isBackToZero = backToZero.every(v => v.real === 0 && v.imag === 0);
  console.log('✅ Manual verification:', isBackToZero ? 'PASSED - back to zeros' : 'FAILED - not zeros');
  
  console.log('\n🎯 SUMMARY:');
  console.log('If Test 2 finds "A subtract on V0" in 1 move, the solver is working correctly!');
}

verifySolver().catch(console.error);