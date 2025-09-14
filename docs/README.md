# Documentation

This directory contains documentation and research files for the Pentagon Complex Number Game.

## Contents

### Research Documents
- `How does the firing work.pdf` - Alex's original research document
- `Pentagon complex firing game.pdf` - Additional research materials

### LaTeX Source Files
- `main.tex` - Alex's original mathematical formulation
- `pentagon-matrix-solver.tex` - LaTeX source for matrix solver documentation
- `pentagon-matrix-solver.pdf` - Compiled PDF of matrix solver approach

### LaTeX Compilation Artifacts
- `pentagon-matrix-solver.aux` - LaTeX auxiliary file
- `pentagon-matrix-solver.log` - LaTeX compilation log

## Mathematical Foundation

The core mathematical approach is documented in Alex McDonough's research, showing:
- 5×5 complex matrix representation M̄
- Matrix inverse M̄⁻¹ for direct solution calculation
- Group theory foundation with exactly 162 orbital configurations
- Linear algebra approach vs. exponential BFS search

## Implementation

The mathematical formulation in these documents is implemented in:
- `pentagon-webapp/src/utils/matrix-solver-mathjs.ts` - Math.js implementation
- `pentagon-webapp/src/app/matrix-solver/page.tsx` - Educational visualization