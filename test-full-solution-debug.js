// Test the Full Solution function directly
const { create, all } = require('mathjs');
const math = create(all);

// Same state from the browser console
const testState = {
  vertices: [
    { real: 0, imag: 0 },
    { real: -2, imag: 1 },
    { real: 3, imag: 1 },
    { real: -2, imag: -2 },
    { real: 3, imag: 0 }
  ]
};

// Copy the getFullSolution function logic here
const MATRIX_INVERSE = math.matrix([
  [math.complex(3, 1), math.complex(1, -1), math.complex(-1, -1), math.complex(-1, -1), math.complex(1, -1)],
  [math.complex(1, -1), math.complex(3, 1), math.complex(1, -1), math.complex(-1, -1), math.complex(-1, -1)],
  [math.complex(-1, -1), math.complex(1, -1), math.complex(3, 1), math.complex(1, -1), math.complex(-1, -1)],
  [math.complex(-1, -1), math.complex(-1, -1), math.complex(1, -1), math.complex(3, 1), math.complex(1, -1)],
  [math.complex(1, -1), math.complex(-1, -1), math.complex(-1, -1), math.complex(1, -1), math.complex(3, 1)]
]);

const SCALED_MATRIX_INVERSE = math.multiply(MATRIX_INVERSE, 1/6);

const MOVE_MAPPINGS = {
  'A': { vertex: math.complex(1, 1), adjacent: math.complex(-1, 0) },
  'B': { vertex: math.complex(-1, 1), adjacent: math.complex(0, -1) },
  'C': { vertex: math.complex(-1, -1), adjacent: math.complex(1, 0) },
  'D': { vertex: math.complex(1, -1), adjacent: math.complex(0, 1) },
};

const adjacency = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0]
};

function simulateMove(state, vertex, moveType, operation = 'add') {
  const newState = state.map(v => ({ ...v }));
  const move = MOVE_MAPPINGS[moveType];
  const multiplier = operation === 'subtract' ? -1 : 1;

  // Convert complex numbers back to regular numbers
  const vertexMove = { real: move.vertex.re, imag: move.vertex.im };
  const adjacentMove = { real: move.adjacent.re, imag: move.adjacent.im };

  newState[vertex].real += vertexMove.real * multiplier;
  newState[vertex].imag += vertexMove.imag * multiplier;

  for (const adj of adjacency[vertex]) {
    newState[adj].real += adjacentMove.real * multiplier;
    newState[adj].imag += adjacentMove.imag * multiplier;
  }

  return newState;
}

async function getFullSolution(initialState) {
  const moves = [];
  let state = initialState.vertices.map(v => ({ ...v }));
  const maxIterations = 15;

  console.log('Starting Full Solution with state:', state);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const currentDistance = state.reduce((sum, v) => sum + Math.sqrt(v.real * v.real + v.imag * v.imag), 0);
    if (currentDistance < 0.01) {
      console.log(`Full solution found in ${iteration} moves!`);
      break;
    }

    console.log(`Iteration ${iteration + 1}, current distance: ${currentDistance.toFixed(3)}`);

    let bestMove = null;
    let bestDistance = Infinity;

    for (let vertex = 0; vertex < 5; vertex++) {
      for (const moveType of ['A', 'B', 'C', 'D']) {
        for (const operation of ['add', 'subtract']) {
          const newState = simulateMove(state, vertex, moveType, operation);
          const distance = newState.reduce((sum, v) =>
            sum + Math.sqrt(v.real * v.real + v.imag * v.imag), 0
          );

          if (distance < bestDistance) {
            bestDistance = distance;
            bestMove = { vertex, type: moveType, operation };
          }
        }
      }
    }

    if (bestMove && bestDistance < currentDistance) {
      const moveStr = bestMove.operation === 'subtract' ?
        `${bestMove.type}${bestMove.vertex} (long press)` :
        `${bestMove.type}${bestMove.vertex}`;

      moves.push(moveStr);
      state = simulateMove(state, bestMove.vertex, bestMove.type, bestMove.operation);

      console.log(`Applied ${moveStr}, new distance: ${bestDistance.toFixed(3)}`);
    } else {
      console.log('No improving move found, stopping search');
      break;
    }
  }

  return moves;
}

// Test it
console.log('Testing getFullSolution...');
getFullSolution(testState).then(result => {
  console.log('Full solution result:', result);
  console.log(`Found ${result.length} moves total`);
}).catch(err => {
  console.error('Error:', err);
});