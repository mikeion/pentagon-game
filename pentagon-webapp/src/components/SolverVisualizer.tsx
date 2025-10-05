'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import anime from 'animejs';
import { ComplexNumber, MoveType } from '@/types/game';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface SolverNode {
  id: string;
  state: ComplexNumber[];
  parent: string | null;
  move: MoveType | null;
  depth: number;
  x: number;
  y: number;
}

interface SolverVisualizerProps {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
}

export default function SolverVisualizer({ isRunning, setIsRunning }: SolverVisualizerProps) {
  const [nodes, setNodes] = useState<SolverNode[]>([]);
  const [edges, setEdges] = useState<Array<{ from: string; to: string; move: MoveType }>>([]);
  const [solutionPath, setSolutionPath] = useState<string[]>([]);
  const [stats, setStats] = useState({ explored: 0, depth: 0, time: 0 });
  const [speed, setSpeed] = useState(1);
  const canvasRef = useRef<SVGSVGElement>(null);

  // Generate random starting puzzle
  const generateRandomState = (): ComplexNumber[] => {
    return Array(5).fill(null).map(() => ({
      real: Math.floor(Math.random() * 7) - 3,
      imag: Math.floor(Math.random() * 7) - 3,
    }));
  };

  // Simulate BFS search (simplified version)
  const runSolver = async () => {
    setIsRunning(true);
    const startState = generateRandomState();
    const startTime = Date.now();

    // Create starting node
    const startNode: SolverNode = {
      id: '0',
      state: startState,
      parent: null,
      move: null,
      depth: 0,
      x: 400,
      y: 100,
    };

    const newNodes: SolverNode[] = [startNode];
    const newEdges: Array<{ from: string; to: string; move: MoveType }> = [];

    // Simulate BFS exploration
    let nodeIdCounter = 1;
    const maxDepth = 4;
    const branchingFactor = 3;

    for (let depth = 0; depth < maxDepth; depth++) {
      const nodesAtDepth = newNodes.filter(n => n.depth === depth);

      for (const node of nodesAtDepth) {
        const numChildren = Math.floor(Math.random() * branchingFactor) + 1;

        for (let i = 0; i < numChildren; i++) {
          const move: MoveType = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)] as MoveType;

          // Position children in a circle around parent
          const angleOffset = (i - (numChildren - 1) / 2) * 0.5;
          const baseAngle = Math.PI / 2;
          const radius = 150;

          const childNode: SolverNode = {
            id: String(nodeIdCounter++),
            state: generateRandomState(),
            parent: node.id,
            move,
            depth: depth + 1,
            x: node.x + Math.sin(baseAngle + angleOffset) * radius,
            y: node.y + Math.cos(baseAngle + angleOffset) * radius,
          };

          newNodes.push(childNode);
          newEdges.push({ from: node.id, to: childNode.id, move });

          // Animate node appearance
          await new Promise(resolve => setTimeout(resolve, 50 / speed));
          setNodes([...newNodes]);
          setEdges([...newEdges]);

          // Animate the new node
          anime({
            targets: `#node-${childNode.id}`,
            scale: [0, 1],
            opacity: [0, 1],
            duration: 300 / speed,
            easing: 'easeOutElastic(1, .6)',
          });

          setStats({
            explored: newNodes.length,
            depth: depth + 1,
            time: (Date.now() - startTime) / 1000,
          });
        }
      }
    }

    // Mark a random path as solution
    const randomLeaf = newNodes[Math.floor(Math.random() * newNodes.length)];
    const path: string[] = [];
    let current: SolverNode | undefined = randomLeaf;

    while (current) {
      path.unshift(current.id);
      current = newNodes.find(n => n.id === current!.parent);
    }

    setSolutionPath(path);

    // Animate solution path
    anime({
      targets: path.map(id => `#edge-to-${id}`),
      stroke: '#10b981',
      strokeWidth: 4,
      duration: 800 / speed,
      delay: anime.stagger(200 / speed),
      easing: 'easeInOutQuad',
    });

    setIsRunning(false);
  };

  const reset = () => {
    setNodes([]);
    setEdges([]);
    setSolutionPath([]);
    setStats({ explored: 0, depth: 0, time: 0 });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
      {/* Controls */}
      <div className="p-6 border-b border-slate-700 flex items-center justify-between">
        <div className="flex gap-3">
          <motion.button
            onClick={runSolver}
            disabled={isRunning}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-semibold shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Solver
              </>
            )}
          </motion.button>

          <motion.button
            onClick={reset}
            disabled={isRunning}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="text-sm text-slate-400">Speed:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="text-sm font-bold text-white w-12">{speed}x</span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-700 grid grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-slate-500 mb-1">Nodes Explored</div>
          <div className="text-2xl font-bold text-purple-400">{stats.explored}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Max Depth</div>
          <div className="text-2xl font-bold text-cyan-400">{stats.depth}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Time Elapsed</div>
          <div className="text-2xl font-bold text-pink-400">{stats.time.toFixed(2)}s</div>
        </div>
      </div>

      {/* Visualization Canvas */}
      <div className="relative w-full h-[600px] bg-slate-900/30 overflow-auto">
        <svg
          ref={canvasRef}
          className="w-full h-full"
          style={{ minWidth: '800px', minHeight: '800px' }}
        >
          {/* Draw edges */}
          {edges.map((edge, i) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const isSolution = solutionPath.includes(edge.to) && solutionPath.includes(edge.from);

            return (
              <line
                key={i}
                id={`edge-to-${edge.to}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={isSolution ? '#10b981' : '#475569'}
                strokeWidth={isSolution ? 3 : 1.5}
                opacity={0.6}
              />
            );
          })}

          {/* Draw nodes */}
          {nodes.map((node) => {
            const isSolution = solutionPath.includes(node.id);
            const isStart = node.id === '0';

            return (
              <g key={node.id} id={`node-${node.id}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isStart ? 16 : 12}
                  fill={isStart ? '#8b5cf6' : isSolution ? '#10b981' : '#475569'}
                  stroke={isStart ? '#a78bfa' : isSolution ? '#22c55e' : '#64748b'}
                  strokeWidth={2}
                  className="transition-all duration-300"
                />
                {node.move && (
                  <text
                    x={node.x}
                    y={node.y - 20}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {node.move}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <p className="text-lg mb-2">Click "Run Solver" to start visualization</p>
              <p className="text-sm">Watch the BFS algorithm explore the state space in real-time</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-6 border-t border-slate-700 flex items-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-600 border-2 border-purple-400" />
          <span className="text-slate-400">Start Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-600 border-2 border-slate-500" />
          <span className="text-slate-400">Explored Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-600 border-2 border-green-500" />
          <span className="text-slate-400">Solution Path</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-green-600" />
          <span className="text-slate-400">Solution Edge</span>
        </div>
      </div>
    </div>
  );
}
