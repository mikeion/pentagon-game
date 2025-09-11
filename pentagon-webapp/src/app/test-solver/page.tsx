'use client';

import { useState } from 'react';
import Link from 'next/link';
import { testSolver } from '@/utils/test-solver';

export default function TestSolverPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<string>('');

  const runTests = async () => {
    setIsRunning(true);
    setResults('');
    
    // Capture console.log output
    const originalLog = console.log;
    let output = '';
    
    console.log = (...args: unknown[]) => {
      const line = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      output += line + '\n';
      setResults(output);
      originalLog(...args); // Still log to browser console
    };
    
    try {
      await testSolver();
    } catch (error) {
      output += `❌ Error: ${error}\n`;
      setResults(output);
    }
    
    // Restore original console.log
    console.log = originalLog;
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="container mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Solver Test Suite
          </h1>
          <p className="text-slate-300">
            Test the BFS solver with various scenarios
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Test Results</h2>
              <button
                onClick={runTests}
                disabled={isRunning}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isRunning
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30'
                }`}
              >
                {isRunning ? 'Running Tests...' : 'Run Solver Tests'}
              </button>
            </div>

            <div className="bg-slate-900 rounded-lg p-4 h-96 overflow-y-auto">
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                {results || 'Click "Run Solver Tests" to begin...'}
              </pre>
            </div>

            <div className="mt-6 text-sm text-slate-400">
              <p><strong>Test 1:</strong> Already solved - should return immediately</p>
              <p><strong>Test 2:</strong> 1-move solution - should find Move A on vertex 0</p>
              <p><strong>Test 3:</strong> 2-move solution - should find sequence</p>
              <p><strong>Test 4:</strong> Impossible goal - should fail gracefully</p>
            </div>

            <div className="mt-6 text-center">
              <Link 
                href="/"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                ← Back to Game
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}