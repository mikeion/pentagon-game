'use client';

import { useState, useEffect, useCallback } from 'react';
import GameCanvas from './GameCanvas';
import { ComplexNumber, GameState, Move, MoveType, UIMoveType } from '@/types/game';
import { solveWithMatrix, getFullSolution } from '@/utils/matrix-solver-mathjs';

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

  // Track stats for completion screen
  const [moveCount, setMoveCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [solveTime, setSolveTime] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<Array<{ vertices: ComplexNumber[]; moveType: MoveType }>>([]);
  // const [showEducationalPanel, setShowEducationalPanel] = useState(false);

  const generateStartingState = useCallback(() => {
    // Generate random starting state by simulating random moves
    // Generate 8-12 total moves with random vertices and move types
    const startingVertices = Array(5).fill(null).map(() => ({ real: 0, imag: 0 }));

    // Random total moves between 8-12
    const totalMoves = Math.floor(Math.random() * 5) + 8; // 8, 9, 10, 11, or 12 moves
    const moveSequence: string[] = [];

    for (let i = 0; i < totalMoves; i++) {
      // Pick random vertex (0-4)
      const vertex = Math.floor(Math.random() * 5);

      // Pick random move type: A or B (50/50)
      const isAMove = Math.random() < 0.5;

      // Pick random polarity: positive or negative (50/50)
      const isPositive = Math.random() < 0.5;

      // Determine actual move type based on base type and polarity
      let moveType: MoveType;
      if (isAMove) {
        moveType = isPositive ? 'A' : 'C'; // A or -A
      } else {
        moveType = isPositive ? 'B' : 'D'; // B or -B
      }

      const move = moves[moveType];

      // Apply move to vertex
      startingVertices[vertex].real += move.vertex.real;
      startingVertices[vertex].imag += move.vertex.imag;

      // Apply to adjacent vertices
      for (const adj of adjacency[vertex]) {
        startingVertices[adj].real += move.adjacent.real;
        startingVertices[adj].imag += move.adjacent.imag;
      }

      // Track for logging
      const moveLabel = isAMove ? (isPositive ? 'A' : '-A') : (isPositive ? 'B' : '-B');
      moveSequence.push(`${moveLabel}, V${vertex}`);
    }

    console.log(`Generated puzzle with ${totalMoves} random moves:`, moveSequence.join(' → '))
    
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

    setIsInitialized(true);
  }, []); // No dependencies

  const getHint = useCallback(async () => {
    setIsGettingHint(true);
    setHintVertex(undefined);

    try {
      console.log('Getting hint for state:', gameState.vertices);
      const solution = await solveWithMatrix(gameState);
      console.log('Matrix solver returned:', solution);

      if (solution && solution.moves.length > 0) {
        const firstMove = solution.moves[0];
        console.log('First move:', firstMove);

        // Parse move: "A0 (long press)" or "B1" -> {moveType, vertex, operation}
        const cleanMove = firstMove.replace(' (long press)', '');
        const moveType = cleanMove[0] as MoveType; // A, B, C, or D
        const vertexNum = parseInt(cleanMove[1]);

        // Set the hint vertex
        setHintVertex(vertexNum);

        // Switch to the correct move type if needed
        // Map internal move types to UI move types and operations
        let targetUIMoveType: UIMoveType;
        let targetInternalMoveType: MoveType;

        if (moveType === 'A') {
          targetUIMoveType = 'A';
          targetInternalMoveType = 'A';
        } else if (moveType === 'C') {
          targetUIMoveType = 'A';
          targetInternalMoveType = 'C'; // -A
        } else if (moveType === 'B') {
          targetUIMoveType = 'B';
          targetInternalMoveType = 'B';
        } else { // D
          targetUIMoveType = 'B';
          targetInternalMoveType = 'D'; // -B
        }

        // Update move type to match hint
        setCurrentUIMoveType(targetUIMoveType);
        setGameState(prev => ({
          ...prev,
          currentMoveType: targetInternalMoveType,
        }));

        console.log(`Hint: Click vertex ${vertexNum} with move ${targetInternalMoveType} (UI: ${targetUIMoveType})`);

        // Clear hint after 3 seconds
        setTimeout(() => setHintVertex(undefined), 3000);
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

      setFullSolution(moves);
      setShowFullSolution(true);
    } catch (error) {
      console.error('Full solution error:', error);
      setFullSolution([]);
    } finally {
      setIsGettingSolution(false);
    }
  }, [gameState]);

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
    setIsInitialized(false);
    generateStartingState();
  }, [generateStartingState]);

  const setMoveType = useCallback((moveType: UIMoveType) => {
    setCurrentUIMoveType(moveType);
    setGameState(prev => ({
      ...prev,
      currentMoveType: moveType,
    }));
  }, []);

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
      }
    }
  }, [gameState.vertices, gameState.goalVertices, gameState.isWon, isInitialized, startTime, solveTime]);

  // Generate initial starting state
  useEffect(() => {
    console.log('PentagonGame: Generating initial starting state');
    generateStartingState();
  }, [generateStartingState]);

  // Debug game state
  useEffect(() => {
    console.log('PentagonGame: Current game state:', gameState);
  }, [gameState]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900">
      {/* Top-left overlay: RESET / UNDO / NEW */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-lg backdrop-blur-sm transition-all"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          Reset
        </button>
        <button
          onClick={undoMove}
          disabled={moveHistory.length <= 1}
          className="px-4 py-2 bg-yellow-600/90 hover:bg-yellow-600 text-white rounded-lg font-semibold shadow-lg backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          Undo
        </button>
        <button
          onClick={generateStartingState}
          className="px-4 py-2 bg-purple-600/90 hover:bg-purple-600 text-white rounded-lg font-semibold shadow-lg backdrop-blur-sm transition-all"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          New
        </button>
      </div>

      {/* Top-right overlay: HINT / MENU */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={getHint}
          disabled={isGettingHint}
          className="px-4 py-2 bg-green-600/90 hover:bg-green-600 text-white rounded-lg font-semibold shadow-lg backdrop-blur-sm transition-all disabled:opacity-50"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          {isGettingHint ? '...' : 'Hint'}
        </button>
        <button
          onClick={getFullSolutionMoves}
          disabled={isGettingSolution}
          className="px-4 py-2 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-lg font-semibold shadow-lg backdrop-blur-sm transition-all disabled:opacity-50"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          {isGettingSolution ? '...' : 'Solution'}
        </button>
      </div>

      {/* Bottom overlay: Move selector (A/B) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-3 bg-slate-800/90 px-6 py-3 rounded-xl shadow-lg backdrop-blur-sm">
        {(['A', 'B'] as const).map((moveType: UIMoveType) => (
          <button
            key={moveType}
            onClick={() => setMoveType(moveType)}
            className={`
              px-8 py-3 rounded-lg font-bold text-2xl transition-all duration-200
              ${currentUIMoveType === moveType
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/50'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }
            `}
            style={{ minWidth: '60px', minHeight: '50px' }}
          >
            {moveType}
          </button>
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-gradient-to-br from-green-600/95 to-emerald-700/95 px-12 py-8 rounded-2xl shadow-2xl backdrop-blur-sm border-2 border-green-400/50 max-w-md">
          <div className="text-center">
            <p className="text-4xl font-bold text-white mb-4">🎉 Congratulations!</p>
            <p className="text-xl text-green-100 mb-6">Puzzle Solved!</p>

            <div className="bg-white/20 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between items-center text-white">
                <span className="text-lg">Moves:</span>
                <span className="text-2xl font-bold">{moveCount}</span>
              </div>
              {solveTime && (
                <div className="flex justify-between items-center text-white">
                  <span className="text-lg">Time:</span>
                  <span className="text-2xl font-bold">
                    {Math.floor(solveTime / 60000)}:{String(Math.floor((solveTime % 60000) / 1000)).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={generateStartingState}
              className="w-full px-6 py-3 bg-white text-green-700 rounded-lg font-bold text-lg hover:bg-green-50 transition-all shadow-lg"
            >
              New Puzzle
            </button>
          </div>
        </div>
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
    </div>
  );
}