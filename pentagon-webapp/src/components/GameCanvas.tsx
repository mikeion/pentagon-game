'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, VertexPosition } from '@/types/game';

interface GameCanvasProps {
  gameState: GameState;
  onVertexClick: (vertexIndex: number, operation?: 'add' | 'subtract') => void;
  onCenterClick?: (operation: 'add' | 'subtract') => void;
  hintVertex?: number; // Vertex to highlight for hints
  distinguishedVertex?: number; // Vertex to mark as distinguished (V0) for nice-representative goals
}

export default function GameCanvas({ gameState, onVertexClick, onCenterClick, hintVertex, distinguishedVertex }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vertexPositions, setVertexPositions] = useState<VertexPosition[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  // Calculate vertex positions for pentagon
  const calculateVertexPositions = useCallback((width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    // Pentagon radius - scale down on mobile to prevent label cutoff
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const radius = Math.min(width, height) * (isMobile ? 0.35 : 0.40);

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
      // Use viewport units for truly responsive design
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw < 768;

      // Reserve space as percentage of viewport
      const reservedTopVh = isMobile ? 12 : 10; // 12vh on mobile, 10vh on desktop (for buttons)
      const reservedBottomVh = isMobile ? 18 : 12; // 18vh on mobile, 12vh on desktop (for buttons)
      const reservedSidesVw = 5; // 5vw on each side

      const availableWidth = vw * (1 - (reservedSidesVw * 2 / 100));
      const availableHeight = vh * (1 - (reservedTopVh + reservedBottomVh) / 100);

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

    // Clear canvas with gradient background
    const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
    gradient.addColorStop(0, 'rgb(30, 41, 59)');
    gradient.addColorStop(1, 'rgb(15, 23, 42)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    if (vertexPositions.length === 0) return;

    // Draw pentagon edges with gradient and glow
    const edgeGradient = ctx.createLinearGradient(0, 0, width, height);
    edgeGradient.addColorStop(0, '#3B82F6');
    edgeGradient.addColorStop(0.5, '#8B5CF6');
    edgeGradient.addColorStop(1, '#06B6D4');

    // Glow effect
    ctx.shadowColor = '#3B82F6';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = edgeGradient;
    ctx.lineWidth = 4;
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
    ctx.shadowBlur = 0;

    // Draw center pentagon with current move rule
    const centerX = width / 2;
    const centerY = height / 2;
    const centerRadius = 100; // Increased from 70 to fill more space

    // Determine UI move type (A or B) from internal move type (A/B/C/D)
    const uiMoveType = (gameState.currentMoveType === 'A' || gameState.currentMoveType === 'C') ? 'A' : 'B';

    // Center pentagon gradient background
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
    centerGradient.addColorStop(0, 'rgba(30, 41, 59, 0.98)');
    centerGradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
    ctx.fillStyle = centerGradient;

    // Glow effect for center pentagon
    ctx.shadowColor = uiMoveType === 'A' ? '#EC4899' : '#F59E0B';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = uiMoveType === 'A' ? '#EC4899' : '#F59E0B';
    ctx.lineWidth = 5;
    ctx.beginPath();
    // Draw pentagon centered on screen
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI / 5) - Math.PI / 2; // Start from top
      const x = centerX + centerRadius * Math.cos(angle);
      const y = centerY + centerRadius * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Display current move in center - show as A/-A or B/-B
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px monospace'; // Increased from 32px
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Show move letter with negative sign for C and D
    let moveLabel = '';
    let line1 = '';
    let line2 = '';
    if (gameState.currentMoveType === 'A') {
      moveLabel = 'A';
      line1 = '1+i to vertex';
      line2 = '-i to adj';
    } else if (gameState.currentMoveType === 'C') {
      moveLabel = '-A';
      line1 = '-1-i to vertex';
      line2 = '+i to adj';
    } else if (gameState.currentMoveType === 'B') {
      moveLabel = 'B';
      line1 = '-1+i to vertex';
      line2 = '+1 to adj';
    } else { // D
      moveLabel = '-B';
      line1 = '1-i to vertex';
      line2 = '-1 to adj';
    }

    ctx.fillText(moveLabel, centerX, centerY - 20);

    // Show complex number details (larger text for readability)
    ctx.font = '14px monospace'; // Increased from 10px
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(line1, centerX, centerY + 15);
    ctx.fillText(line2, centerX, centerY + 32);

    // Draw vertices with color coding
    gameState.vertices.forEach((vertex, i) => {
      const pos = vertexPositions[i];
      const isPureReal = vertex.imag === 0;
      const isZero = vertex.real === 0 && vertex.imag === 0;

      // Highlight selected vertex with glow
      if (i === gameState.selectedVertex) {
        ctx.shadowColor = '#EC4899';
        ctx.shadowBlur = 25;
        ctx.fillStyle = 'rgba(236, 72, 153, 0.3)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 48, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Highlight hint vertex with pulsing glow
      if (hintVertex !== undefined && i === hintVertex) {
        ctx.shadowColor = '#22C55E';
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 42, 0, 2 * Math.PI); // Smaller radius to avoid covering label
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Highlight distinguished vertex (V0) with gold ring
      if (distinguishedVertex !== undefined && i === distinguishedVertex) {
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 45, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Add "V0" label above the vertex
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#F59E0B';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('V₀', pos.x, pos.y - 50);
      }

      // Draw vertex circle with gradient
      const vertexGradient = ctx.createRadialGradient(pos.x, pos.y - 10, 0, pos.x, pos.y, 35);
      vertexGradient.addColorStop(0, 'rgba(30, 41, 59, 1)');
      vertexGradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
      ctx.fillStyle = vertexGradient;

      // Vertex border with glow
      ctx.shadowColor = '#8B5CF6';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 35, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Vertex labels now rendered as HTML elements (see return statement)

      // Draw complex number - always center-aligned as single string
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (isZero) {
        ctx.fillStyle = '#10B981'; // Green for zero
        ctx.fillText('0', pos.x, pos.y);
      } else if (isPureReal) {
        ctx.fillStyle = '#60A5FA'; // Blue for pure real
        ctx.fillText(`${vertex.real}`, pos.x, pos.y);
      } else {
        // Complex number - display as single string with gradient effect
        const sign = vertex.imag >= 0 ? '+' : '';
        const fullText = `${vertex.real}${sign}${vertex.imag}i`;

        // Create gradient for complex numbers
        const textGradient = ctx.createLinearGradient(pos.x - 30, pos.y, pos.x + 30, pos.y);
        textGradient.addColorStop(0, '#60A5FA'); // Blue
        textGradient.addColorStop(1, '#C084FC'); // Purple
        ctx.fillStyle = textGradient;
        ctx.fillText(fullText, pos.x, pos.y);
      }
    });
  }, [canvasSize, vertexPositions, gameState.vertices, gameState.selectedVertex, gameState.currentMoveType, hintVertex, distinguishedVertex]);

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

      if (distance < 35) {
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

      if (distance < 35) {
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
    <div className="relative flex items-center justify-center">
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

      {/* Vertex labels as HTML positioned absolutely - won't get clipped! */}
      {vertexPositions.map((pos, i) => {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;
        const angle = Math.atan2(pos.y - centerY, pos.x - centerX);
        const labelDistance = 50;
        const labelX = pos.x + Math.cos(angle) * labelDistance;
        const labelY = pos.y + Math.sin(angle) * labelDistance;

        return (
          <div
            key={i}
            className="absolute text-pink-500 font-bold text-lg font-mono pointer-events-none"
            style={{
              left: `${labelX}px`,
              top: `${labelY}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            V{i}
          </div>
        );
      })}
    </div>
  );
}