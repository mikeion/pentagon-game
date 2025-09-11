export interface ComplexNumber {
  real: number;
  imag: number;
}

export type MoveType = 'A' | 'B' | 'C' | 'D';

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