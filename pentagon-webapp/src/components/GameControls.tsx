'use client';

import { GameState, MoveType } from '@/types/game';
import { Jacquard_12, Jolly_Lodger } from 'next/font/google';

interface GameControlsProps {
  gameState: GameState;
  onMoveTypeChange: (moveType: MoveType) => void;
  onReset: () => void;
  onNewGoal: () => void;
  onGetHint?: () => Promise<void>;
  hintResult?: string;
  isGettingHint?: boolean;
  onGetFullSolution?: () => Promise<void>;
  fullSolution?: string[];
  isGettingSolution?: boolean;
  showFullSolution?: boolean;
  onHideFullSolution?: () => void;
}

const moveDescriptions = {
  'A': 'Add 1+i to vertex, -1 to neighbors',
  'B': 'Add -1+i to vertex, -i to neighbors',
  'C': 'Add -1-i to vertex, +1 to neighbors',
  'D': 'Add 1-i to vertex, +i to neighbors',
};

export default function GameControls({ 
  gameState, 
  onMoveTypeChange, 
  onReset, 
  onNewGoal,
  onGetHint,
  hintResult,
  isGettingHint = false,
  onGetFullSolution,
  fullSolution,
  isGettingSolution = false,
  showFullSolution = false,
  onHideFullSolution
}: GameControlsProps) {

  return (
    <div className="bg-slate-800/95 backdrop-blur-none md:backdrop-blur-sm rounded-2xl p-3 md:p-4 shadow-2xl border border-slate-700 w-full lg:w-80">
      {/* Move Type Selection */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-3">Select Move Type</h3>
        <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
          {(['A', 'B', 'C', 'D'] as MoveType[]).map(moveType => (
            <button
              key={moveType}
              onClick={() => onMoveTypeChange(moveType)}
              className={`
                px-3 py-2 rounded-lg font-semibold text-base transition-all duration-200
                ${gameState.currentMoveType === moveType 
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30 scale-105' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                }
              `}
              title={moveDescriptions[moveType]}
            >
              {moveType}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-400">
          <strong>Tap:</strong> Add • <strong>Long press:</strong> Subtract
        </div>
      </div>

      {/* Current Move Description */}
      <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-600">
        <h4 className="text-sm font-semibold text-pink-400 mb-1">Move {gameState.currentMoveType}:</h4>
        <p className="text-xs text-slate-300">{moveDescriptions[gameState.currentMoveType]}</p>
      </div>

      {/* Goal Configuration */}
      <div className="mb-4">
        <div className="p-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg border border-green-500/30">
          <div className="text-center">
            <h4 className="text-base font-bold text-green-400 mb-1">🎯 Goal</h4>
            <p className="text-green-300 text-xs">Get all vertices to 0+0i</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={onReset}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
        >
          Reset
        </button>
        <button
          onClick={onNewGoal}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm"
        >
          New Puzzle
        </button>
        {onGetHint && (
          <button
            onClick={onGetHint}
            disabled={isGettingHint}
            className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 text-sm"
          >
            {isGettingHint ? 'Calculating...' : 'Get Hint'}
          </button>
        )}
        {onGetFullSolution && (
          <button
            onClick={onGetFullSolution}
            disabled={isGettingSolution}
            className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 text-sm"
          >
            {isGettingSolution ? 'Solving...' : 'Full Solution'}
          </button>
        )}
      </div>
      
      {/* Hint Result */}
      {hintResult && (
        <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-600">
          <h4 className="text-xs font-semibold text-green-400 mb-1">💡 Hint:</h4>
          <p className="text-xs text-slate-300">{hintResult}</p>
        </div>
      )}

      {/* Full Solution Display */}
      {showFullSolution && fullSolution && fullSolution.length > 0 && (
        <div className="mt-3 p-3 bg-indigo-900/50 rounded-lg border border-indigo-600">
          <h4 className="text-xs font-semibold text-indigo-400 mb-2">
            🎯 Full Solution ({fullSolution.length} moves):
          </h4>
          <div className="flex flex-wrap gap-1 mb-2">
            {fullSolution.map((move, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-mono"
              >
                {index + 1}. {move}
              </span>
            ))}
          </div>
          {onHideFullSolution && (
            <button
              onClick={onHideFullSolution}
              className="w-full px-2 py-1 bg-slate-600 text-white rounded text-xs hover:bg-slate-500 transition-colors"
            >
              Hide Solution
            </button>
          )}
        </div>
      )}

      {/* Win Status */}
      {gameState.isWon && (
        <div className="mt-3 p-3 bg-green-600/20 border border-green-600 rounded-lg text-center">
          <p className="text-green-400 font-bold text-sm">🎉 You Won!</p>
          <p className="text-green-300 text-xs mt-1">Configuration matched!</p>
        </div>
      )}

    </div>
  );
}



 