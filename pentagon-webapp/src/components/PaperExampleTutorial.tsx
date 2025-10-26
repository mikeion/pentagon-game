'use client';

import { ComplexNumber } from '@/types/game';
import { BookOpen, ChevronRight } from 'lucide-react';
import { generateExample311Tutorial, formatState } from '@/utils/pedagogical-solver';

// From the paper (Example 3.11, page 8):
// Initial: (3+i, 4-6i, 7+i, -8-8i, 3)
// Final: (0, 1, 0, 0, 0)
//
// K⁻¹ calculation gives firing vector: [-5-i, -4+i, -4+3i, 4-i, -1]
// Real part = A-firings needed: [-5, -4, -4, 4, -1]
// Imaginary part = B-firings needed: [-1, 1, 3, -1, 0]
//
// Negative numbers mean fire the opposite move:
// -5 A-firings = 5 (-A)-firings
// -1 B-firings = 1 (-B)-firing

export const PAPER_INITIAL_STATE: ComplexNumber[] = [
  { real: 3, imag: 1 },    // v0
  { real: 4, imag: -6 },   // v1
  { real: 7, imag: 1 },    // v2
  { real: -8, imag: -8 },  // v3
  { real: 3, imag: 0 },    // v4
];

export const PAPER_FINAL_STATE: ComplexNumber[] = [
  { real: 0, imag: 0 },  // v0
  { real: 1, imag: 0 },  // v1
  { real: 0, imag: 0 },  // v2
  { real: 0, imag: 0 },  // v3
  { real: 0, imag: 0 },  // v4
];

// Generate the firing sequence dynamically using the pedagogical solver
// This follows Lemma 3.4's strategy: B/-B firings first (remove imaginary),
// then A/-A firings (handle real chips)
const pedagogicalSteps = generateExample311Tutorial();

// Convert to tutorial format with intro and conclusion
export interface FiringStep {
  stepNumber: number;
  title: string;
  description: string;
  moves: string;
  vertex?: number;
  moveType?: 'A' | 'B' | '-A' | '-B';
  count?: number;
  explanation?: string;
  reference?: string;
  stateBefore?: ComplexNumber[];
  stateAfter?: ComplexNumber[];
}

const introStep: FiringStep = {
  stepNumber: 0,
  title: 'Finding a Nice Representative',
  description: 'Initial: (3+i, 4-6i, 7+i, -8-8i, 3). Goal: Find the NICE REPRESENTATIVE (0, 1, 0, 0, 0) for this equivalence class of S(R₁₀).',
  moves: 'No moves yet',
  explanation: 'These configurations are FIRING EQUIVALENT - they belong to the same equivalence class of S(R₁₀). Using the K⁻¹ matrix calculation from Example 3.11, we can find the exact sequence of A and B firings to reach the unique nice representative (Theorem 3.8).',
  reference: 'Example 3.11, page 8',
  stateBefore: PAPER_INITIAL_STATE,
  stateAfter: PAPER_INITIAL_STATE,
};

// Convert pedagogical steps to firing steps
const firingStepsFromSolver = pedagogicalSteps.map((step, idx) => {
  // Handle explanation steps differently
  if (step.isExplanation) {
    return {
      stepNumber: idx + 1,
      title: step.description,
      description: step.description,
      moves: 'No firing - explanation only',
      explanation: step.explanation,
      stateBefore: step.stateBefore,
      stateAfter: step.stateAfter,
    };
  }

  // Regular firing steps
  return {
    stepNumber: idx + 1,
    title: step.description,
    description: step.description,
    moves: `${step.count}× ${step.moveType} at v${step.vertex}`,
    vertex: step.vertex,
    moveType: step.moveType,
    count: step.count,
    explanation: step.explanation,
    stateBefore: step.stateBefore,
    stateAfter: step.stateAfter,
  };
});

export const FIRING_SEQUENCE: FiringStep[] = [
  ...firingStepsFromSolver,
];

// Remove old hardcoded steps below this line

interface PaperExampleTutorialProps {
  currentStep: number;
  currentState: ComplexNumber[];
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  onApplyMove?: (vertex: number, moveType: 'A' | 'B' | '-A' | '-B', count: number) => void;
  highlightedVertex?: number;
}

