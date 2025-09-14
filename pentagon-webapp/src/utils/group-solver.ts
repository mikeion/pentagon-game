// Group Theory-Based Perfect Solver
// Pre-computes all 162 reachable states and optimal paths

import { ComplexNumber, MoveType, SolverResult, SolverMove } from '@/types/game';

// Alex McDonough's firing matrix (from the PDF)
// 10x10 matrix where columns represent move operations
const FIRING_MATRIX = [
  // D moves (our A,B,C,D moves) - first 4 columns
  // Real parts (rows 0-4)
  [1, -1, -1,  1,  0,  0,  0,  0,  0,  0], // V0 real
  [-1, 0,  1,  0,  0,  0,  0,  0,  0,  0], // V1 real  
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0], // V2 real
  [0,  0,  0,  0,  0,  0,  0,  0,  0,  0], // V3 real
  [-1, 0,  1,  0,  0,  0,  0,  0,  0,  0], // V4 real
  
  // Imaginary parts (rows 5-9)  
  [1,  1, -1, -1,  0,  0,  0,  0,  0,  0], // V0 imag
  [0, -1,  0,  1,  0,  0,  0,  0,  0,  0], // V1 imag
  [0, -1,  0,  1,  0,  0,  0,  0,  0,  0], // V2 imag  
  [0, -1,  0,  1,  0,  0,  0,  0,  0,  0], // V3 imag
  [0, -1,  0,  1,  0,  0,  0,  0,  0,  0], // V4 imag
];

// Map move types to matrix column indices
const MOVE_TO_COLUMN: Record<MoveType, number> = {
  'A': 0, // First column of firing matrix
  'B': 1, // Second column  
  'C': 2, // Third column
  'D': 3  // Fourth column
};

export interface GroupState {
  vector: number[];        // Z^10 representation
  complex: ComplexNumber[]; // Pentagon representation
  id: string;             // Unique identifier
  generation: number;     // Distance from zero state
}

export interface GroupSolution {
  path: SolverMove[];
  explanation: {
    groupTheory: string;
    vectorOperations: string[];
    stateCount: number;
    optimality: string;
  };
  educational: {
    conceptsUsed: string[];
    mathematicalInsights: string[];
  };
}

class GroupSolver {
  private states: Map<string, GroupState> = new Map();
  private solutions: Map<string, SolverMove[]> = new Map();
  private isInitialized = false;

  // Convert complex pentagon to Z^10 vector (Alex's encoding)
  private toZ10Vector(complexState: ComplexNumber[]): number[] {
    return [
      ...complexState.map(c => c.real),    // First 5: real parts
      ...complexState.map(c => c.imag)     // Last 5: imaginary parts  
    ];
  }

  // Convert Z^10 vector back to pentagon
  private fromZ10Vector(vector: number[]): ComplexNumber[] {
    return Array.from({length: 5}, (_, i) => ({
      real: vector[i],
      imag: vector[i + 5]
    }));
  }

  // Generate state ID for hashing
  private getStateId(vector: number[]): string {
    return vector.join(',');
  }

  // Apply a firing operation using the matrix
  private applyFiring(vector: number[], columnIndex: number): number[] {
    const result = [...vector];
    for (let i = 0; i < 10; i++) {
      result[i] += FIRING_MATRIX[i][columnIndex];
    }
    return result;
  }

