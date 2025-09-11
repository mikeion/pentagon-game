'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, VertexPosition } from '@/types/game';

interface GameCanvasProps {
  gameState: GameState;
  onVertexClick: (vertexIndex: number, operation?: 'add' | 'subtract') => void;
}

export default function GameCanvas({ gameState, onVertexClick }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vertexPositions, setVertexPositions] = useState<VertexPosition[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  // Calculate vertex positions for pentagon
  const calculateVertexPositions = useCallback((width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    
    const positions: VertexPosition[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (2 * Math.PI * i / 5);
      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    }
    return positions;
  }, []);

  // Update canvas size and vertex positions
  useEffect(() => {
    const updateSize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const size = Math.min(container.clientWidth, 600);
        setCanvasSize({ width: size, height: size });
        setVertexPositions(calculateVertexPositions(size, size));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [calculateVertexPositions]);

  // Drawing function
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = canvasSize;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.fillRect(0, 0, width, height);
    
    if (vertexPositions.length === 0) return;

    // Draw pentagon edges
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < vertexPositions.length; i++) {
      const pos = vertexPositions[i];
      if (i === 0) {
        ctx.moveTo(pos.x, pos.y);
      } else {
        ctx.lineTo(pos.x, pos.y);
      }
    }
    ctx.closePath();
    ctx.stroke();

    // Draw additional edges (complete graph with reduced opacity)
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      for (let j = i + 2; j < 5; j++) {
        if (j - i !== 1 && !(i === 0 && j === 4)) {
          ctx.beginPath();
          ctx.moveTo(vertexPositions[i].x, vertexPositions[i].y);
          ctx.lineTo(vertexPositions[j].x, vertexPositions[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw vertices
    gameState.vertices.forEach((vertex, i) => {
      const pos = vertexPositions[i];
      
      // Highlight selected vertex
      if (i === gameState.selectedVertex) {
        ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 40, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Draw vertex circle
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Draw vertex label (V0, V1, etc.)
      ctx.fillStyle = '#EC4899';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`V${i}`, pos.x - 35, pos.y - 35);
      
      // Draw complex number
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const sign = vertex.imag >= 0 ? '+' : '';
      ctx.fillText(`${vertex.real}${sign}${vertex.imag}i`, pos.x, pos.y);
    });
  }, [canvasSize, vertexPositions, gameState.vertices, gameState.selectedVertex]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      draw(ctx);
      requestAnimationFrame(animate);
    };
    
    animate();
  }, [draw]);

  // Handle mouse/touch events
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on a vertex
    for (let i = 0; i < vertexPositions.length; i++) {
      const pos = vertexPositions[i];
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      
      if (distance < 40) {
        // Start long press timer for mobile
        setIsLongPress(false);
        const timer = setTimeout(() => {
          setIsLongPress(true);
        }, 500);
        setLongPressTimer(timer);
        
        e.preventDefault();
        return;
      }
    }
  }, [vertexPositions]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is on a vertex
    for (let i = 0; i < vertexPositions.length; i++) {
      const pos = vertexPositions[i];
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      
      if (distance < 40) {
        const operation = e.button === 2 || isLongPress ? 'subtract' : 'add';
        onVertexClick(i, operation);
        break;
      }
    }

    setIsLongPress(false);
  }, [vertexPositions, onVertexClick, isLongPress, longPressTimer]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 shadow-2xl border border-slate-700">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onContextMenu={handleContextMenu}
        className="rounded-lg cursor-pointer touch-none"
        style={{ 
          width: `${canvasSize.width}px`, 
          height: `${canvasSize.height}px` 
        }}
      />
      
      <div className="mt-4 text-center">
        <p className="text-slate-400 text-sm">
          {gameState.isWon 
            ? "🎉 Puzzle Solved! Try a new goal."
            : `Move ${gameState.currentMoveType} selected • Click vertices to apply moves`
          }
        </p>
      </div>
    </div>
  );
}