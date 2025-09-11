import { solvePuzzle } from './solver';
import { ComplexNumber } from '@/types/game';

// Test the solver with simple cases
export async function testSolver() {
  console.log('🧪 Starting solver tests...');
  
  // Test 1: Already solved (should return immediately)
  const startState: ComplexNumber[] = [
    { real: 2, imag: 4 },
    { real: 2, imag: 0 },
    { real: 2, imag: 2 },
    { real: 3, imag: 4 },
    { real: 1, imag: 3 },
  ];
  
  console.log('Test 1: Already solved');
  const result1 = await solvePuzzle(startState, startState, 3);
  console.log('✅ Result:', result1);
  
  // Test 2: Simple 1-move solution
  // Apply Move A to vertex 0, then try to solve back
  const goalState: ComplexNumber[] = [
    { real: startState[0].real + 1, imag: startState[0].imag + 1 }, // vertex gets +1+i
    { real: startState[1].real - 1, imag: startState[1].imag },     // adjacent gets -1
    { real: startState[2].real, imag: startState[2].imag },         // unchanged
    { real: startState[3].real, imag: startState[3].imag },         // unchanged  
    { real: startState[4].real - 1, imag: startState[4].imag },     // adjacent gets -1
  ];
  
  console.log('Test 2: 1-move solution (Move A on vertex 0)');
  console.log('Start:', startState);
  console.log('Goal:', goalState);
  
  const result2 = await solvePuzzle(startState, goalState, 3);
  console.log('✅ Result:', result2);
  
  // Test 3: 2-move solution
  // Apply Move A to vertex 0, then Move B to vertex 1
  const twoMoveGoal: ComplexNumber[] = [
    { real: 2, imag: 4 }, // Will be modified by both moves
    { real: 0, imag: 1 }, // Gets Move A adjacent (-1) + Move B vertex (-1+i)
    { real: 2, imag: 1 }, // Gets Move B adjacent (-i)
    { real: 3, imag: 4 }, // unchanged
    { real: 0, imag: 3 }, // Gets Move A adjacent (-1)
  ];
  
  console.log('Test 3: 2-move solution');
  const result3 = await solvePuzzle(startState, twoMoveGoal, 4);
  console.log('✅ Result:', result3);
  
  // Test 4: Impossible solution (different total)
  const impossibleGoal: ComplexNumber[] = [
    { real: 1000, imag: 1000 },
    { real: 1000, imag: 1000 },
    { real: 1000, imag: 1000 },
    { real: 1000, imag: 1000 },
    { real: 1000, imag: 1000 },
  ];
  
  console.log('Test 4: Impossible solution (should fail)');
  const result4 = await solvePuzzle(startState, impossibleGoal, 3);
  console.log('✅ Result:', result4);
  
  console.log('🧪 All tests completed!');
}