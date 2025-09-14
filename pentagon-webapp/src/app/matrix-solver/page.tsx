'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ComplexNumber, GameState } from '@/types/game';

// Original 10x10 Matrix from Alex's LaTeX document
const ORIGINAL_10x10_MATRIX = [
  [1, 0, 0, 0, 0, -1, 1, 0, 0, 1],
  [0, 1, 0, 0, 0, 1, -1, 1, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, -1, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 1, -1, 1],
  [0, 0, 0, 0, 1, 1, 0, 0, 1, -1],
  [-1, 1, 0, 0, 1, -1, 0, 0, 0, 0],
  [1, -1, 1, 0, 0, 0, -1, 0, 0, 0],
  [0, 1, -1, 1, 0, 0, 0, -1, 0, 0],
  [0, 0, 1, -1, 1, 0, 0, 0, -1, 0],
  [1, 0, 0, 1, -1, 0, 0, 0, 0, -1]
];

// 5x5 Complex Matrix (M̄) - what we actually use
const COMPLEX_5x5_MATRIX = [
  [{ real: 1, imag: -1 }, { real: 0, imag: 1 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 1 }],
  [{ real: 0, imag: 1 }, { real: 1, imag: -1 }, { real: 0, imag: 1 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }],
  [{ real: 0, imag: 0 }, { real: 0, imag: 1 }, { real: 1, imag: -1 }, { real: 0, imag: 1 }, { real: 0, imag: 0 }],
  [{ real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 1 }, { real: 1, imag: -1 }, { real: 0, imag: 1 }],
  [{ real: 0, imag: 1 }, { real: 0, imag: 0 }, { real: 0, imag: 0 }, { real: 0, imag: 1 }, { real: 1, imag: -1 }]
];

// Matrix inverse for display (M̄⁻¹)
const MATRIX_INVERSE = [
  [{ real: 3/6, imag: 1/6 }, { real: 1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }, { real: 1/6, imag: -1/6 }],
  [{ real: 1/6, imag: -1/6 }, { real: 3/6, imag: 1/6 }, { real: 1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }],
  [{ real: -1/6, imag: -1/6 }, { real: 1/6, imag: -1/6 }, { real: 3/6, imag: 1/6 }, { real: 1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }],
  [{ real: -1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }, { real: 1/6, imag: -1/6 }, { real: 3/6, imag: 1/6 }, { real: 1/6, imag: -1/6 }],
  [{ real: 1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }, { real: -1/6, imag: -1/6 }, { real: 1/6, imag: -1/6 }, { real: 3/6, imag: 1/6 }]
];

interface StepData {
  step: number;
  title: string;
  description: string;
  currentState?: ComplexNumber[];
  differenceVector?: ComplexNumber[];
  solutionVector?: ComplexNumber[];
  highlightMatrix?: { row: number; col: number } | null;
  moves?: string[];
}

function formatComplex(c: ComplexNumber): string {
  const real = Math.round(c.real * 1000) / 1000;
  const imag = Math.round(c.imag * 1000) / 1000;

  if (real === 0 && imag === 0) return '0';
  if (real === 0) return `${imag}i`;
  if (imag === 0) return `${real}`;
  if (imag > 0) return `${real}+${imag}i`;
  return `${real}${imag}i`;
}

function ComplexNumberDisplay({ value, highlight = false }: { value: ComplexNumber; highlight?: boolean }) {
  return (
    <div className={`
      px-3 py-2 rounded-lg text-center font-mono text-sm transition-all duration-300
      ${highlight
        ? 'bg-pink-600/30 border-2 border-pink-400 text-pink-200'
        : 'bg-slate-700/50 border border-slate-600 text-slate-300'
      }
    `}>
      {formatComplex(value)}
    </div>
  );
}

