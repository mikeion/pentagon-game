'use client';

import { useState, useEffect, useCallback } from 'react';
import GameCanvas from './GameCanvas';
import { ComplexNumber, GameState, Move, MoveType, UIMoveType } from '@/types/game';
import { solveWithMatrix, getFullSolution } from '@/utils/matrix-solver-mathjs';

// Move definitions (corrected to match Alex's PDF)
// Note: C = -A and D = -B mathematically
// UI only shows A and B, right-click applies negative (C or D)
const moves: Record<MoveType, Move> = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: -1, imag: 0 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 1, imag: 0 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
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
  // const [showEducationalPanel, setShowEducationalPanel] = useState(false);

  const generateStartingState = useCallback(() => {
    // Generate random starting state using coefficient-based moves
    // Examples: (+4A, -3B), (+2A, +3B), (-3A, -2B)
    const startingVertices = Array(5).fill(null).map(() => ({ real: 0, imag: 0 }));

    // Generate random coefficients for A and B (between -4 and +4, excluding 0)
    let coeffA = Math.floor(Math.random() * 8) - 4;
    let coeffB = Math.floor(Math.random() * 8) - 4;
    if (coeffA === 0) coeffA = 1;
    if (coeffB === 0) coeffB = 1;

    console.log(`Generating puzzle: ${coeffA > 0 ? '+' : ''}${coeffA}A, ${coeffB > 0 ? '+' : ''}${coeffB}B`);

    // Apply coeffA times of A moves to random vertices
    const absCoeffA = Math.abs(coeffA);
    const moveTypeA = coeffA > 0 ? 'A' : 'C'; // C is -A
    for (let i = 0; i < absCoeffA; i++) {
      const vertex = Math.floor(Math.random() * 5);
      const move = moves[moveTypeA];

      startingVertices[vertex].real += move.vertex.real;
      startingVertices[vertex].imag += move.vertex.imag;

      for (const adj of adjacency[vertex]) {
        startingVertices[adj].real += move.adjacent.real;
        startingVertices[adj].imag += move.adjacent.imag;
      }
    }

    // Apply coeffB times of B moves to random vertices
    const absCoeffB = Math.abs(coeffB);
    const moveTypeB = coeffB > 0 ? 'B' : 'D'; // D is -B
    for (let i = 0; i < absCoeffB; i++) {
      const vertex = Math.floor(Math.random() * 5);
      const move = moves[moveTypeB];

      startingVertices[vertex].real += move.vertex.real;
      startingVertices[vertex].imag += move.vertex.imag;

      for (const adj of adjacency[vertex]) {
        startingVertices[adj].real += move.adjacent.real;
        startingVertices[adj].imag += move.adjacent.imag;
      }
    }
    
    setGameState(prev => ({
      ...prev,
      vertices: startingVertices,
      goalVertices: zeroGoal.map(v => ({ ...v })),
      isWon: false,
    }));
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
        // Parse vertex from string format "A0" -> 0
        const vertexNum = parseInt(firstMove[1]);
        setHintVertex(vertexNum);

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

    // Convert UI move type + operation to internal move type
    // A with subtract = C (negative of A), B with subtract = D (negative of B)
    let actualMoveType = currentUIMoveType as 'A' | 'B' | 'C' | 'D';
    if (operation === 'subtract') {
      actualMoveType = currentUIMoveType === 'A' ? 'C' : 'D';
    }

    const move = moves[actualMoveType];
    const multiplier = 1; // Already handled by move type selection
    
    setGameState(prev => {
      const newVertices = prev.vertices.map(v => ({ ...v }));
      
      // Apply to selected vertex
      newVertices[vertexIndex].real += move.vertex.real * multiplier;
      newVertices[vertexIndex].imag += move.vertex.imag * multiplier;
      
      // Apply to adjacent vertices
      for (const adj of adjacency[vertexIndex]) {
        newVertices[adj].real += move.adjacent.real * multiplier;
        newVertices[adj].imag += move.adjacent.imag * multiplier;
      }
      
      return {
        ...prev,
        vertices: newVertices,
        selectedVertex: vertexIndex,
        currentMoveType: actualMoveType,
      };
    });
  }, [currentUIMoveType]);

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
    // Cycle through: A -> -A -> B -> -B -> A
    // Internal types: A -> C -> B -> D -> A
    const currentInternal = gameState.currentMoveType;
    let nextMoveType: UIMoveType;
    let nextInternal: MoveType;

    if (currentInternal === 'A') {
      nextMoveType = 'A';
      nextInternal = 'C'; // -A
    } else if (currentInternal === 'C') {
      nextMoveType = 'B';
      nextInternal = 'B';
    } else if (currentInternal === 'B') {
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
    }
  }, [gameState.vertices, gameState.goalVertices, gameState.isWon, isInitialized]);

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
      {/* Top-left overlay: RESET / UNDO */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-lg backdrop-blur-sm transition-all"
          style={{ minWidth: '44px', minHeight: '44px' }}
        >
          Reset
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
            {fullSolution.map((move, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-mono"
              >
                {index + 1}. {move}
              </span>
            ))}
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-green-600/95 px-8 py-4 rounded-xl shadow-2xl backdrop-blur-sm">
          <p className="text-2xl font-bold text-white">🎉 Puzzle Solved!</p>
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