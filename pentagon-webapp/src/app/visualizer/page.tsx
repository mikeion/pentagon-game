'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SolverVisualizer from '@/components/SolverVisualizer';

export default function VisualizerPage() {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Matrix Solver Visualizer
            </h1>
            <p className="text-slate-400">
              Watch how the BFS algorithm explores the state space to find the solution
            </p>
          </div>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              ← Back to Game
            </motion.button>
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Algorithm</div>
            <div className="text-2xl font-bold text-purple-400">BFS</div>
            <div className="text-xs text-slate-500 mt-1">Breadth-First Search</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">State Space</div>
            <div className="text-2xl font-bold text-cyan-400">162 Orbits</div>
            <div className="text-xs text-slate-500 mt-1">Maximum configurations</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-400 mb-1">Visualization</div>
            <div className="text-2xl font-bold text-pink-400">Real-time</div>
            <div className="text-xs text-slate-500 mt-1">Powered by Anime.js</div>
          </div>
        </div>
      </div>

      {/* Visualizer Component */}
      <div className="max-w-7xl mx-auto">
        <SolverVisualizer isRunning={isRunning} setIsRunning={setIsRunning} />
      </div>
    </div>
  );
}
