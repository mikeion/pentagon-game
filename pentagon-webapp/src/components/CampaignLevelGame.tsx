'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast, { Toaster } from 'react-hot-toast';
import { Menu, ArrowLeft } from 'lucide-react';
import GameCanvas from './GameCanvas';
import { ComplexNumber, GameState, Move, MoveType, UIMoveType, CampaignLevel } from '@/types/game';
import { checkGoal } from '@/utils/goal-checker';
import { useCampaignProgress } from '@/hooks/useCampaignProgress';

// Move definitions
const moves: Record<MoveType, Move> = {
  'A': { vertex: { real: 1, imag: 1 }, adjacent: { real: 0, imag: -1 } },
  'B': { vertex: { real: -1, imag: 1 }, adjacent: { real: 1, imag: 0 } },
  'C': { vertex: { real: -1, imag: -1 }, adjacent: { real: 0, imag: 1 } },
  'D': { vertex: { real: 1, imag: -1 }, adjacent: { real: -1, imag: 0 } },
};

const adjacency: Record<number, number[]> = {
  0: [1, 4],
  1: [0, 2],
  2: [1, 3],
  3: [2, 4],
  4: [3, 0],
};

const zeroGoal: ComplexNumber[] = Array(5).fill({ real: 0, imag: 0 });

interface CampaignLevelGameProps {
  chapterId: string;
  level: CampaignLevel;
  onBack: () => void;
  onNext: () => void;
}

