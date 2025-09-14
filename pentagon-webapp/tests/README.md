# Test Files

This directory contains test files for the Pentagon Complex Number Game.

## Current Tests

### `test-mathjs-solver.js`
Tests the math.js matrix solver implementation that uses Alex's 5×5 complex matrix approach.
Run with: `node tests/test-mathjs-solver.js`

### `test-hint-debug.js`
Debugging tool for testing hint calculations with specific game states.
Run with: `node tests/test-hint-debug.js`

### `test-correct-solution.js`
Tests move validation and solution verification for the current solver.
Run with: `node tests/test-correct-solution.js`

## Running Tests

All tests are Node.js scripts that can be run independently:

```bash
cd pentagon-webapp
node tests/test-mathjs-solver.js
node tests/test-hint-debug.js
node tests/test-correct-solution.js
```

## Legacy Tests

Older test files have been kept in the parent directory but are likely outdated:
- `test-matrix-integration.js` - Old matrix solver tests
- `test-simple-matrix.js` - Simple matrix tests
- `test-solver-simple.js` - Old BFS solver tests
- `verify-solver.js` - Old solver verification

These can likely be removed if no longer needed.