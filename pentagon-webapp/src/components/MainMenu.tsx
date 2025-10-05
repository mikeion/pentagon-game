'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MainMenu() {
  const router = useRouter();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="bg-slate-800 p-8 rounded-2xl shadow-2xl border-2 border-indigo-500 max-w-md w-full"
      >
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Chip Firing Game</h2>

        <p className="text-slate-400 text-center mb-6">
          Explore the mathematics of the R₁₀ sandpile group
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/campaign')}
            className="w-full px-6 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xl transition-all shadow-lg"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">📚</span>
              <span>Campaign Mode</span>
            </div>
            <p className="text-sm text-indigo-200 mt-2">
              Learn chip-firing step by step
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/free-play')}
            className="w-full px-6 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xl transition-all shadow-lg"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🎮</span>
              <span>Free Play</span>
            </div>
            <p className="text-sm text-emerald-200 mt-2">
              Random puzzles, any difficulty
            </p>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
