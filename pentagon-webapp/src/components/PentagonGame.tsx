'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast, { Toaster } from 'react-hot-toast';
import { Menu, Lightbulb } from 'lucide-react';
import GameCanvas from './GameCanvas';
import { ComplexNumber, GameState, Move, MoveType, UIMoveType } from '@/types/game';
import { getMatrixHint, getFullSolution } from '@/utils/matrix-solver-mathjs';

// Move definitions (CORRECTED to match Alex's paper lines 231-234)
// Paper specification:
// A: Add 1+i to vertex, add -i to neighbors
// B: Add -1+i to vertex, add 1 to neighbors
// C: Add -1-i to vertex, add i to neighbors (C = -A)
// D: Add 1-i to vertex, add -1 to neighbors (D = -B)
const moves: Record<MoveType, Move> = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 1, imag: 0 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: -1, imag: 0 } },
};

// Pentagon adjacency (each vertex connects to its 2 neighbors)
const adjacency: Record<number, number[]> = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0],
};

// Goal is always all zeros
const zeroGoal: ComplexNumber[] = [
  { real: 0, imag: 0 }, // vertex 0
  { real: 0, imag: 0 }, // vertex 1
  { real: 0, imag: 0 }, // vertex 2
  { real: 0, imag: 0 }, // vertex 3
  { real: 0, imag: 0 }, // vertex 4
];

