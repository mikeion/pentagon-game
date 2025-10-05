// Test BOTH coefficient interpretations and see which works
const math = require('mathjs');

// Matrix from paper
const MATRIX_INVERSE = math.matrix([
  [math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1)],
  [math.complex(1, 1), math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1)],
  [math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1), math.complex(1, 1), math.complex(-1, 1)],
  [math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1), math.complex(1, 1)],
  [math.complex(1, 1), math.complex(-1, 1), math.complex(-1, 1), math.complex(1, 1), math.complex(3, -1)]
]);
const SCALED = math.multiply(MATRIX_INVERSE, 1/6);

// Test state: V0: -3+0i (rest zero)
const state = math.matrix([math.complex(-3, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0), math.complex(0, 0)]);
const diff = math.multiply(state, -1);
const sol = math.multiply(SCALED, diff);

console.log('State: V0=-3+0i, rest zero');
console.log('We GENERATED this with: 2C at V0 (which is -2A)');
console.log('So to UNDO, we need: 2A at V0');
console.log('');

const v0 = math.subset(sol, math.index(0));
console.log(`Solution V0: ${v0.re.toFixed(3)} + ${v0.im.toFixed(3)}i`);
console.log('');

console.log('=== INTERPRETATION 1: real=B, imag=A ===');
const b1 = Math.round(v0.re);
const a1 = Math.round(v0.im);
console.log(`${b1}B, ${a1}A at V0`);
console.log(`Match expected (2A)? ${a1 === 2 && b1 === 0 ? 'YES!' : 'NO'}`);
console.log('');

console.log('=== INTERPRETATION 2: real=-B, imag=-A (negate) ===');
const b2 = -Math.round(v0.re);
const a2 = -Math.round(v0.im);
console.log(`${b2}B, ${a2}A at V0`);
console.log(`Match expected (2A)? ${a2 === 2 && b2 === 0 ? 'YES!' : 'NO'}`);
console.log('');

console.log('=== INTERPRETATION 3: real=D, imag=C (from PDF) ===');
// D = -B, C = -A
const d3 = Math.round(v0.re);
const c3 = Math.round(v0.im);
console.log(`${d3}D, ${c3}C at V0`);
console.log(`Which is: ${-d3}B, ${-c3}A`);
console.log(`Match expected (2A)? ${-c3 === 2 && -d3 === 0 ? 'YES!' : 'NO'}`);
console.log('');

console.log('=== INTERPRETATION 4: SWAP real and imag ===');
const b4 = Math.round(v0.im);
const a4 = Math.round(v0.re);
console.log(`${b4}B, ${a4}A at V0`);
console.log(`Match expected (2A)? ${a4 === 2 && b4 === 0 ? 'YES!' : 'NO'}`);
