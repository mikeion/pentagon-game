'use client';

import { useState, useEffect, useCallback } from 'react';
import GameCanvas from './GameCanvas';
import GameControls from './GameControls';
import { ComplexNumber, GameState, Move, MoveType } from '@/types/game';
import { solvePuzzle } from '@/utils/solver';

// Move definitions (corrected to match Alex's PDF)
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
  const [gameState, setGameState] = useState<GameState>({
    vertices: [...zeroGoal], // Will be updated by generateStartingState
    goalVertices: [...zeroGoal], // Always all zeros
    currentMoveType: 'A',
    selectedVertex: -1,
    isWon: false,
  });

  const [hintResult, setHintResult] = useState<string>('');
  const [isGettingHint, setIsGettingHint] = useState(false);

  const generateStartingState = useCallback(() => {
    // Start from all zeros and apply moves to create a solvable starting state
    const startingVertices = [...zeroGoal];
    
    // Apply 3-7 random moves to create a solvable starting state
    const numMoves = Math.floor(Math.random() * 5) + 3;
    const moveTypes: MoveType[] = ['A', 'B', 'C', 'D'];
    
    console.log(`Generating starting state by applying ${numMoves} moves from zeros`);
    
    for (let i = 0; i < numMoves; i++) {
      const moveType = moveTypes[Math.floor(Math.random() * 4)];
      const vertexIdx = Math.floor(Math.random() * 5);
      const operation = Math.random() > 0.5 ? 'add' : 'subtract';
      
      const move = moves[moveType];
      const multiplier = operation === 'subtract' ? -1 : 1;
      
      startingVertices[vertexIdx].real += move.vertex.real * multiplier;
      startingVertices[vertexIdx].imag += move.vertex.imag * multiplier;
      
      for (const adj of adjacency[vertexIdx]) {
        startingVertices[adj].real += move.adjacent.real * multiplier;
        startingVertices[adj].imag += move.adjacent.imag * multiplier;
      }
      
      console.log(`Applied ${moveType} ${operation} to vertex ${vertexIdx}`);
    }
    
    setGameState(prev => ({
      ...prev,
      vertices: startingVertices,
      isWon: false,
    }));
  }, []); // No dependencies - goal only changes when explicitly called

  const getHint = useCallback(async () => {
    setIsGettingHint(true);
    setHintResult('Calculating...');
    
    try {
      const result = await solvePuzzle(gameState.vertices, gameState.goalVertices, 5);
      
      if (result.found && result.moves.length > 0) {
        const nextMove = result.moves[0];
        const operation = nextMove.operation === 'add' ? 'Tap' : 'Long press';
        setHintResult(`${operation} Move ${nextMove.moveType} on V${nextMove.vertex}`);
      } else if (result.found && result.moves.length === 0) {
        setHintResult('Already solved! 🎉');
      } else {
        setHintResult('No solution found in 5 moves. Try New Goal.');
      }
    } catch (error) {
      console.error('Hint error:', error);
      setHintResult('Error calculating hint.');
    } finally {
      setIsGettingHint(false);
    }
  }, [gameState.vertices, gameState.goalVertices]);

  const applyMove = useCallback((vertexIndex: number, operation: 'add' | 'subtract' = 'add') => {
    if (vertexIndex < 0 || vertexIndex > 4) return;
    
    const move = moves[gameState.currentMoveType];
    const multiplier = operation === 'subtract' ? -1 : 1;
    
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
      };
    });
  }, [gameState.currentMoveType]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      vertices: [...zeroGoal],
      isWon: false,
    }));
  }, []);

  const setMoveType = useCallback((moveType: MoveType) => {
    setGameState(prev => ({
      ...prev,
      currentMoveType: moveType,
    }));
  }, []);

  // Check win condition
  useEffect(() => {
    const isWon = gameState.vertices.every((v, i) => 
      v.real === gameState.goalVertices[i].real && 
      v.imag === gameState.goalVertices[i].imag
    );
    
    if (isWon !== gameState.isWon) {
      setGameState(prev => ({ ...prev, isWon }));
    }
  }, [gameState.vertices, gameState.goalVertices, gameState.isWon]);

  // Generate initial starting state
  useEffect(() => {
    generateStartingState();
  }, [generateStartingState]);

  return (
    <div className="h-screen flex flex-col lg:flex-row lg:gap-8 lg:items-start lg:justify-center lg:max-w-6xl lg:mx-auto">
      {/* Desktop layout - sidebar controls */}
      <div className="hidden lg:block lg:w-80">
        <GameControls
          gameState={gameState}
          onMoveTypeChange={setMoveType}
          onReset={resetGame}
          onNewGoal={generateStartingState}
          onGetHint={getHint}
          hintResult={hintResult}
          isGettingHint={isGettingHint}
        />
      </div>
      
      {/* Mobile/Desktop game area */}
      <div className="flex-1 lg:flex lg:justify-center">
        {/* Mobile-first layout */}
        <div className="lg:hidden h-full flex flex-col">
          {/* Compact goal at top */}
          <div className="flex-shrink-0 bg-slate-800/95 mx-4 mt-4 p-3 rounded-xl border border-green-500/30">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-white mb-2">Goal: Get All Zeros</h4>
              <div className="text-green-400 font-mono text-xs">
                V0: 0+0i • V1: 0+0i • V2: 0+0i • V3: 0+0i • V4: 0+0i
              </div>
            </div>
          </div>
          
          {/* Pentagon in middle */}
          <div className="flex-1 flex items-center justify-center px-4">
            <GameCanvas
              gameState={gameState}
              onVertexClick={applyMove}
            />
          </div>
          
          {/* Move controls at bottom */}
          <div className="flex-shrink-0 bg-slate-800/95 mx-4 mb-4 p-4 rounded-xl border border-slate-700">
            <div className="grid grid-cols-4 gap-3 mb-3">
              {(['A', 'B', 'C', 'D'] as const).map(moveType => (
                <button
                  key={moveType}
                  onClick={() => setMoveType(moveType)}
                  className={`
                    px-4 py-3 rounded-lg font-semibold text-lg transition-all duration-200
                    ${gameState.currentMoveType === moveType 
                      ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }
                  `}
                >
                  {moveType}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={resetGame}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Reset
              </button>
              <button
                onClick={generateStartingState}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
              >
                New Puzzle
              </button>
              <button
                onClick={getHint}
                disabled={isGettingHint}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
              >
                {isGettingHint ? '...' : 'Hint'}
              </button>
            </div>
            {hintResult && (
              <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-600">
                <p className="text-sm text-center text-slate-300">{hintResult}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Desktop layout - just the canvas */}
        <div className="hidden lg:block">
          <GameCanvas
            gameState={gameState}
            onVertexClick={applyMove}
          />
        </div>
      </div>
    </div>
  );
}