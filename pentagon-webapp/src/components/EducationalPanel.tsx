'use client';

import React, { useState, useEffect } from 'react';
import { ComplexNumber } from '@/types/game';
import { groupSolver } from '@/utils/group-solver';

interface EducationalPanelProps {
  currentState: ComplexNumber[];
  isVisible: boolean;
  onToggle: () => void;
}

type ViewMode = 'pentagon' | 'vector' | 'matrix' | 'group';
type ExplanationLevel = 'intuitive' | 'formal' | 'research';

export default function EducationalPanel({ 
  currentState, 
  isVisible, 
  onToggle 
}: EducationalPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('pentagon');
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>('intuitive');
  const [stateInfo, setStateInfo] = useState<{
    vectorRepresentation: number[];
    generationFromZero: number;
    totalStatesInGroup: number;
    isValidGroupElement: boolean;
  } | null>(null);
  const [groupInitialized, setGroupInitialized] = useState(false);

  // Initialize the group solver only when the panel is visible and group view is selected
  useEffect(() => {
    const initializeAndAnalyze = async () => {
      // Only initialize if panel is visible AND we're viewing the group tab
      if (!isVisible || viewMode !== 'group') return;
      
      try {
        await groupSolver.initializeGroup();
        setGroupInitialized(true);
        
        const info = groupSolver.getStateInfo(currentState);
        setStateInfo(info);
      } catch (error) {
        console.error('Group solver initialization error:', error);
      }
    };

    initializeAndAnalyze();
  }, [currentState, isVisible, viewMode]);

  // Convert complex numbers to Z^10 vector for display
  const toZ10Vector = (state: ComplexNumber[]): number[] => [
    ...state.map(c => c.real),
    ...state.map(c => c.imag)
  ];

  const renderPentagonView = () => (
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <h4 className="font-semibold text-white mb-3">🔵 Pentagon View</h4>
      <div className="grid grid-cols-5 gap-2 text-sm">
        {currentState.map((vertex, i) => (
          <div key={i} className="text-center p-2 bg-slate-700 rounded">
            <div className="text-pink-400 font-mono text-xs">V{i}</div>
            <div className="text-white font-mono">
              {vertex.real}{vertex.imag >= 0 ? '+' : ''}{vertex.imag}i
            </div>
          </div>
        ))}
      </div>
      
      {explanationLevel === 'intuitive' && (
        <div className="mt-3 text-sm text-slate-300">
          Each vertex holds a complex number. Operations spread values to neighboring vertices.
        </div>
      )}
    </div>
  );

  const renderVectorView = () => {
    const vector = toZ10Vector(currentState);
    return (
      <div className="p-4 bg-slate-800/50 rounded-lg">
        <h4 className="font-semibold text-white mb-3">📊 Vector View (ℤ¹⁰)</h4>
        <div className="font-mono text-sm bg-slate-900 p-3 rounded">
          <div className="text-green-400 mb-2">Real parts: [{vector.slice(0, 5).join(', ')}]</div>
          <div className="text-blue-400">Imag parts: [{vector.slice(5, 10).join(', ')}]</div>
        </div>
        
        {explanationLevel !== 'intuitive' && (
          <div className="mt-3 text-sm text-slate-300">
            <strong>ℤ¹⁰ Vector Representation:</strong> Each pentagon configuration maps to a 10-dimensional integer vector.
            The first 5 components are real parts, the last 5 are imaginary parts.
          </div>
        )}
      </div>
    );
  };

  const renderMatrixView = () => (
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <h4 className="font-semibold text-white mb-3">🔢 Firing Matrix</h4>
      <div className="text-xs font-mono bg-slate-900 p-3 rounded overflow-x-auto">
        <div className="text-slate-400 mb-2">Columns: A, B, C, D moves</div>
        <pre className="text-slate-300">
{`[ 1 -1 -1  1]  ← V0 real
[-1  0  1  0]  ← V1 real  
[ 0  0  0  0]  ← V2 real
[ 0  0  0  0]  ← V3 real
[-1  0  1  0]  ← V4 real
[ 1  1 -1 -1]  ← V0 imag
[ 0 -1  0  1]  ← V1 imag
[ 0 -1  0  1]  ← V2 imag
[ 0 -1  0  1]  ← V3 imag
[ 0 -1  0  1]  ← V4 imag`}
        </pre>
      </div>
      
      {explanationLevel !== 'intuitive' && (
        <div className="mt-3 text-sm text-slate-300">
          Each move adds a column vector to your current state. This is the firing matrix from Alex McDonough&apos;s research.
        </div>
      )}
    </div>
  );

  const renderGroupView = () => (
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <h4 className="font-semibold text-white mb-3">🧮 Group Theory View</h4>
      
      {groupInitialized && stateInfo ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-700 p-3 rounded">
              <div className="text-purple-400 font-semibold">Group Size</div>
              <div className="text-white font-mono text-lg">{stateInfo.totalStatesInGroup}</div>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <div className="text-purple-400 font-semibold">Distance from Zero</div>
              <div className="text-white font-mono text-lg">{stateInfo.generationFromZero}</div>
            </div>
          </div>
          
          <div className="text-sm text-slate-300">
            <strong>Current State:</strong> This configuration is {stateInfo.generationFromZero} moves away from the zero state
            in the pentagon group. The group has exactly {stateInfo.totalStatesInGroup} elements.
          </div>
          
          {explanationLevel === 'research' && (
            <div className="text-xs text-slate-400 bg-slate-900 p-2 rounded">
              <strong>Research Note:</strong> This finite group structure was characterized by Alex McDonough. 
              The 162 elements form a complete orbit under the four fundamental firing operations.
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-2"></div>
          <div className="text-sm text-slate-400">Computing group structure...</div>
        </div>
      )}
    </div>
  );

  const renderExplanations = () => {
    const explanations = {
      intuitive: {
        pentagon: "Think of each vertex as holding a complex number. When you make a move, it changes the target vertex and spreads effects to its neighbors.",
        vector: "Every pentagon configuration can be written as a list of 10 numbers: 5 real parts followed by 5 imaginary parts.",
        matrix: "Each move type (A, B, C, D) corresponds to adding a specific pattern of numbers to your current state.",
        group: "All possible pentagon configurations form a mathematical group with exactly 162 members."
      },
      formal: {
        pentagon: "Pentagon configurations exist in the complex plane ℂ⁵, with operations defined by the firing matrix.",
        vector: "The state space is embedded in ℤ¹⁰, where each configuration maps to a 10-dimensional integer vector.",
        matrix: "Operations are linear transformations defined by the 10×10 firing matrix from chip-firing theory.",
        group: "The configuration space forms a finite abelian group of order 162 under the firing operations."
      },
      research: {
        pentagon: "This extends classical chip-firing games to complex number coefficients, as studied by McDonough.",
        vector: "The ℤ¹⁰ embedding preserves the group structure while enabling computational analysis.",
        matrix: "The firing matrix encodes the combinatorial Laplacian of the pentagon graph with complex coefficients.",
        group: "The group structure reveals deep connections between algebraic graph theory and discrete dynamical systems."
      }
    };

    return (
      <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/30">
        <h4 className="font-semibold text-blue-400 mb-2">💡 Mathematical Insight</h4>
        <p className="text-sm text-slate-300">
          {explanations[explanationLevel][viewMode]}
        </p>
      </div>
    );
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors z-10"
      >
        📚 Math Mode
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">🎓 Mathematical Explorer</h2>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          
          {/* View Mode Selector */}
          <div className="mt-4 flex gap-2">
            {['pentagon', 'vector', 'matrix', 'group'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as ViewMode)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Explanation Level */}
          <div className="mt-2 flex gap-2">
            {['intuitive', 'formal', 'research'].map((level) => (
              <button
                key={level}
                onClick={() => setExplanationLevel(level as ExplanationLevel)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  explanationLevel === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Visualization */}
          {viewMode === 'pentagon' && renderPentagonView()}
          {viewMode === 'vector' && renderVectorView()}
          {viewMode === 'matrix' && renderMatrixView()}
          {viewMode === 'group' && renderGroupView()}

          {/* Mathematical Explanations */}
          {renderExplanations()}

          {/* Educational Resources */}
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <h4 className="font-semibold text-white mb-3">📖 Learn More</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-green-400">Related Concepts:</strong>
                <ul className="text-slate-300 ml-4 mt-1">
                  <li>• Chip-firing games</li>
                  <li>• Sandpile models</li>
                  <li>• Algebraic graph theory</li>
                  <li>• Finite group theory</li>
                </ul>
              </div>
              <div>
                <strong className="text-blue-400">Research:</strong>
                <ul className="text-slate-300 ml-4 mt-1">
                  <li>• Alex McDonough&apos;s pentagon research</li>
                  <li>• Complex number firing games</li>
                  <li>• Discrete dynamical systems</li>
                  <li>• Combinatorial optimization</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}