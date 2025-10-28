'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MainMenu() {
  const router = useRouter();
  const [showQuickReference, setShowQuickReference] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border-2 border-indigo-500 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-white mb-1 text-center">R₁₀ Matroid Chip Firing</h2>
        <p className="text-slate-400 text-center mb-2 text-xs">
          Based on the paper:
        </p>
        <p className="text-indigo-300 text-center mb-4 text-sm font-semibold">
          McDonough & Ion (2025) - Chip-Firing and the Sandpile Group of the R₁₀ Matroid
        </p>

        {/* Introductory Context */}
        <div className="bg-slate-700/50 p-4 rounded-lg mb-5 border border-slate-600">
          <p className="text-slate-200 text-sm leading-relaxed mb-3">
            <span className="font-semibold text-cyan-300">What this app does:</span> Visualize and explore chip-firing dynamics on a pentagon using <span className="font-semibold text-indigo-300">Gaussian integers</span> (complex numbers a+bi where a,b are integers).
          </p>
          <p className="text-slate-200 text-sm leading-relaxed">
            Apply <span className="font-semibold text-white">4 firing moves</span> (A, B, and their negatives) to explore the <span className="font-semibold text-white">162 distinct configurations</span> of this combinatorial system. Each configuration represents a different pattern in how chips can be distributed across the pentagon.
          </p>
        </div>

        {/* Quick Reference - Collapsible */}
        <div className="mb-5">
          <button
            onClick={() => setShowQuickReference(!showQuickReference)}
            className="w-full px-4 py-2 bg-slate-700/70 hover:bg-slate-600/70 text-slate-200 rounded-lg text-sm font-medium transition-all border border-slate-600 flex items-center justify-between"
          >
            <span>Quick Reference: Firing Moves</span>
            <span className="text-lg">{showQuickReference ? '−' : '+'}</span>
          </button>
          {showQuickReference && (
            <div className="mt-2 bg-slate-700/30 p-4 rounded-lg border border-slate-600 text-xs space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="font-semibold text-indigo-300 mb-1">Move A (left-click)</div>
                  <div className="text-slate-300">Vertex: +1+i</div>
                  <div className="text-slate-300">Neighbors: −i</div>
                </div>
                <div>
                  <div className="font-semibold text-purple-300 mb-1">Move B (left-click)</div>
                  <div className="text-slate-300">Vertex: −1+i</div>
                  <div className="text-slate-300">Neighbors: +1</div>
                </div>
                <div>
                  <div className="font-semibold text-indigo-300 mb-1">Move −A (right-click)</div>
                  <div className="text-slate-300">Vertex: −1−i</div>
                  <div className="text-slate-300">Neighbors: +i</div>
                </div>
                <div>
                  <div className="font-semibold text-purple-300 mb-1">Move −B (right-click)</div>
                  <div className="text-slate-300">Vertex: +1−i</div>
                  <div className="text-slate-300">Neighbors: −1</div>
                </div>
              </div>
              <p className="text-slate-400 text-center pt-2 border-t border-slate-600">
                Each move adds chips to a vertex and its two adjacent neighbors (pentagon edges only)
              </p>
            </div>
          )}
        </div>

        <p className="text-white mb-4 text-center font-semibold text-lg">Select Mode</p>
        <div className="space-y-3">
          <button
            onClick={() => router.push('/puzzle')}
            className="w-full px-6 py-5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-all border border-cyan-600"
          >
            <div className="text-lg mb-1">Puzzle Mode</div>
            <div className="text-sm text-cyan-100">Solve puzzles with 4 difficulty levels. Easy-Hard: reach (0,0,0,0,0). <span className="font-medium text-cyan-200">Expert</span>: reach any nice representative!</div>
          </button>
          <button
            onClick={() => router.push('/example-311')}
            className="w-full px-6 py-5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition-all border border-cyan-500"
          >
            <div className="text-lg mb-1 flex items-center justify-center gap-2">
              <span>📖</span>
              <span>Example 3.11 Tutorial</span>
            </div>
            <div className="text-sm text-slate-200 space-y-1">
              <div><span className="font-semibold text-cyan-300">Initial:</span> (3+i, 4-6i, 7+i, -8-8i, 3)</div>
              <div className="text-xs text-slate-300">Interactive demonstration of Algorithm 3.10 using linear algebra and direct transformations.</div>
            </div>
          </button>
          <button
            onClick={() => router.push('/sandbox')}
            className="w-full px-6 py-5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all border border-slate-600"
          >
            <div className="text-lg mb-1">Sandbox Mode</div>
            <div className="text-sm text-slate-300">Freely set chips and explore the dynamics. Experiment with different configurations and firing patterns.</div>
          </button>
        </div>
      </div>
    </div>
  );
}