function RealMatrixDisplay({
  matrix,
  title,
  size = "small"
}: {
  matrix: number[][];
  title: string;
  size?: "small" | "large";
}) {
  const cellSize = size === "large" ? "w-8 h-8 text-xs" : "w-6 h-6 text-[10px]";
  const cols = matrix[0]?.length || 0;

  return (
    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600">
      <div className="text-xs text-slate-400 mb-2 text-center">{title}</div>
      <div
        className="grid gap-1 mx-auto w-fit"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {matrix.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`${cellSize} flex items-center justify-center bg-slate-700/50 border border-slate-600 rounded text-slate-300 font-mono`}
            >
              {cell === 0 ? '0' : cell > 0 ? `${cell}` : `${cell}`}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MatrixDisplay({
  matrix,
  title = "M⁻¹ (Inverse Matrix)",
  highlight = null
}: {
  matrix: ComplexNumber[][];
  title?: string;
  highlight?: { row: number; col: number } | null;
}) {
  return (
    <div className="inline-block p-4 bg-slate-800/50 rounded-xl border border-slate-600">
      <div className="text-xs text-slate-400 mb-2 text-center">{title}</div>
      <div className="grid grid-cols-5 gap-1">
        {matrix.map((row, i) =>
          row.map((cell, j) => (
            <ComplexNumberDisplay
              key={`${i}-${j}`}
              value={cell}
              highlight={highlight?.row === i && highlight?.col === j}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MathInsightBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-purple-900/30 border-2 border-purple-500/30 rounded-xl p-4 mb-4">
      <h4 className="text-purple-300 font-bold mb-2 text-sm">🧮 {title}</h4>
      <div className="text-slate-300 text-sm space-y-2">
        {children}
      </div>
    </div>
  );
}

function MoveExplanationDisplay() {
  return (
    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600">
      <div className="text-xs text-slate-400 mb-2 text-center">Move Definitions</div>
      <div className="space-y-2">
        {(['A', 'B', 'C', 'D'] as const).map(moveType => (
          <div key={moveType} className="bg-slate-700/30 rounded-lg p-2 text-xs">
            <div className="text-purple-300 font-bold">Move {moveType}:</div>
            <div className="text-slate-300 ml-2">
              {moveType === 'A' && "Vertex: ×(1+i), Adjacent: ×(-1+0i)"}
              {moveType === 'B' && "Vertex: ×(-1+i), Adjacent: ×(0-i)"}
              {moveType === 'C' && "Vertex: ×(-1-i), Adjacent: ×(1+0i)"}
              {moveType === 'D' && "Vertex: ×(1-i), Adjacent: ×(0+i)"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VectorDisplay({
  vector,
  title,
  highlight = null
}: {
  vector: ComplexNumber[];
  title: string;
  highlight?: number | null;
}) {
  return (
    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600">
      <div className="text-xs text-slate-400 mb-2 text-center">{title}</div>
      <div className="space-y-1">
        {vector.map((value, i) => (
          <ComplexNumberDisplay
            key={i}
            value={value}
            highlight={highlight === i}
          />
        ))}
      </div>
    </div>
  );
}

function PentagonVisualization({ state, title }: { state: ComplexNumber[]; title: string }) {
  return (
    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600">
      <div className="text-xs text-slate-400 mb-4 text-center">{title}</div>
      <div className="relative w-48 h-48 mx-auto">
        {/* Pentagon vertices */}
        {state.map((value, i) => {
          const angle = (i * 72 - 90) * Math.PI / 180;
          const x = 96 + 70 * Math.cos(angle);
          const y = 96 + 70 * Math.sin(angle);

          return (
            <div
              key={i}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y }}
            >
              <div className="bg-purple-600 rounded-full w-12 h-12 flex items-center justify-center text-xs font-mono text-white border-2 border-purple-400">
                {formatComplex(value)}
              </div>
              <div className="text-xs text-pink-400 text-center mt-1">V{i}</div>
            </div>
          );
        })}

        {/* Pentagon edges */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
          {[0, 1, 2, 3, 4].map(i => {
            const nextI = (i + 1) % 5;
            const angle1 = (i * 72 - 90) * Math.PI / 180;
            const angle2 = (nextI * 72 - 90) * Math.PI / 180;
            const x1 = 96 + 70 * Math.cos(angle1);
            const y1 = 96 + 70 * Math.sin(angle1);
            const x2 = 96 + 70 * Math.cos(angle2);
            const y2 = 96 + 70 * Math.sin(angle2);

            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#64748b" strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function MatrixSolverPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [gameState] = useState<GameState>({
    vertices: [
      { real: -4, imag: -1 },  // V0
      { real: 4, imag: 1 },    // V1
      { real: 0, imag: 0 },    // V2
      { real: -1, imag: 1 },   // V3
      { real: 3, imag: 1 }     // V4
    ],
    goalVertices: [
      { real: 0, imag: 0 },
      { real: 0, imag: 0 },
      { real: 0, imag: 0 },
      { real: 0, imag: 0 },
      { real: 0, imag: 0 }
    ],
    currentMoveType: 'A',
    selectedVertex: -1,
    isWon: false
  });

  const [steps, setSteps] = useState<StepData[]>([]);

  useEffect(() => {
    // Calculate all steps
    const currentState = gameState.vertices;
    const differenceVector = currentState.map(v => ({ real: -v.real, imag: -v.imag }));

    // Apply matrix multiplication manually for each step
    const solutionVector: ComplexNumber[] = [];
    for (let i = 0; i < 5; i++) {
      const sum = { real: 0, imag: 0 };
      for (let j = 0; j < 5; j++) {
        const product = {
          real: MATRIX_INVERSE[i][j].real * differenceVector[j].real - MATRIX_INVERSE[i][j].imag * differenceVector[j].imag,
          imag: MATRIX_INVERSE[i][j].real * differenceVector[j].imag + MATRIX_INVERSE[i][j].imag * differenceVector[j].real
        };
        sum.real += product.real;
        sum.imag += product.imag;
      }
      solutionVector.push(sum);
    }

    setSteps([
      {
        step: 0,
        title: "The Problem: Pentagon Complex Number Game",
        description: "We have a pentagon with complex numbers at each vertex. Four move types (A,B,C,D) transform vertices and adjacent neighbors. Goal: Get all vertices to 0+0i. Traditional search methods explore 4^n possible move sequences - can we do better?",
        currentState
      },
      {
        step: 1,
        title: "Key Insight: Moves are Linear Transformations",
        description: "Each move multiplies complex numbers by fixed constants. Since complex multiplication is linear, the entire game becomes a system of linear equations! This means we can use matrix algebra instead of searching.",
        currentState
      },
      {
        step: 2,
        title: "The 10×10 Matrix System",
        description: "Alex discovered that all pentagon moves can be represented as a 10×10 matrix M operating on real/imaginary parts separately. This matrix captures the complete mathematical structure of the game.",
        currentState
      },
      {
        step: 3,
        title: "Reducing to 5×5 Complex Matrix",
        description: "By treating each vertex as a single complex number instead of separate real/imaginary parts, we get a more elegant 5×5 complex matrix M̄. This is what we'll use for our calculations.",
        currentState
      },
      {
        step: 4,
        title: "The Magic: Matrix Inversion",
        description: "The inverse matrix M̄⁻¹ tells us exactly what linear combination of moves to apply to reach any target state. This is the mathematical 'key' that unlocks instant solutions!",
        differenceVector
      },
      {
        step: 5,
        title: "Calculate Difference Vector",
        description: "The difference vector is simple: 'How much do we need to change each vertex?' Since we want to go from current values to zero, we need to subtract the current values. So the difference is just -current.",
        currentState,
        differenceVector
      },
      {
        step: 6,
        title: "Matrix Multiplication Magic",
        description: "We multiply M̄⁻¹ by the difference vector. Each element of the result tells us the exact coefficient for moves at that vertex. Watch the mathematics unfold!",
        differenceVector,
        solutionVector,
        highlightMatrix: null
      },
      {
        step: 7,
        title: "Interpreting the Solution",
        description: "Each number in the solution vector tells us 'how much transformation is needed at each vertex'. For example, 2i means 'we need to apply transformations that result in multiplying by 2i at this vertex'. The challenge: convert these into actual game moves!",
        solutionVector
      },
      {
        step: 8,
        title: "From Theory to Practice",
        description: "Using algorithms, we convert the mathematical solution into actual game moves. The result: a move sequence that provably reaches the goal state!",
        moves: ["D3", "C2", "C2", "C0"], // Real moves from current solver
        solutionVector
      }
    ]);
  }, [gameState]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep] || {
    step: 0,
    title: "Loading...",
    description: "Calculating matrix solution steps...",
    currentState: gameState.vertices
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Matrix Solver Visualization
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Watch how the mathematical matrix approach instantly solves the pentagon puzzle using linear algebra.
          </p>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 rounded-lg p-2 flex items-center space-x-4 border border-slate-600">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-slate-700 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-600 transition-colors"
            >
              Previous
            </button>
            <div className="text-sm text-slate-300">
              Step {currentStep + 1} of {steps.length}
            </div>
            <button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="px-4 py-2 bg-purple-600 rounded-lg text-sm disabled:opacity-50 hover:bg-purple-500 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* Current Step Display */}
        <motion.div
          className="bg-slate-800/30 rounded-xl p-6 border border-slate-600 mb-8"
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="text-2xl font-bold mb-2 text-purple-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {currentStepData?.title}
          </motion.h2>
          <motion.p
            className="text-slate-300 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {currentStepData?.description}
          </motion.p>

          {/* Mathematical Insights */}
          {currentStep === 0 && (
            <MathInsightBox title="The Challenge">
              <p>Traditional algorithms explore 4^n possible move sequences. For just 5 moves, that's 1,024 possibilities!</p>
              <p><strong>Question:</strong> Can mathematics give us a shortcut?</p>
            </MathInsightBox>
          )}

          {currentStep === 5 && (
            <MathInsightBox title="Difference Vector: The Gap We Need to Fill">
              <p><strong>Current state:</strong> [-4-1i, 4+1i, 0+0i, -1+1i, 3+1i]</p>
              <p><strong>Goal state:</strong> [0+0i, 0+0i, 0+0i, 0+0i, 0+0i]</p>
              <p><strong>Difference:</strong> We need to "remove" [4+1i, -4-1i, 0, 1-1i, -3-1i] from current state</p>
              <p><strong>This is our "shopping list"</strong> of transformations needed at each vertex!</p>
            </MathInsightBox>
          )}

          {currentStep === 6 && (
            <MathInsightBox title="Matrix Multiplication: The Calculation">
              <p><strong>What's happening:</strong> M⁻¹ × difference = solution</p>
              <p><strong>Each row of M⁻¹</strong> tells us "to achieve this difference at vertex i, here's the combination needed"</p>
              <p><strong>For example:</strong> Row 1 of M⁻¹ shows "to change vertex 0 by the desired amount, apply these coefficients to all vertices"</p>
              <p><strong>The result:</strong> Exact coefficients telling us what transformations to apply where!</p>
            </MathInsightBox>
          )}

          {currentStep === 7 && (
            <MathInsightBox title="Solution Vector: What Do These Numbers Mean?">
              <p><strong>2i at vertex 0:</strong> "Apply transformations that multiply vertex 0's value by 2i"</p>
              <p><strong>-1-1i at vertex 1:</strong> "Apply moves that result in (-1-1i) transformation here"</p>
              <p><strong>The challenge:</strong> Our moves A,B,C,D have fixed effects. How do we combine them to achieve these exact coefficients?</p>
              <p><strong>The algorithm:</strong> Find the best sequence of discrete moves that approximates these continuous values!</p>
            </MathInsightBox>
          )}

          {currentStep === 8 && (
            <MathInsightBox title="The Final Solution: Math → Moves">
              <p><strong>D3:</strong> Move D at vertex 3 - applies (1-i) to vertex, (0+i) to neighbors</p>
              <p><strong>C2, C2:</strong> Move C twice at vertex 2 - applies (-1-i) each time</p>
              <p><strong>C0:</strong> Move C at vertex 0 - final adjustment</p>
              <p><strong>Total:</strong> 4 moves vs thousands of possibilities explored by traditional search!</p>
            </MathInsightBox>
          )}

          {currentStep === 1 && (
            <MathInsightBox title="Linear Algebra Insight">
              <p>Complex number multiplication is linear: (a+bi) × (c+di) follows linear rules.</p>
              <p>Since all game moves are complex multiplications, the <em>entire game</em> is a linear system!</p>
              <p><strong>This means:</strong> We can use matrix algebra instead of searching!</p>
            </MathInsightBox>
          )}

          {currentStep === 2 && (
            <MathInsightBox title="Why 10×10? Breaking Down Complex Numbers">
              <p><strong>The Problem:</strong> Each vertex has a complex number like -4-1i. That's really TWO numbers: real (-4) and imaginary (-1).</p>
              <p><strong>So 5 vertices = 10 real numbers total:</strong> [-4, -1, 4, 1, 0, 0, -1, 1, 3, 1]</p>
              <p><strong>The Matrix:</strong> Each row shows "if I change one number, how do ALL the others change through game moves?"</p>
              <p><strong>Example:</strong> Row 1 = "if I apply moves to the real part of vertex 0, what happens to all 10 numbers?"</p>
            </MathInsightBox>
          )}

          {currentStep === 3 && (
            <MathInsightBox title="5×5 Matrix: What It Actually Represents">
              <p><strong>Think of it like this:</strong> Each matrix cell (i,j) answers: "How does move at vertex j affect vertex i?"</p>
              <p><strong>For example:</strong> M[0][1] = i means "vertex 1 affects vertex 0 by multiplying by i"</p>
              <p><strong>The pattern:</strong> 1-i on diagonal (self-effect), i on adjacent connections (neighbor effects)</p>
              <p><strong>Why this works:</strong> This matrix captures exactly how our game moves A,B,C,D propagate through the pentagon!</p>
            </MathInsightBox>
          )}

          {currentStep === 4 && (
            <MathInsightBox title="M^-1: The Reverse Engineering Matrix">
              <p><strong>Think backwards:</strong> M shows "moves → final state". M^-1 shows "final state → moves needed".</p>
              <p><strong>It's like asking:</strong> "I want to end up HERE, what moves do I need?"</p>
              <p><strong>Where it comes from:</strong> Mathematical inverse of M (like 5^-1 = 1/5, but for matrices)</p>
              <p><strong>Alex calculated this once</strong> and now we can solve ANY pentagon puzzle instantly!</p>
            </MathInsightBox>
          )}

          {/* Step Content */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {/* Current State - Always show for context */}
            {currentStepData?.currentState && (
              <PentagonVisualization
                state={currentStepData.currentState}
                title="Current Game State"
              />
            )}

            {/* Step-specific content */}
            {currentStep === 1 && <MoveExplanationDisplay />}

            {currentStep === 2 && (
              <RealMatrixDisplay
                matrix={ORIGINAL_10x10_MATRIX}
                title="Original 10×10 Matrix M"
                size="small"
              />
            )}

            {currentStep === 3 && (
              <MatrixDisplay
                matrix={COMPLEX_5x5_MATRIX}
                title="5×5 Complex Matrix M̄"
              />
            )}

            {(currentStep === 4 || currentStep === 6) && (
              <MatrixDisplay
                matrix={MATRIX_INVERSE}
                title="Inverse Matrix M̄⁻¹"
                highlight={currentStepData?.highlightMatrix}
              />
            )}

            {/* Difference Vector */}
            {currentStepData?.differenceVector && (
              <VectorDisplay
                vector={currentStepData.differenceVector}
                title="Difference Vector"
              />
            )}

            {/* Solution Vector */}
            {currentStepData?.solutionVector && (
              <VectorDisplay
                vector={currentStepData.solutionVector}
                title="Solution Vector"
              />
            )}

            {/* Final Moves */}
            {currentStepData?.moves && (
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600">
                <div className="text-xs text-slate-400 mb-2 text-center">🎯 Final Solution</div>
                <div className="space-y-2">
                  {currentStepData.moves.map((move, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="bg-green-600/20 border border-green-500/30 rounded-lg p-2 text-center font-mono text-green-300"
                    >
                      {i + 1}. Move {move}
                    </motion.div>
                  ))}
                </div>
                <div className="text-xs text-slate-400 mt-2 text-center">
                  Total: {currentStepData.moves.length} moves vs exponential search!
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Mathematical Explanation */}
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-600">
          <h3 className="text-xl font-bold mb-4 text-purple-300">Mathematical Insight</h3>
          <div className="text-slate-300 space-y-3">
            <p>
              <strong>The Key Discovery:</strong> The pentagon game's moves form a linear system that can be represented as matrix operations.
            </p>
            <p>
              <strong>Formula:</strong> <code className="bg-slate-700 px-2 py-1 rounded font-mono">Solution = M⁻¹ × (Goal - Current)</code>
            </p>
            <p>
              <strong>Complexity:</strong> O(1) constant time vs O(4ᵈ) exponential time for traditional search methods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}