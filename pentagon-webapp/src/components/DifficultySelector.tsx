'use client';

import { useRouter } from 'next/navigation';

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

export default function DifficultySelector({ onSelectDifficulty }: DifficultySelectorProps) {
  const router = useRouter();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border-2 border-cyan-500 max-w-lg w-full">
        <button
          onClick={() => router.push('/')}
          className="text-slate-400 hover:text-white mb-4 text-sm flex items-center gap-1"
        >
          ← Back to main menu
        </button>

        <h2 className="text-2xl font-bold text-white mb-2 text-center">Select Difficulty</h2>
        <p className="text-slate-300 text-center text-sm mb-6">Choose your challenge level</p>

        <div className="space-y-3">
          <button
            onClick={() => onSelectDifficulty('easy')}
            className="w-full px-6 py-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold text-lg transition-all border border-slate-500"
          >
            Easy (3-5 moves)
          </button>
          <button
            onClick={() => onSelectDifficulty('medium')}
            className="w-full px-6 py-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold text-lg transition-all border border-slate-500"
          >
            Medium (6-9 moves)
          </button>
          <button
            onClick={() => onSelectDifficulty('hard')}
            className="w-full px-6 py-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold text-lg transition-all border border-slate-500"
          >
            Hard (10-15 moves)
          </button>
          <button
            onClick={() => onSelectDifficulty('expert')}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold text-lg transition-all border-2 border-purple-400"
          >
            <div>Expert 🔥</div>
            <div className="text-sm font-normal text-purple-100">Reach ANY nice representative (V0∈{'{0,3}'}, V1-V4∈{'{0,1,2}'})</div>
          </button>
        </div>
      </div>
    </div>
  );
}