export default function PentagonGame() {
  // Use UI move type (A or B only) for display
  const [currentUIMoveType, setCurrentUIMoveType] = useState<UIMoveType>('A');

  const [gameState, setGameState] = useState<GameState>({
    vertices: zeroGoal.map(v => ({ ...v })), // Will be updated by generateStartingState
    goalVertices: zeroGoal.map(v => ({ ...v })), // Always all zeros
    currentMoveType: 'A',
    selectedVertex: -1,
    isWon: false,
  });

  const [hintVertex, setHintVertex] = useState<number | undefined>(undefined);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [fullSolution, setFullSolution] = useState<string[]>([]);
  const [isGettingSolution, setIsGettingSolution] = useState(false);
  const [showFullSolution, setShowFullSolution] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Difficulty and menu state
  type Difficulty = 'easy' | 'medium' | 'hard' | 'custom';
  const [showMenu, setShowMenu] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [customMoveCount, setCustomMoveCount] = useState(12);

  // Track stats for completion screen
  const [moveCount, setMoveCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [solveTime, setSolveTime] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<Array<{ vertices: ComplexNumber[]; moveType: MoveType }>>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [solutionViewed, setSolutionViewed] = useState(false);
  const [showSolutionConfirm, setShowSolutionConfirm] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  // const [showEducationalPanel, setShowEducationalPanel] = useState(false);

  const generateStartingState = useCallback((difficulty: Difficulty, customCount?: number) => {
    // Generate random starting state by assigning move coefficients to each vertex
    // Each vertex gets: some number of A moves (+ or -) and some number of B moves (+ or -)
    const startingVertices = Array(5).fill(null).map(() => ({ real: 0, imag: 0 }));

    // Determine target move count based on difficulty
    let minMoves, maxMoves;
    if (difficulty === 'custom' && customCount) {
      minMoves = maxMoves = customCount;
    } else if (difficulty === 'easy') {
      minMoves = 8; maxMoves = 12;
    } else if (difficulty === 'medium') {
      minMoves = 12; maxMoves = 16;
    } else { // hard
      minMoves = 16; maxMoves = 20;
    }

    const targetMoves = Math.floor(Math.random() * (maxMoves - minMoves + 1)) + minMoves;
    const moveSequence: string[] = [];

    console.log(`Generating ${difficulty} puzzle with target: ${targetMoves} moves`);

    // For each vertex, assign random coefficients for A and B
    const vertexMoves: Array<{ vertex: number; aMoves: number; bMoves: number }> = [];
    let totalAssigned = 0;

    // Calculate rough moves per vertex (distribute evenly with some randomness)
    const movesPerVertex = Math.ceil(targetMoves / 5);

    // Distribute moves across vertices
    for (let vertex = 0; vertex < 5; vertex++) {
      // Decide if this vertex gets A moves and/or B moves
      const hasAMoves = Math.random() < 0.7; // 70% chance
      const hasBMoves = Math.random() < 0.7; // 70% chance

      let aMoves = 0;
      let bMoves = 0;

      // Calculate max moves for this vertex to avoid overshooting
      const remainingMoves = targetMoves - totalAssigned;
      const maxForVertex = Math.min(movesPerVertex, remainingMoves);

      if (hasAMoves && maxForVertex > 0) {
        // 1 to maxForVertex/2 A moves (positive or negative)
        const magnitude = Math.floor(Math.random() * Math.max(1, Math.ceil(maxForVertex / 2))) + 1;
        aMoves = Math.random() < 0.5 ? magnitude : -magnitude;
        totalAssigned += Math.abs(aMoves);
      }

      if (hasBMoves && totalAssigned < targetMoves) {
        // Remaining budget for B moves
        const remainingBudget = targetMoves - totalAssigned;
        const magnitude = Math.floor(Math.random() * Math.min(Math.max(1, Math.ceil(maxForVertex / 2)), remainingBudget)) + 1;
        bMoves = Math.random() < 0.5 ? magnitude : -magnitude;
        totalAssigned += Math.abs(bMoves);
      }

      vertexMoves.push({ vertex, aMoves, bMoves });
    }

    console.log(`Assigned ${totalAssigned} moves (target: ${targetMoves})`);

    // Apply all the moves
    for (const { vertex, aMoves, bMoves } of vertexMoves) {
      // Apply A moves (or -A if negative)
      if (aMoves !== 0) {
        const moveType = aMoves > 0 ? 'A' : 'C';
        const move = moves[moveType];
        const count = Math.abs(aMoves);

        for (let i = 0; i < count; i++) {
          startingVertices[vertex].real += move.vertex.real;
          startingVertices[vertex].imag += move.vertex.imag;

          for (const adj of adjacency[vertex]) {
            startingVertices[adj].real += move.adjacent.real;
            startingVertices[adj].imag += move.adjacent.imag;
          }

          const label = aMoves > 0 ? 'A' : '-A';
          moveSequence.push(`${label}, V${vertex}`);
        }
      }

      // Apply B moves (or -B if negative)
      if (bMoves !== 0) {
        const moveType = bMoves > 0 ? 'B' : 'D';
        const move = moves[moveType];
        const count = Math.abs(bMoves);

        for (let i = 0; i < count; i++) {
          startingVertices[vertex].real += move.vertex.real;
          startingVertices[vertex].imag += move.vertex.imag;

          for (const adj of adjacency[vertex]) {
            startingVertices[adj].real += move.adjacent.real;
            startingVertices[adj].imag += move.adjacent.imag;
          }

          const label = bMoves > 0 ? 'B' : '-B';
          moveSequence.push(`${label}, V${vertex}`);
        }
      }
    }

    console.log(`Generated puzzle with ${moveSequence.length} moves:`, moveSequence.join(' → '))
    console.log('Per-vertex breakdown:', vertexMoves.map(v =>
      `V${v.vertex}: ${v.aMoves}A, ${v.bMoves}B`
    ).join(' | '))
    
    setGameState(prev => ({
      ...prev,
      vertices: startingVertices,
      goalVertices: zeroGoal.map(v => ({ ...v })),
      isWon: false,
    }));

    // Reset stats for new puzzle
    setMoveCount(0);
    setStartTime(Date.now());
    setSolveTime(null);
    setMoveHistory([{ vertices: startingVertices.map(v => ({ ...v })), moveType: 'A' }]);
    setHintsUsed(0);
    setSolutionViewed(false);
    setShowMenu(false);

    setIsInitialized(true);
  }, []); // No dependencies

  const getHint = useCallback(async () => {
    setIsGettingHint(true);
    setHintVertex(undefined);

    try {
      console.log('=== GETTING HINT ===');
      console.log('Current state:', gameState.vertices.map((v, i) =>
        `V${i}: {real: ${v.real}, imag: ${v.imag}}`
      ).join(', '));

      const hint = await getMatrixHint(gameState, gameState.currentMoveType);
      console.log('Hint result:', hint);

      if (hint) {
        // Increment hints used
        setHintsUsed(prev => prev + 1);

        console.log(`Hint: Click ${hint.moveType} on vertex ${hint.vertex}`);

        // If hint suggests a different move type, switch to it
        if (hint.moveType !== gameState.currentMoveType) {
          console.log(`Switching from ${gameState.currentMoveType} to ${hint.moveType}`);
          // Map internal move types (A,B,C,D) to UI move types (A or B)
          const uiMoveType: UIMoveType = (hint.moveType === 'A' || hint.moveType === 'C') ? 'A' : 'B';
          setCurrentUIMoveType(uiMoveType);
          setGameState(prev => ({
            ...prev,
            currentMoveType: hint.moveType,
          }));
        }

        // Clear selected vertex and set hint vertex (avoid confusion)
        setGameState(prev => ({
          ...prev,
          selectedVertex: undefined,
        }));
        setHintVertex(hint.vertex);

        // Clear hint after 3 seconds
        setTimeout(() => setHintVertex(undefined), 3000);
      } else {
        console.log('No hint available - either solved or selected move type not needed');
      }
    } catch (error) {
      console.error('Matrix solver error:', error);
    } finally {
      setIsGettingHint(false);
    }
  }, [gameState]);

  const getFullSolutionMoves = useCallback(async () => {
    setIsGettingSolution(true);
    setShowFullSolution(false);

    try {
      console.log('Getting full solution for state:', gameState.vertices);
      const moves = await getFullSolution(gameState);
      console.log('Full solution moves:', moves);

      // Mark that solution was viewed
      setSolutionViewed(true);

      setFullSolution(moves);
      setShowFullSolution(true);
    } catch (error) {
      console.error('Full solution error:', error);
      setFullSolution([]);
    } finally {
      setIsGettingSolution(false);
    }
  }, [gameState]);

  const handleSolutionClick = useCallback(() => {
    setShowSolutionConfirm(true);
  }, []);

  const confirmSolution = useCallback(() => {
    setShowSolutionConfirm(false);
    getFullSolutionMoves();
  }, [getFullSolutionMoves]);

  const applyMove = useCallback((vertexIndex: number, operation: 'add' | 'subtract' = 'add') => {
    if (vertexIndex < 0 || vertexIndex > 4) return;

    // Use the current internal move type directly from gameState
    // If right-click/long-press, apply the negative (A->C, B->D, C->A, D->B)
    let actualMoveType = gameState.currentMoveType;
    if (operation === 'subtract') {
      // Apply the negative of the current move
      if (actualMoveType === 'A') actualMoveType = 'C';
      else if (actualMoveType === 'C') actualMoveType = 'A';
      else if (actualMoveType === 'B') actualMoveType = 'D';
      else actualMoveType = 'B'; // D -> B
    }

    const move = moves[actualMoveType];

    setGameState(prev => {
      const newVertices = prev.vertices.map(v => ({ ...v }));

      // Apply to selected vertex
      newVertices[vertexIndex].real += move.vertex.real;
      newVertices[vertexIndex].imag += move.vertex.imag;

      // Apply to adjacent vertices
      for (const adj of adjacency[vertexIndex]) {
        newVertices[adj].real += move.adjacent.real;
        newVertices[adj].imag += move.adjacent.imag;
      }

      return {
        ...prev,
        vertices: newVertices,
        selectedVertex: vertexIndex,
        currentMoveType: actualMoveType,
      };
    });

    // Track move in history and increment counter
    setMoveCount(prev => prev + 1);
    setMoveHistory(prev => [...prev, {
      vertices: gameState.vertices.map(v => ({ ...v })),
      moveType: actualMoveType
    }]);
  }, [gameState.currentMoveType, gameState.vertices]);

  const undoMove = useCallback(() => {
    if (moveHistory.length <= 1) return; // Can't undo past initial state

    const newHistory = moveHistory.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];

    setMoveHistory(newHistory);
    setMoveCount(prev => Math.max(0, prev - 1));
    setGameState(prev => ({
      ...prev,
      vertices: previousState.vertices.map(v => ({ ...v })),
      currentMoveType: previousState.moveType,
      isWon: false, // Reset win state when undoing
    }));
  }, [moveHistory]);

  const resetGame = useCallback(() => {
    setShowMenu(true);
    setIsInitialized(false);
  }, []);

  const startNewGame = useCallback(() => {
    generateStartingState(selectedDifficulty, customMoveCount);
  }, [generateStartingState, selectedDifficulty, customMoveCount]);

  const setMoveType = useCallback((moveType: UIMoveType) => {
    // Toggle behavior: if clicking the same button, switch between positive and negative
    const currentInternal = gameState.currentMoveType;
    let nextInternal: MoveType;

    if (moveType === 'A') {
      // If currently A, switch to C (-A); if currently C, switch to A
      nextInternal = currentInternal === 'A' ? 'C' : 'A';
    } else { // moveType === 'B'
      // If currently B, switch to D (-B); if currently D, switch to B
      nextInternal = currentInternal === 'B' ? 'D' : 'B';
    }

    setCurrentUIMoveType(moveType);
    setGameState(prev => ({
      ...prev,
      currentMoveType: nextInternal,
    }));
  }, [gameState.currentMoveType]);

  const toggleMoveType = useCallback(() => {
    // Cycle through: A -> B -> -A -> -B -> A
    // Internal types: A -> B -> C -> D -> A
    const currentInternal = gameState.currentMoveType;
    let nextMoveType: UIMoveType;
    let nextInternal: MoveType;

    if (currentInternal === 'A') {
      nextMoveType = 'B';
      nextInternal = 'B';
    } else if (currentInternal === 'B') {
      nextMoveType = 'A';
      nextInternal = 'C'; // -A
    } else if (currentInternal === 'C') {
      nextMoveType = 'B';
      nextInternal = 'D'; // -B
    } else { // D
      nextMoveType = 'A';
      nextInternal = 'A';
    }

    setCurrentUIMoveType(nextMoveType);
    setGameState(prev => ({
      ...prev,
      currentMoveType: nextInternal,
    }));
  }, [gameState.currentMoveType]);

  // Check win condition (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    const isWon = gameState.vertices.every((v, i) =>
      v.real === gameState.goalVertices[i].real &&
      v.imag === gameState.goalVertices[i].imag
    );

    if (isWon !== gameState.isWon) {
      setGameState(prev => ({ ...prev, isWon }));

      // Capture solve time when winning
      if (isWon && startTime && !solveTime) {
        setSolveTime(Date.now() - startTime);

        // Victory celebration!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
        });

        // Second burst for extra celebration
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 250);

        // Success toast
        toast.success('Puzzle Solved! 🎉', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '600',
          },
        });
      }
    }
  }, [gameState.vertices, gameState.goalVertices, gameState.isWon, isInitialized, startTime, solveTime]);

  // Don't auto-generate on mount - wait for user to select difficulty
  // useEffect is removed - game starts with menu

  // Debug game state
  useEffect(() => {
    console.log('PentagonGame: Current game state:', gameState);
  }, [gameState]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-900"
      onClick={(e) => {
        // Close dropdown when clicking outside
        if (showMenuDropdown && !(e.target as HTMLElement).closest('.menu-dropdown-container')) {
          setShowMenuDropdown(false);
        }
      }}
    >
      {/* Difficulty Selection Menu */}
      {showMenu && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
          <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border-2 border-indigo-500 max-w-md w-full">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Chip Firing Game</h2>

            {/* How to Play */}
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-sm">
              <div className="text-white font-semibold mb-2">Goal: Get all vertices to zero</div>
              <ul className="text-slate-300 space-y-1">
                <li>• Click a vertex to apply move A or B</li>
                <li>• Right-click (or long-press) for the negative move</li>
                <li>• Moves affect the clicked vertex and its neighbors</li>
                <li>• Blue = real, Purple = complex, Green = zero ✓</li>
              </ul>
            </div>

            <p className="text-slate-300 mb-4 text-center font-semibold">Select Difficulty</p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  setSelectedDifficulty('easy');
                  generateStartingState('easy');
                }}
                className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-all"
              >
                Easy (8-12 moves)
              </button>
              <button
                onClick={() => {
                  setSelectedDifficulty('medium');
                  generateStartingState('medium');
                }}
                className="w-full px-6 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold text-lg transition-all"
              >
                Medium (12-16 moves)
              </button>
              <button
                onClick={() => {
                  setSelectedDifficulty('hard');
                  generateStartingState('hard');
                }}
                className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-lg transition-all"
              >
                Hard (16-20 moves)
              </button>

              <div className="border-t border-slate-600 pt-3">
                <label className="text-slate-300 text-sm mb-2 block">Custom (move count):</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={customMoveCount}
                    onChange={(e) => setCustomMoveCount(parseInt(e.target.value) || 12)}
                    className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setSelectedDifficulty('custom');
                      generateStartingState('custom', customMoveCount);
                    }}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Start
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top-left: Hint button */}
      <div className="absolute" style={{ top: '1rem', left: '1rem', zIndex: 20 }}>
        <motion.button
          onClick={getHint}
          disabled={isGettingHint}
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          animate={!isGettingHint ? {
            boxShadow: [
              "0 0 0px rgba(16, 185, 129, 0)",
              "0 0 15px rgba(16, 185, 129, 0.3)",
              "0 0 0px rgba(16, 185, 129, 0)"
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative w-12 h-12 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xl backdrop-blur-md transition-colors disabled:opacity-50 border border-emerald-500/50 flex items-center justify-center"
          aria-label="Get hint"
        >
          <Lightbulb className={`w-6 h-6 ${isGettingHint ? 'animate-pulse' : ''}`} />
        </motion.button>
      </div>

      {/* Top-right: Menu button (hamburger) */}
      <div className="absolute menu-dropdown-container" style={{ top: '1rem', right: '1rem', zIndex: 20 }}>
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenuDropdown(!showMenuDropdown);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 bg-slate-800/80 hover:bg-slate-700/90 text-white rounded-xl font-bold shadow-xl backdrop-blur-md transition-colors border border-slate-600/50 flex items-center justify-center"
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </motion.button>

        {/* Dropdown menu */}
        {showMenuDropdown && (
          <div className="absolute top-14 right-0 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-600 overflow-hidden min-w-[150px]">
            <button
              onClick={() => { resetGame(); setShowMenuDropdown(false); }}
              className="w-full px-4 py-3 bg-blue-600/90 hover:bg-blue-600 text-white text-left font-semibold transition-all border-b border-slate-600"
            >
              New Game
            </button>
            <button
              onClick={() => { undoMove(); setShowMenuDropdown(false); }}
              disabled={moveHistory.length <= 1}
              className="w-full px-4 py-3 bg-yellow-600/90 hover:bg-yellow-600 text-white text-left font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-b border-slate-600"
            >
              Undo
            </button>
            <button
              onClick={() => { handleSolutionClick(); setShowMenuDropdown(false); }}
              disabled={isGettingSolution}
              className="w-full px-4 py-3 bg-indigo-600/90 hover:bg-indigo-600 text-white text-left font-semibold transition-all disabled:opacity-50"
            >
              {isGettingSolution ? 'Loading...' : 'Solution'}
            </button>
          </div>
        )}
      </div>

      {/* Solution Confirmation Dialog */}
      {showSolutionConfirm && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border-2 border-yellow-500 max-w-sm">
            <h3 className="text-xl font-bold text-white mb-3">View Solution?</h3>
            <p className="text-slate-300 mb-6">This will mark the puzzle as solved with assistance.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSolutionConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmSolution}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all"
              >
                Show Solution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom overlay: Move selector (A/B) - larger for mobile */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex gap-4 bg-gradient-to-r from-slate-800/90 to-slate-900/90 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700/50">
        {(['A', 'B'] as const).map((moveType: UIMoveType) => (
          <motion.button
            key={moveType}
            onClick={() => setMoveType(moveType)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={currentUIMoveType === moveType ? {
              scale: [1, 1.05, 1],
            } : {}}
            transition={{ duration: 0.3 }}
            className={`
              relative w-20 h-16 rounded-xl font-bold text-3xl transition-all duration-200 overflow-hidden
              ${currentUIMoveType === moveType
                ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-600/50'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/70 border border-slate-600'
              }
            `}
          >
            {currentUIMoveType === moveType && (
              <motion.div
                layoutId="activeButton"
                className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{moveType}</span>
          </motion.button>
        ))}
      </div>

      {/* Full solution modal */}
      {showFullSolution && fullSolution.length > 0 && (
        <div className="absolute top-20 right-4 z-20 max-w-sm bg-slate-800/95 p-4 rounded-xl shadow-2xl backdrop-blur-sm border border-indigo-500">
          <h4 className="text-sm font-bold text-indigo-400 mb-2">
            🎯 Solution ({fullSolution.length} moves):
          </h4>
          <div className="flex flex-wrap gap-1 mb-2 max-h-40 overflow-y-auto">
            {fullSolution.map((move, index) => {
              // Format move: "A0 (long press)" -> "-A, V0" or "B1" -> "B, V1"
              const cleanMove = move.replace(' (long press)', '');
              const moveType = cleanMove[0]; // A, B, C, or D
              const vertex = cleanMove[1];

              let displayMove = '';
              if (moveType === 'A') displayMove = 'A';
              else if (moveType === 'C') displayMove = '-A';
              else if (moveType === 'B') displayMove = 'B';
              else displayMove = '-B'; // D

              return (
                <span
                  key={index}
                  className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-mono"
                >
                  {index + 1}. {displayMove}, V{vertex}
                </span>
              );
            })}
          </div>
          <button
            onClick={() => setShowFullSolution(false)}
            className="w-full px-2 py-1 bg-slate-600 text-white rounded text-xs hover:bg-slate-500"
          >
            Hide
          </button>
        </div>
      )}

      {/* Win celebration overlay */}
      {gameState.isWon && (
        <>
          {/* Backdrop - click to dismiss on desktop */}
          <div
            className="absolute inset-0 z-29 bg-black/20 md:bg-transparent"
            onClick={() => {
              // On desktop, allow dismissing by clicking backdrop
              if (window.innerWidth >= 768) {
                // Keep the modal open, user can use X button or New Puzzle
              }
            }}
          />

          {/* Modal - centered on mobile, top-right on desktop */}
          <div className="absolute top-1/2 left-1/2 md:top-20 md:left-auto md:right-6 transform -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 z-30 bg-gradient-to-br from-green-600/95 to-emerald-700/95 px-8 py-6 rounded-2xl shadow-2xl backdrop-blur-sm border-2 border-green-400/50 max-w-sm w-full mx-4">
            {/* Close button - desktop only */}
            <button
              onClick={() => {
                // Just reset to start new game
                resetGame();
              }}
              className="hidden md:block absolute top-3 right-3 w-8 h-8 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-3">🎉 Congratulations!</p>
              <p className="text-lg text-green-100 mb-4">Puzzle Solved!</p>

              <div className="bg-white/20 rounded-lg p-4 mb-4 space-y-2 text-left">
                <div className="flex justify-between items-center text-white">
                  <span className="text-base">Moves:</span>
                  <span className="text-xl font-bold">{moveCount}</span>
                </div>
                {solveTime && (
                  <div className="flex justify-between items-center text-white">
                    <span className="text-base">Time:</span>
                    <span className="text-xl font-bold">
                      {Math.floor(solveTime / 60000)}:{String(Math.floor((solveTime % 60000) / 1000)).padStart(2, '0')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-white">
                  <span className="text-base">Hints Used:</span>
                  <span className="text-xl font-bold">{hintsUsed}</span>
                </div>
                <div className="flex justify-between items-center text-white">
                  <span className="text-base">Solution Viewed:</span>
                  <span className="text-xl font-bold">{solutionViewed ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <button
                onClick={resetGame}
                className="w-full px-6 py-3 bg-white text-green-700 rounded-lg font-bold text-base hover:bg-green-50 transition-all shadow-lg"
              >
                New Puzzle
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main canvas - centered, full screen */}
      <div className="w-full h-full flex items-center justify-center">
        <GameCanvas
          gameState={gameState}
          onVertexClick={applyMove}
          onCenterClick={toggleMoveType}
          hintVertex={hintVertex}
        />
      </div>

      {/* Toast notifications */}
      <Toaster />

      {/* Footer attribution - hidden on mobile to avoid overlap */}
      {!showMenu && (
        <div className="hidden md:flex absolute bottom-2 left-0 right-0 justify-center pointer-events-none">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 pointer-events-auto">
            <span>Game by</span>
            <a
              href="https://sites.google.com/view/alexmcdonough/home"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-400 transition-colors underline decoration-slate-600 hover:decoration-indigo-400"
            >
              Alex McDonough
            </a>
            <span>&</span>
            <a
              href="https://mikeion.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-400 transition-colors underline decoration-slate-600 hover:decoration-indigo-400"
            >
              Mike Ion
            </a>
            <span className="text-slate-600 mx-0.5">•</span>
            <span className="text-slate-400 italic">Paper coming soon</span>
          </div>
        </div>
      )}
    </div>
  );
}