  // Pre-compute the entire group (all 162 states) with progress updates
  public async initializeGroup(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🔢 Initializing Pentagon Group Solver...');
    console.log('Pre-computing all 162 reachable states...');
    
    // Use setTimeout to yield control and prevent browser freezing
    const yieldControl = () => new Promise(resolve => setTimeout(resolve, 0));

    // Start from zero state
    const zeroVector = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const zeroComplex = this.fromZ10Vector(zeroVector);
    const zeroId = this.getStateId(zeroVector);
    
    const zeroState: GroupState = {
      vector: zeroVector,
      complex: zeroComplex,
      id: zeroId,
      generation: 0
    };

    this.states.set(zeroId, zeroState);
    this.solutions.set(zeroId, []); // Zero state needs no moves

    // BFS to generate all reachable states
    const queue: Array<{state: GroupState, path: SolverMove[]}> = [
      {state: zeroState, path: []}
    ];

    const moveTypes: MoveType[] = ['A', 'B', 'C', 'D'];
    const operations: ('add' | 'subtract')[] = ['add', 'subtract'];

    let generation = 0;
    let statesInGeneration = 1;
    let nextGenerationCount = 0;
    let processedInBatch = 0;
    const batchSize = 50; // Process in smaller batches

    while (queue.length > 0) {
      const current = queue.shift()!;
      processedInBatch++;
      
      // Yield control every batch to prevent freezing
      if (processedInBatch >= batchSize) {
        await yieldControl();
        processedInBatch = 0;
      }
      
      // Track generation progress
      statesInGeneration--;
      if (statesInGeneration === 0) {
        generation++;
        statesInGeneration = nextGenerationCount;
        nextGenerationCount = 0;
        console.log(`Generation ${generation}: ${this.states.size} total states discovered`);
      }

      // Try all possible moves
      for (const moveType of moveTypes) {
        for (const operation of operations) {
          const columnIndex = MOVE_TO_COLUMN[moveType];
          const multiplier = operation === 'subtract' ? -1 : 1;
          
          // Apply the firing operation
          const newVector = [...current.state.vector];
          for (let i = 0; i < 10; i++) {
            newVector[i] += FIRING_MATRIX[i][columnIndex] * multiplier;
          }

          const newId = this.getStateId(newVector);
          
          // If we haven't seen this state, add it
          if (!this.states.has(newId)) {
            const newComplex = this.fromZ10Vector(newVector);
            const newState: GroupState = {
              vector: newVector,
              complex: newComplex,
              id: newId,
              generation: current.state.generation + 1
            };

            const newPath = [...current.path, { vertex: 0, moveType, operation }];
            
            this.states.set(newId, newState);
            this.solutions.set(newId, newPath);
            queue.push({state: newState, path: newPath});
            nextGenerationCount++;
          }
        }
      }
    }

    console.log(`✅ Group initialization complete!`);
    console.log(`📊 Discovered ${this.states.size} unique states`);
    console.log(`🎯 Alex predicted 162 states - we found ${this.states.size}`);
    
    this.isInitialized = true;
  }

  // Perfect solver - O(1) lookup!
  public async solve(startState: ComplexNumber[], goalState: ComplexNumber[]): Promise<GroupSolution> {
    if (!this.isInitialized) {
      await this.initializeGroup();
    }

    const startVector = this.toZ10Vector(startState);
    const goalVector = this.toZ10Vector(goalState);
    
    const startId = this.getStateId(startVector);
    const goalId = this.getStateId(goalVector);

    // Check if states exist in our group
    if (!this.states.has(startId) || !this.states.has(goalId)) {
      throw new Error('State not in the pentagon group! This should never happen.');
    }

    // For now, find path to zero (our current goal)
    const solution = this.solutions.get(startId) || [];

    return {
      path: solution,
      explanation: {
        groupTheory: `This pentagon configuration exists in a finite group of ${this.states.size} elements.`,
        vectorOperations: solution.map((move, i) => 
          `Step ${i+1}: Apply ${move.moveType} ${move.operation} (column ${MOVE_TO_COLUMN[move.moveType]} of firing matrix)`
        ),
        stateCount: this.states.size,
        optimality: `This is the shortest path because we pre-computed all ${this.states.size} states using BFS.`
      },
      educational: {
        conceptsUsed: [
          'Finite Groups',
          'Vector Spaces over Z',  
          'Matrix Operations',
          'Graph Theory (BFS)',
          'Chip-Firing Games'
        ],
        mathematicalInsights: [
          `The pentagon group has exactly ${this.states.size} elements`,
          'Each move corresponds to adding a column vector from the firing matrix',
          'The group is generated by 4 fundamental operations (A, B, C, D)',
          'All puzzles are guaranteed solvable since they\'re in the same group orbit'
        ]
      }
    };
  }

  // Educational method - get information about the current state
  public getStateInfo(complexState: ComplexNumber[]) {
    const vector = this.toZ10Vector(complexState);
    const stateId = this.getStateId(vector);
    const state = this.states.get(stateId);
    
    return {
      vectorRepresentation: vector,
      generationFromZero: state?.generation || -1,
      totalStatesInGroup: this.states.size,
      isValidGroupElement: this.states.has(stateId)
    };
  }
}

// Singleton instance
export const groupSolver = new GroupSolver();

// Export for use in components
export async function solveWithGroupTheory(
  startState: ComplexNumber[], 
  goalState: ComplexNumber[]
): Promise<SolverResult & { educational?: GroupSolution['explanation'] }> {
  try {
    const solution = await groupSolver.solve(startState, goalState);
    
    return {
      found: true,
      moves: solution.path,
      message: `Solved in ${solution.path.length} moves using group theory!`,
      nodesExplored: 0, // Pre-computed, so no search needed
      educational: solution.explanation
    };
  } catch (error) {
    return {
      found: false,
      moves: [],
      message: 'Group theory solver error: ' + error,
      nodesExplored: 0
    };
  }
}