export default function PaperExampleTutorial({
  currentStep,
  currentState,
  onNextStep,
  onPrevStep,
  onReset,
  onApplyMove,
}: PaperExampleTutorialProps) {
  const step = FIRING_SEQUENCE[currentStep] || FIRING_SEQUENCE[0];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === FIRING_SEQUENCE.length - 1;

  // Check if current state matches expected state for this step
  const stateMatches = step.stateAfter
    ? currentState.every((v, i) =>
        v.real === step.stateAfter![i].real && v.imag === step.stateAfter![i].imag
      )
    : true;

  // For non-first steps, check if we match the BEFORE state (user hasn't made the move yet)
  const matchesBeforeState = step.stateBefore
    ? currentState.every((v, i) =>
        v.real === step.stateBefore![i].real && v.imag === step.stateBefore![i].imag
      )
    : false;

  const canApplyMove = onApplyMove && step.vertex !== undefined && step.moveType && step.count;
  const isExplanationStep = step.moves === 'No firing - explanation only';

  return (
    <div className="absolute bottom-4 left-4 right-4 md:top-16 md:bottom-auto md:left-4 md:right-auto md:max-w-sm z-10 bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl border border-cyan-500/50 shadow-2xl max-h-[40vh] md:max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-600">
        <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
        <h3 className="text-base md:text-lg font-bold text-white">Firing Sequence Tutorial</h3>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-300 mb-1">
          <span>Step {currentStep + 1} of {FIRING_SEQUENCE.length}</span>
          <span>{Math.round(((currentStep + 1) / FIRING_SEQUENCE.length) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / FIRING_SEQUENCE.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-2">
        <div>
          <h4 className="text-sm md:text-md font-bold text-cyan-300 mb-1">{step.title}</h4>
        </div>

        {/* Firing Moves Display */}
        <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-600">
          <div className="text-xs font-semibold text-cyan-400 mb-1">Moves:</div>
          <div className="text-xs md:text-sm text-white font-mono break-all">{step.moves}</div>
        </div>

        {step.explanation && (
          <div className="bg-slate-900/40 rounded-lg p-2 border border-slate-700">
            <div className="text-xs font-semibold text-cyan-300 mb-1">
              {isExplanationStep ? 'Details:' : 'Why this works:'}
            </div>
            <div className="text-xs text-slate-300 whitespace-pre-line">{step.explanation}</div>
          </div>
        )}

        {step.reference && (
          <div className="text-xs text-slate-400 italic">
            📖 {step.reference}
          </div>
        )}

        {/* State Validation - only for firing steps (not explanation steps) */}
        {!isFirstStep && !isLastStep && !isExplanationStep && (
          <div className="mt-3">
            {stateMatches ? (
              <div className="bg-green-900/40 border border-green-500/50 rounded-lg p-2 text-xs text-green-200 flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span>State correct! Ready for next step.</span>
              </div>
            ) : matchesBeforeState ? (
              <div className="bg-yellow-900/40 border border-yellow-500/50 rounded-lg p-3 text-xs">
                <div className="text-yellow-200 mb-2 flex items-center gap-2">
                  <span className="text-lg">⚠</span>
                  <span className="font-semibold">Move not applied yet</span>
                </div>
                <div className="text-yellow-100 mb-2">
                  You need to: Fire {step.moveType} at v{step.vertex} {step.count} time{step.count! > 1 ? 's' : ''}
                </div>
                {canApplyMove && (
                  <button
                    onClick={() => onApplyMove!(step.vertex!, step.moveType!, step.count!)}
                    className="w-full px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-all"
                  >
                    Apply This Move Automatically
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-3 text-xs">
                <div className="text-red-200 mb-2 flex items-center gap-2">
                  <span className="text-lg">✗</span>
                  <span className="font-semibold">State mismatch!</span>
                </div>
                <div className="text-red-100 mb-2">
                  Current state: {formatState(currentState)}
                </div>
                <div className="text-red-100 mb-2">
                  Expected: {formatState(step.stateAfter || [])}
                </div>
                <div className="text-yellow-200 text-xs">
                  Click "Reset" to start over, or click "Prev" to go back.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-600">
        <button
          onClick={onReset}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <button
          onClick={onPrevStep}
          disabled={isFirstStep}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        <button
          onClick={onNextStep}
          disabled={isLastStep}
          className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          {isLastStep ? 'Completed' : 'Next Step'}
          {!isLastStep && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Educational Context for Final Step */}
      {isLastStep && (
        <div className="mt-3 pt-3 border-t border-cyan-400/30 space-y-2">
          <div className="text-xs text-cyan-100">
            <div className="font-semibold mb-1">From Theorem 3.8:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-200">
              <li>Every equivalence class contains a unique nice representative</li>
              <li>Nice representatives have the form (0 or 3, 0-2, 0-2, 0-2, 0-2) with all real chips</li>
              <li>S(R₁₀) ≅ (ℤ/3ℤ)³ ⊕ (ℤ/6ℤ), giving exactly 2 × 3⁴ = 162 equivalence classes</li>
              <li>Configuration (0, 1, 0, 0, 0) is the nice representative for this equivalence class</li>
              <li>Algorithm 3.10 uses the K⁻¹ matrix to compute the firing vector needed</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