export default function CampaignLevelGame({ chapterId, level, onBack, onNext }: CampaignLevelGameProps) {
  const [currentUIMoveType, setCurrentUIMoveType] = useState<UIMoveType>('A');
  const [gameState, setGameState] = useState<GameState>({
    vertices: level.startState.map(v => ({ ...v })),
    goalVertices: level.goalType === 'all-zeros' ? zeroGoal : level.startState,
    currentMoveType: 'A',
    selectedVertex: -1,
    isWon: false,
  });

  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  const [moveCount, setMoveCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [solveTime, setSolveTime] = useState<number | null>(null);


  const { updateLevelProgress } = useCampaignProgress();

  const applyMove = useCallback((vertexIndex: number, operation: 'add' | 'subtract' = 'add') => {
    if (vertexIndex < 0 || vertexIndex > 4) return;

    let actualMoveType = gameState.currentMoveType;
    if (operation === 'subtract') {
      if (actualMoveType === 'A') actualMoveType = 'C';
      else if (actualMoveType === 'C') actualMoveType = 'A';
      else if (actualMoveType === 'B') actualMoveType = 'D';
      else actualMoveType = 'B';
    }

    const move = moves[actualMoveType];

    setGameState(prev => {
      const newVertices = prev.vertices.map(v => ({ ...v }));
      newVertices[vertexIndex].real += move.vertex.real;
      newVertices[vertexIndex].imag += move.vertex.imag;

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

    setMoveCount(prev => prev + 1);
  }, [gameState.currentMoveType]);

  const setMoveType = useCallback((moveType: UIMoveType) => {
    const currentInternal = gameState.currentMoveType;
    let nextInternal: MoveType;

    if (moveType === 'A') {
      nextInternal = currentInternal === 'A' ? 'C' : 'A';
    } else {
      nextInternal = currentInternal === 'B' ? 'D' : 'B';
    }

    setCurrentUIMoveType(moveType);
    setGameState(prev => ({
      ...prev,
      currentMoveType: nextInternal,
    }));
  }, [gameState.currentMoveType]);

  const toggleMoveType = useCallback(() => {
    const currentInternal = gameState.currentMoveType;
    let nextMoveType: UIMoveType;
    let nextInternal: MoveType;

    if (currentInternal === 'A') {
      nextMoveType = 'B';
      nextInternal = 'B';
    } else if (currentInternal === 'B') {
      nextMoveType = 'A';
      nextInternal = 'C';
    } else if (currentInternal === 'C') {
      nextMoveType = 'B';
      nextInternal = 'D';
    } else {
      nextMoveType = 'A';
      nextInternal = 'A';
    }

    setCurrentUIMoveType(nextMoveType);
    setGameState(prev => ({
      ...prev,
      currentMoveType: nextInternal,
    }));
  }, [gameState.currentMoveType]);


  // Check win condition
  useEffect(() => {
    let isWon = false;

    if (level.goalType === 'nice-representative') {
      isWon = checkGoal(
        gameState.vertices,
        level.goalType,
        level.distinguishedVertex
      );
    } else {
      isWon = gameState.vertices.every((v, i) =>
        v.real === gameState.goalVertices[i].real &&
        v.imag === gameState.goalVertices[i].imag
      );
    }

    if (isWon !== gameState.isWon) {
      setGameState(prev => ({ ...prev, isWon }));

      if (isWon && !solveTime) {
        const time = Date.now() - startTime;
        setSolveTime(time);

        // Update progress
        updateLevelProgress(chapterId, level.id, {
          completed: true,
          moves: moveCount,
          time,
        });

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
        });

        toast.success('Level Complete! 🎉', {
          duration: 3000,
          position: 'top-center',
        });
      }
    }
  }, [gameState.vertices, gameState.goalVertices, gameState.isWon, startTime, solveTime, level, chapterId, updateLevelProgress, moveCount]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900">
      {/* Top-left: Goal display and level info */}
      <div className="absolute top-4 left-4 z-20 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/50 shadow-xl"
        >
          <div className="text-xs text-cyan-400 font-semibold mb-1">Goal:</div>
          <div className="text-sm text-white font-bold">
            {level.goalType === 'all-zeros' ? '🎯 All Zeros' : '✨ Nice Representative'}
          </div>
          {level.par && (
            <div className="text-xs text-slate-400 mt-1">Par: {level.par} moves</div>
          )}
        </motion.div>
      </div>

      {/* Top-right: Menu button */}
      <div className="absolute menu-dropdown-container top-4 right-4 z-20">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenuDropdown(!showMenuDropdown);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 bg-slate-800/80 hover:bg-slate-700/90 text-white rounded-xl shadow-xl backdrop-blur-md transition-colors border border-slate-600/50 flex items-center justify-center"
        >
          <Menu className="w-6 h-6" />
        </motion.button>

        {/* Dropdown menu */}
        {showMenuDropdown && (
          <div className="absolute top-14 right-0 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-600 overflow-hidden min-w-[180px]">
            <button
              onClick={() => { onBack(); setShowMenuDropdown(false); }}
              className="w-full px-4 py-3 bg-purple-600/90 hover:bg-purple-600 text-white text-left font-semibold transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Levels
            </button>
          </div>
        )}
      </div>

      {/* Bottom: Move selector */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex gap-4 bg-gradient-to-r from-slate-800/90 to-slate-900/90 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700/50">
        {(['A', 'B'] as const).map((moveType: UIMoveType) => (
          <motion.button
            key={moveType}
            onClick={() => setMoveType(moveType)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative w-20 h-16 rounded-xl font-bold text-3xl transition-all duration-200 overflow-hidden ${
              currentUIMoveType === moveType
                ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-600/50'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/70 border border-slate-600'
            }`}
          >
            <span className="relative z-10">{moveType}</span>
          </motion.button>
        ))}
      </div>

      {/* Win celebration */}
      {gameState.isWon && (
        <div className="absolute inset-0 z-29 flex items-center justify-center bg-black/20">
          <div className="bg-gradient-to-br from-green-600/95 to-emerald-700/95 px-8 py-6 rounded-2xl shadow-2xl backdrop-blur-sm border-2 border-green-400/50 max-w-sm mx-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-3">🎉 Level Complete!</p>
              <div className="bg-white/20 rounded-lg p-4 mb-4 space-y-2 text-left">
                <div className="flex justify-between items-center text-white">
                  <span className="text-base">Moves:</span>
                  <span className="text-xl font-bold">{moveCount}</span>
                </div>
                {level.par && (
                  <div className="flex justify-between items-center text-white">
                    <span className="text-base">Par:</span>
                    <span className="text-xl font-bold">{level.par}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onBack}
                  className="flex-1 px-6 py-3 bg-white/20 text-white rounded-lg font-bold hover:bg-white/30 transition-all"
                >
                  Levels
                </button>
                <button
                  onClick={onNext}
                  className="flex-1 px-6 py-3 bg-white text-green-700 rounded-lg font-bold hover:bg-green-50 transition-all shadow-lg"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game canvas */}
      <div className="w-full h-full flex items-center justify-center">
        <GameCanvas
          gameState={gameState}
          onVertexClick={applyMove}
          onCenterClick={toggleMoveType}
          distinguishedVertex={level.distinguishedVertex}
        />
      </div>

      <Toaster />
    </div>
  );
}
