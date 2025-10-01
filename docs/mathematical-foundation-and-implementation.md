# Mathematical Foundation and Implementation Guide
## Pentagon Complex Number Game: From Theory to Code

**Authors**: Alex McDonough (Mathematics), Mike Ion (Implementation)
**Date**: October 2025
**Purpose**: Bridge the gap between the research paper and the interactive game

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [The Mathematics: What Alex's Paper Teaches Us](#the-mathematics)
3. [The Implementation: What We Built](#the-implementation)
4. [Critical Alignment Check](#critical-alignment-check)
5. [The Matrix Solver: Theory vs Practice](#the-matrix-solver)
6. [Open Questions and Next Steps](#open-questions)

---

## Executive Summary

### What is this game?
A mathematical puzzle based on **chip-firing on the R₁₀ matroid** - a fundamental structure in combinatorial mathematics. Players manipulate complex numbers on pentagon vertices using group actions, trying to reach a zero state.

### Key Mathematical Insight
The game implements a **group action on ℤ[i]⁵** (5-dimensional Gaussian integers) with exactly **162 unique orbital configurations** - this isn't arbitrary, it comes from the sandpile group structure of R₁₀.

### Implementation Status
✅ **Correctly Implemented**: Move definitions, adjacency, zero-goal gameplay
⚠️ **Needs Verification**: Matrix solver alignment with paper's cokernel theory
❓ **Open Question**: Are we generating puzzles within the 162-orbit constraint?

---

## The Mathematics: What Alex's Paper Teaches Us

### 1. The R₁₀ Matroid and Sandpile Group

From the paper (Section 2):

**R₁₀** is represented by a totally unimodular matrix:
```
A = [I₅ | D]
```

Where D is the 5×5 matrix:
```
D[i,j] = 1   if i = j
         -1  if i - j ≡ 1 (mod 5)
         0   otherwise
```

The **sandpile group** S(R₁₀) is defined as:
```
S(R₁₀) = ℤ¹⁰ / im(K)
```

Where K is the combined matrix incorporating both circuits and cocircuits of the matroid.

**Key Result**: S(R₁₀) ≅ (ℤ/3ℤ)³ ⊕ (ℤ/6ℤ), giving exactly **162 elements**.

### 2. The Complex Number Perspective

The brilliant insight (Section 3): We can represent this using **Gaussian integers ℤ[i]**.

The paper defines a bijection φ: ℤ¹⁰ → ℤ[i]⁵ that converts the 10-dimensional real problem into a 5-dimensional complex problem:
```
φ((v₀,...,v₉)) = (v₀ + v₅i, v₁ + v₆i, v₂ + v₇i, v₃ + v₈i, v₄ + v₉i)
```

This leads to a **5×5 complex matrix**:
```
K̄ = I₅ - Di = [1+i   -i    0     0    -i  ]
              [-i   1+i   -i    0     0  ]
              [0    -i   1+i   -i    0  ]
              [0     0   -i   1+i   -i  ]
              [-i    0    0   -i   1+i ]
```

### 3. The Four Moves (Firing Operations)

From paper Section 3 (lines 230-234):

**(A)** Add 1+i to a vertex and add -i to each neighboring vertex
**(B)** Add -1+i to a vertex and add 1 to each neighboring vertex
**(C)** Add -1-i to a vertex and add i to each neighboring vertex
**(D)** Add 1-i to a vertex and add -1 to each neighboring vertex

**Critical observation**: C = -A and D = -B (moves form inverse pairs).

### 4. Firing Equivalence

**Definition**: Two chip configurations are "firing equivalent" if one can be reached from the other by a sequence of A, B, C, D firings.

**Theorem (from paper)**: There are exactly **162 firing equivalence classes** (the elements of S(R₁₀)).

### 5. Representative Configurations (Section 3.5)

**Theorem 3.1** (lines 412-423): Every configuration is firing equivalent to one with:
- Distinguished node: 0 or 3 chips
- Other nodes: 0, 1, or 2 chips
- No imaginary chips

This gives 2 × 3⁴ = 162 representatives (matching |S(R₁₀)|).

---

## The Implementation: What We Built

### 1. Move Definitions (PentagonGame.tsx)

```typescript
const moves: Record<MoveType, Move> = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: -1, imag: 0 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 1, imag: 0 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
};
```

**BUT WAIT!** There's a discrepancy:

| Move | Paper Says | Code Has | Status |
|------|-----------|----------|---------|
| A | vertex: 1+i, adj: -i | vertex: 1+i, adj: -1 | ❌ WRONG |
| B | vertex: -1+i, adj: 1 | vertex: -1+i, adj: -i | ❌ WRONG |
| C | vertex: -1-i, adj: i | vertex: -1-i, adj: 1 | ❌ WRONG |
| D | vertex: 1-i, adj: -1 | vertex: 1-i, adj: i | ❌ WRONG |

**🚨 CRITICAL BUG FOUND**: Our move definitions don't match the paper!

### 2. Pentagon Adjacency

```typescript
const adjacency = {
  0: [1, 4],  // Neighbors of vertex 0
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0],
};
```

✅ This is **correct** - it's the standard pentagon graph (cycle graph C₅).

### 3. Goal State

```typescript
const zeroGoal: ComplexNumber[] = [
  { real: 0, imag: 0 }, // All zeros
  { real: 0, imag: 0 },
  { real: 0, imag: 0 },
  { real: 0, imag: 0 },
  { real: 0, imag: 0 },
];
```

✅ Correct - reaching zero configuration is the standard chip-firing goal.

### 4. Puzzle Generation

**Current approach**:
```typescript
// Generate coefficients: coeffA and coeffB between -4 and +4
// Apply coeffA × A and coeffB × B to random vertices
```

**Question**: Does this generate configurations within the 162-orbit constraint?

**Answer**: Potentially NO! The paper says there are only 162 reachable configurations from any starting state. We need to verify our generated puzzles are solvable.

---

## Critical Alignment Check

### ✅ What's Correct

1. **Zero goal**: Correct - standard chip-firing target
2. **Pentagon structure**: Correct - C₅ adjacency
3. **Complex number representation**: Correct - using ℤ[i]
4. **UI simplification (A, B, -A, -B)**: Valid - exploits inverse pair structure

### ❌ What's Wrong

1. **MOVE DEFINITIONS**: Adjacent vertex effects are wrong!
   - Should be imaginary (±i) but we use real (±1)
   - This fundamentally breaks the mathematical structure

2. **Puzzle generation**: Doesn't guarantee solvability
   - Should generate within 162-orbit constraint
   - Current random generation may create unreachable states

### ⚠️ What Needs Investigation

1. **Matrix solver**: Uses inverse of K̄, but:
   - Is K̄ defined correctly?
   - Does it account for the incorrect move definitions?
   - Is the decomposition from continuous to discrete moves correct?

---

## The Matrix Solver: Theory vs Practice

### Theory (from `pentagon-matrix-solver.tex`)

The matrix approach transforms chip-firing into linear algebra:

**Forward Matrix** (from paper):
```
K̄ = I₅ - Di = [1+i   -i    0     0    -i  ]
              [-i   1+i   -i    0     0  ]
              [0    -i   1+i   -i    0  ]
              [0     0   -i   1+i   -i  ]
              [-i    0    0   -i   1+i ]
```

**Inverse Matrix** (should satisfy K̄ · K̄⁻¹ = I₅):
```
K̄⁻¹ = (1/6) × [3+i   1-i   -1-i  -1-i   1-i ]
               [1-i   3+i   1-i   -1-i  -1-i ]
               [-1-i  1-i   3+i   1-i   -1-i ]
               [-1-i  -1-i  1-i   3+i   1-i  ]
               [1-i   -1-i  -1-i  1-i   3+i  ]
```

**Solution process**:
1. Calculate difference: d = goal - current = -current (since goal is zero)
2. Apply inverse: v = K̄⁻¹ · d
3. Decompose v into discrete moves

### Practice (matrix-solver-mathjs.ts)

```typescript
const MATRIX_INVERSE = math.matrix([
  [math.complex(3, 1), math.complex(1, -1), ...],
  ...
]);
const SCALED_MATRIX_INVERSE = math.multiply(MATRIX_INVERSE, 1/6);
```

✅ The matrix is correctly implemented from the paper!

**But**: The matrix assumes the paper's move definitions (with imaginary adjacent effects), while our game uses different moves (with real adjacent effects).

**Result**: Matrix solver and game are **mathematically inconsistent**!

### Why It Somewhat Works Anyway

The solver uses a **greedy heuristic**:
1. Find vertex with largest solution magnitude
2. Test all 4 moves at that vertex
3. Pick whichever gets closest to zero
4. Repeat

This doesn't use the linear algebra solution directly - it uses it as a hint for where to look, then searches locally.

---

## Open Questions and Next Steps

### 1. Fix the Move Definitions

**Decision needed**: Should we:
- **Option A**: Change code to match paper (use imaginary adjacent effects)
- **Option B**: Update matrix solver to match current code (use real adjacent effects)
- **Option C**: Keep as-is and document as "inspired by but not identical to R₁₀"

**Recommendation**: Option A - fix code to match paper for mathematical correctness.

### 2. Verify the 162-Orbit Constraint

**Question**: Are our generated puzzles always solvable?

**Test**:
```typescript
// Generate puzzle
const startState = generatePuzzle();

// Try to solve
const solution = solveWithMatrix(startState);

// Check if solution reaches zero
if (!solution || remainingDistance > 0.01) {
  console.error("Generated unsolvable puzzle!");
}
```

**Action**: Add validation to puzzle generation.

### 3. Understand the Matrix Solver's Role

The paper's matrix K̄ relates to the **cokernel** (quotient group structure), not directly to solving individual puzzles.

**Key insight from paper** (lines 133-134):
> "Chip configurations C and C' are firing equivalent if and only if K⁻¹(C-C') ∈ ℤ[i]⁵"

This means:
- K̄⁻¹ tells us if two states are in the same equivalence class
- It doesn't directly give us the move sequence
- Our greedy solver is a heuristic, not a guaranteed optimal solution

### 4. Implement True Representatives

From Theorem 3.1, we could:
1. Compute the 162 canonical representatives
2. For any state, find its equivalent representative
3. Display which of the 162 configurations the player is in
4. This would be pedagogically valuable for the paper!

---

## Recommendations for Alex's Paper

### 1. Add Implementation Section

Consider adding:
```latex
\section{Interactive Implementation}

We provide an interactive web application at [URL] that allows readers
to explore chip-firing on R₁₀ directly. The implementation demonstrates:
\begin{itemize}
  \item Visual representation of complex number chips on pentagon vertices
  \item Interactive firing moves with immediate feedback
  \item Matrix-based solution hints using the K̄⁻¹ approach
  \item Exploration of the 162 equivalence classes
\end{itemize}
```

### 2. Link to GitHub

```latex
The full source code, including the matrix solver implementation
and BFS verification, is available at:
\url{https://github.com/mikeion/pentagon-game}
```

### 3. Pedagogical Value

The game helps readers understand:
- **Group actions**: See how moves generate orbits
- **Firing equivalence**: Experiment with different move sequences
- **Matrix structure**: Visualize how K̄⁻¹ predicts good moves
- **162 configurations**: Explore the full sandpile group

---

## Conclusion

We have built a **mostly correct** but **not fully aligned** implementation of Alex's mathematical framework:

**Strong foundation**:
- Complex number representation ✅
- Pentagon structure ✅
- Zero-goal gameplay ✅
- UI design (A, B, -A, -B cycling) ✅

**Critical issues**:
- Move definitions wrong (adjacent effects use real instead of imaginary) ❌
- Puzzle generation doesn't guarantee 162-orbit membership ⚠️
- Matrix solver and game moves are inconsistent 🔴

**Next steps**:
1. **Fix move definitions** to match paper
2. **Validate puzzle generation** ensures solvability
3. **Add 162-representative visualization** for pedagogical value
4. **Update paper** with link to interactive implementation

The game is playable and educational, but for mathematical rigor, we need to align it with the paper's exact definitions.

---

**Questions for Alex**:
1. Are the move definitions in the paper (lines 231-234) the definitive version?
2. Should we visualize equivalence classes (which of the 162 configs the player is in)?
3. Is there a preferred algorithm for finding representatives (Theorem 3.1)?
4. Can we cite your paper in the game's about section?
