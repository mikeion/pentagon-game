'use client';

import { GameState, MoveType } from '@/types/game';

interface GameControlsProps {
  gameState: GameState;
  onMoveTypeChange: (moveType: MoveType) => void;
  onReset: () => void;
  onNewGoal: () => void;
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
  onNewGoal 
}: GameControlsProps) {
  const formatComplexNumber = (num: { real: number; imag: number }) => {
    const sign = num.imag >= 0 ? '+' : '';
    return `${num.real}${sign}${num.imag}i`;
  };

  return (
    <div className="bg-slate-800/95 backdrop-blur-none md:backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-2xl border border-slate-700 w-full lg:w-80">
      {/* Move Type Selection */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Select Move Type</h3>
        <div className="grid grid-cols-4 md:grid-cols-2 gap-2 md:gap-3">
          {(['A', 'B', 'C', 'D'] as MoveType[]).map(moveType => (
            <button
              key={moveType}
              onClick={() => onMoveTypeChange(moveType)}
              className={`
                px-3 py-2 md:px-4 md:py-3 rounded-lg font-semibold text-base md:text-lg transition-all duration-200
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
        <div className="mt-3 text-xs md:text-sm text-slate-400">
          <strong>Tap:</strong> Add • <strong>Long press:</strong> Subtract
        </div>
      </div>

      {/* Current Move Description */}
      <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
        <h4 className="text-sm font-semibold text-pink-400 mb-2">Move {gameState.currentMoveType}:</h4>
        <p className="text-sm text-slate-300">{moveDescriptions[gameState.currentMoveType]}</p>
      </div>

      {/* Goal Configuration */}
      <div className="mb-4 md:mb-6">
        <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Goal Configuration</h4>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
          {gameState.goalVertices.map((vertex, i) => (
            <div 
              key={i} 
              className="flex justify-between items-center py-1 md:py-2 px-2 md:px-3 bg-slate-900/50 rounded-lg"
            >
              <span className="text-pink-400 font-mono text-sm md:text-base">V{i}:</span>
              <span className="text-white font-mono text-sm md:text-base">{formatComplexNumber(vertex)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onReset}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Reset
        </button>
        <button
          onClick={onNewGoal}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          New Goal
        </button>
      </div>

      {/* Win Status */}
      {gameState.isWon && (
        <div className="mt-6 p-4 bg-green-600/20 border border-green-600 rounded-lg text-center">
          <p className="text-green-400 font-bold">🎉 You Won!</p>
          <p className="text-green-300 text-sm mt-1">Configuration matched!</p>
        </div>
      )}

    </div>
  );
}