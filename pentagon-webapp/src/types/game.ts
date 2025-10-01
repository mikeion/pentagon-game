export interface ComplexNumber {
  real: number;
  imag: number;
}

// Internal: All 4 moves for solver (C = -A, D = -B mathematically)
export type MoveType = 'A' | 'B' | 'C' | 'D';

// UI: Only show A and B to users (right-click applies negative)
export type UIMoveType = 'A' | 'B';

export interface Move {
  vertex: ComplexNumber;
  adjacent: ComplexNumber;
}

export interface GameState {
  vertices: ComplexNumber[];
  goalVertices: ComplexNumber[];
  currentMoveType: MoveType;
  selectedVertex: number;
  isWon: boolean;
}

export interface SolverResult {
  found: boolean;
  moves: SolverMove[];
  message: string;
  nodesExplored?: number;
}

export interface SolverMove {
  vertex: number;
  moveType: MoveType;
  operation: 'add' | 'subtract';
}

export interface VertexPosition {
  x: number;
  y: number;
}