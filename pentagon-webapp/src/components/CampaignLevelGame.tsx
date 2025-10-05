'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast, { Toaster } from 'react-hot-toast';
import { Menu, Lightbulb, ArrowLeft } from 'lucide-react';
import GameCanvas from './GameCanvas';
import { ComplexNumber, GameState, Move, MoveType, UIMoveType, CampaignLevel } from '@/types/game';
import { getMatrixHint, getFullSolution } from '@/utils/matrix-solver-mathjs';
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

  const [hintVertex, setHintVertex] = useState<number | undefined>(undefined);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [fullSolution, setFullSolution] = useState<string[]>([]);
  const [isGettingSolution, setIsGettingSolution] = useState(false);
  const [showFullSolution, setShowFullSolution] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  const [moveCount, setMoveCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [solveTime, setSolveTime] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<Array<{ vertices: ComplexNumber[]; moveType: MoveType }>>([
    { vertices: level.startState.map(v => ({ ...v })), moveType: 'A' }
  ]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [solutionViewed, setSolutionViewed] = useState(false);
  const [showSolutionConfirm, setShowSolutionConfirm] = useState(false);

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
    setMoveHistory(prev => [...prev, {
      vertices: gameState.vertices.map(v => ({ ...v })),
      moveType: actualMoveType
    }]);
  }, [gameState.currentMoveType, gameState.vertices]);

  const undoMove = useCallback(() => {
    if (moveHistory.length <= 1) return;

    const newHistory = moveHistory.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];

    setMoveHistory(newHistory);
    setMoveCount(prev => Math.max(0, prev - 1));
    setGameState(prev => ({
      ...prev,
      vertices: previousState.vertices.map(v => ({ ...v })),
      currentMoveType: previousState.moveType,
      isWon: false,
    }));
  }, [moveHistory]);

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

  const getHint = useCallback(async () => {
    setIsGettingHint(true);
    setHintVertex(undefined);

    try {
      const hint = await getMatrixHint(gameState, gameState.currentMoveType);
      if (hint) {
        setHintsUsed(prev => prev + 1);

        if (hint.moveType !== gameState.currentMoveType) {
          const uiMoveType: UIMoveType = (hint.moveType === 'A' || hint.moveType === 'C') ? 'A' : 'B';
          setCurrentUIMoveType(uiMoveType);
          setGameState(prev => ({
            ...prev,
            currentMoveType: hint.moveType,
          }));
        }

        setGameState(prev => ({
          ...prev,
          selectedVertex: undefined,
        }));
        setHintVertex(hint.vertex);
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
      const moves = await getFullSolution(gameState);
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

        {/* Hint button */}
        <motion.button
          onClick={getHint}
          disabled={isGettingHint}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl shadow-xl backdrop-blur-md transition-colors disabled:opacity-50 border border-emerald-500/50 flex items-center justify-center"
        >
          <Lightbulb className={`w-6 h-6 ${isGettingHint ? 'animate-pulse' : ''}`} />
        </motion.button>
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
              className="w-full px-4 py-3 bg-purple-600/90 hover:bg-purple-600 text-white text-left font-semibold transition-all border-b border-slate-600 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Levels
            </button>
            <button
              onClick={() => { undoMove(); setShowMenuDropdown(false); }}
              disabled={moveHistory.length <= 1}
              className="w-full px-4 py-3 bg-yellow-600/90 hover:bg-yellow-600 text-white text-left font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-b border-slate-600"
            >
              Undo
            </button>
            <button
              onClick={() => { setShowSolutionConfirm(true); setShowMenuDropdown(false); }}
              disabled={isGettingSolution}
              className="w-full px-4 py-3 bg-indigo-600/90 hover:bg-indigo-600 text-white text-left font-semibold transition-all disabled:opacity-50"
            >
              {isGettingSolution ? 'Loading...' : 'Solution'}
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

      {/* Solution confirm dialog */}
      {showSolutionConfirm && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border-2 border-yellow-500 max-w-sm">
            <h3 className="text-xl font-bold text-white mb-3">View Solution?</h3>
            <p className="text-slate-300 mb-6">This won't affect your progress.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSolutionConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowSolutionConfirm(false); getFullSolutionMoves(); }}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all"
              >
                Show
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full solution display */}
      {showFullSolution && fullSolution.length > 0 && (
        <div className="absolute top-20 right-4 z-20 max-w-sm bg-slate-800/95 p-4 rounded-xl shadow-2xl backdrop-blur-sm border border-indigo-500">
          <h4 className="text-sm font-bold text-indigo-400 mb-2">
            🎯 Solution ({fullSolution.length} moves):
          </h4>
          <div className="flex flex-wrap gap-1 mb-2 max-h-40 overflow-y-auto">
            {fullSolution.map((move, index) => {
              const cleanMove = move.replace(' (long press)', '');
              const moveType = cleanMove[0];
              const vertex = cleanMove[1];
              let displayMove = '';
              if (moveType === 'A') displayMove = 'A';
              else if (moveType === 'C') displayMove = '-A';
              else if (moveType === 'B') displayMove = 'B';
              else displayMove = '-B';

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

      {/* Game canvas */}
      <div className="w-full h-full flex items-center justify-center">
        <GameCanvas
          gameState={gameState}
          onVertexClick={applyMove}
          onCenterClick={toggleMoveType}
          hintVertex={hintVertex}
          distinguishedVertex={level.distinguishedVertex}
        />
      </div>

      <Toaster />
    </div>
  );
}
