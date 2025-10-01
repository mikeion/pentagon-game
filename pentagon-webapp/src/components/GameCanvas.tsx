'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, VertexPosition } from '@/types/game';

interface GameCanvasProps {
  gameState: GameState;
  onVertexClick: (vertexIndex: number, operation?: 'add' | 'subtract') => void;
  onCenterClick?: (operation: 'add' | 'subtract') => void;
  hintVertex?: number; // Vertex to highlight for hints
}

export default function GameCanvas({ gameState, onVertexClick, onCenterClick, hintVertex }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vertexPositions, setVertexPositions] = useState<VertexPosition[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  // Calculate vertex positions for pentagon
  const calculateVertexPositions = useCallback((width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    // Make pentagon fill 80-90% of viewport (much larger than before)
    const radius = Math.min(width, height) * 0.38;

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
      // Full viewport sizing - pentagon should dominate the screen
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Reserve space for overlays (buttons at top corners + bottom controls on mobile)
      const reservedTop = 80; // Space for top overlay buttons
      const reservedBottom = window.innerWidth < 768 ? 200 : 100; // More space on mobile
      const reservedSides = 40; // Padding on sides

      const availableWidth = vw - (reservedSides * 2);
      const availableHeight = vh - reservedTop - reservedBottom;

      // Make canvas square, fitting in available space
      const size = Math.min(availableWidth, availableHeight);

      setCanvasSize({ width: size, height: size });
      setVertexPositions(calculateVertexPositions(size, size));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [calculateVertexPositions]);

  // Drawing function
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = canvasSize;
    
    // Clear canvas with solid background
    ctx.fillStyle = 'rgb(30, 41, 59)'; // Solid background to prevent rendering issues
    ctx.fillRect(0, 0, width, height);
    
    if (vertexPositions.length === 0) return;

    // Draw pentagon edges ONLY (remove complete graph visualization)
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
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

    // Draw center circle with current move rule
    const centerX = width / 2;
    const centerY = height / 2;
    const centerRadius = 55;

    // Determine UI move type (A or B) from internal move type (A/B/C/D)
    const uiMoveType = (gameState.currentMoveType === 'A' || gameState.currentMoveType === 'C') ? 'A' : 'B';

    // Center circle background
    ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
    ctx.strokeStyle = uiMoveType === 'A' ? '#EC4899' : '#F59E0B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Display current move in center (show UI move types A/B only)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const moveText = uiMoveType === 'A' ? '1+i' : '-1+i';
    ctx.fillText(moveText, centerX, centerY - 10);

    // Show what happens to neighbors (smaller text)
    ctx.font = '14px monospace';
    ctx.fillStyle = '#94A3B8';
    const neighborText = uiMoveType === 'A' ? '(-1 to adj)' : '(-i to adj)';
    ctx.fillText(neighborText, centerX, centerY + 15);

    // Draw vertices with color coding
    gameState.vertices.forEach((vertex, i) => {
      const pos = vertexPositions[i];
      const isPureReal = vertex.imag === 0;
      const isZero = vertex.real === 0 && vertex.imag === 0;

      // Highlight selected vertex
      if (i === gameState.selectedVertex) {
        ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 60, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Highlight hint vertex with pulsing animation
      if (hintVertex !== undefined && i === hintVertex) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 65, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw vertex circle with color coding
      ctx.fillStyle = '#1E293B';
      // Color code the border: Blue for pure real, Purple for complex, Green for zero
      if (isZero) {
        ctx.strokeStyle = '#10B981'; // Green for goal
      } else if (isPureReal) {
        ctx.strokeStyle = '#3B82F6'; // Blue for pure real
      } else {
        ctx.strokeStyle = '#A855F7'; // Purple for complex
      }
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 45, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Draw vertex label (V0, V1, etc.)
      ctx.fillStyle = '#EC4899';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`V${i}`, pos.x - 55, pos.y - 55);

      // Draw complex number with color-coded parts
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (isZero) {
        ctx.fillStyle = '#10B981';
        ctx.fillText('0', pos.x, pos.y);
      } else {
        const sign = vertex.imag >= 0 ? '+' : '';
        const text = isPureReal ? `${vertex.real}` : `${vertex.real}${sign}${vertex.imag}i`;

        // Color based on type
        ctx.fillStyle = isPureReal ? '#60A5FA' : '#C084FC';
        ctx.fillText(text, pos.x, pos.y);
      }
    });
  }, [canvasSize, vertexPositions, gameState.vertices, gameState.selectedVertex, gameState.currentMoveType, hintVertex]);

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
      
      if (distance < 45) {
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

    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const centerRadius = 55;

    // Check if click is on center circle
    const centerDistance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    if (centerDistance < centerRadius && onCenterClick) {
      const operation = e.button === 2 || isLongPress ? 'subtract' : 'add';
      onCenterClick(operation);
      setIsLongPress(false);
      return;
    }

    // Check if click is on a vertex
    for (let i = 0; i < vertexPositions.length; i++) {
      const pos = vertexPositions[i];
      const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);

      if (distance < 45) {
        const operation = e.button === 2 || isLongPress ? 'subtract' : 'add';
        onVertexClick(i, operation);
        break;
      }
    }

    setIsLongPress(false);
  }, [vertexPositions, onVertexClick, onCenterClick, isLongPress, longPressTimer, canvasSize]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && onCenterClick) {
        e.preventDefault();
        onCenterClick('add');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onCenterClick]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onContextMenu={handleContextMenu}
        className="cursor-pointer touch-none"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          willChange: 'auto',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      />
    </div>
  );
}