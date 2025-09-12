'use client';

import { useState, useEffect, useCallback } from 'react';
import GameCanvas from './GameCanvas';
import GameControls from './GameControls';
import { ComplexNumber, GameState, Move, MoveType } from '@/types/game';

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

const initialVertices: ComplexNumber[] = [
  { real: 2, imag: 4 }, // vertex 0
  { real: 2, imag: 0 }, // vertex 1
  { real: 2, imag: 2 }, // vertex 2
  { real: 3, imag: 4 }, // vertex 3
  { real: 1, imag: 3 }, // vertex 4
];

export default function PentagonGame() {
  const [gameState, setGameState] = useState<GameState>({
    vertices: [...initialVertices],
    goalVertices: [...initialVertices],
    currentMoveType: 'A',
    selectedVertex: -1,
    isWon: false,
  });

  const generateNewGoal = useCallback(() => {
    // Start from the INITIAL state and apply moves to create a goal
    const initialVertices = [
      { real: 2, imag: 4 }, { real: 2, imag: 0 }, { real: 2, imag: 2 }, 
      { real: 3, imag: 4 }, { real: 1, imag: 3 }
    ];
    const goalVertices = initialVertices.map(v => ({ ...v }));
    
    // Apply 3-7 random moves to create a solvable goal
    const numMoves = Math.floor(Math.random() * 5) + 3;
    const moveTypes: MoveType[] = ['A', 'B', 'C', 'D'];
    
    console.log(`Generating goal by applying ${numMoves} moves from current state`);
    
    for (let i = 0; i < numMoves; i++) {
      const moveType = moveTypes[Math.floor(Math.random() * 4)];
      const vertexIdx = Math.floor(Math.random() * 5);
      const operation = Math.random() > 0.5 ? 'add' : 'subtract';
      
      const move = moves[moveType];
      const multiplier = operation === 'subtract' ? -1 : 1;
      
      goalVertices[vertexIdx].real += move.vertex.real * multiplier;
      goalVertices[vertexIdx].imag += move.vertex.imag * multiplier;
      
      for (const adj of adjacency[vertexIdx]) {
        goalVertices[adj].real += move.adjacent.real * multiplier;
        goalVertices[adj].imag += move.adjacent.imag * multiplier;
      }
      
      console.log(`Applied ${moveType} ${operation} to vertex ${vertexIdx}`);
    }
    
    setGameState(prev => ({
      ...prev,
      goalVertices,
      isWon: false,
    }));
  }, []); // No dependencies - goal only changes when explicitly called

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
      vertices: [...initialVertices],
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

  // Generate initial goal
  useEffect(() => {
    generateNewGoal();
  }, [generateNewGoal]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center lg:items-start justify-center max-w-6xl mx-auto">
      {/* Controls first on mobile, sidebar on desktop */}
      <div className="w-full lg:w-80 order-1 lg:order-1">
        <GameControls
          gameState={gameState}
          onMoveTypeChange={setMoveType}
          onReset={resetGame}
          onNewGoal={generateNewGoal}
        />
      </div>
      
      {/* Canvas second on mobile, main on desktop */}
      <div className="w-full lg:flex-1 flex justify-center order-2 lg:order-2">
        <GameCanvas
          gameState={gameState}
          onVertexClick={applyMove}
        />
      </div>
    </div>
  );
}