'use client';

import { ComplexNumber } from '@/types/game';
import { BookOpen, ChevronRight } from 'lucide-react';

// From the paper (lines 463-470 of main.tex):
// Initial: (3+i, 4-6i, 7+i, -8-8i, 3)
// Final: (0, 1, 0, 0, 0)
//
// The vector: [-5-i, -4+i, -4+3i, 4-i, -1]
// Real part = A-firings: [-5, -4, -4, 4, -1]
// Imaginary part = B-firings: [-1, 1, 3, -1, 0]

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

// Steps in Algorithm 2.1
export interface AlgorithmStep {
  stepNumber: number;
  title: string;
  description: string;
  expectedState?: ComplexNumber[];
  calculation?: string;
  reference?: string;
}

export const ALGORITHM_STEPS: AlgorithmStep[] = [
  {
    stepNumber: 0,
    title: 'Initial Configuration',
    description: 'We start with the chip configuration (3+i, 4-6i, 7+i, -8-8i, 3), with v₀ as our distinguished node.',
    expectedState: PAPER_INITIAL_STATE,
    reference: 'Example from paper (line 464)',
  },
  {
    stepNumber: 1,
    title: 'Step 1: Label Nodes',
    description: 'Label nodes v₀, v₁, v₂, v₃, v₄ and let ψ(vₖ) be the imaginary chips at node vₖ.',
    calculation: 'ψ(v₀) = 1, ψ(v₁) = -6, ψ(v₂) = 1, ψ(v₃) = -8, ψ(v₄) = 0',
    reference: 'Algorithm 2.1, Step 1',
  },
  {
    stepNumber: 2,
    title: 'Step 2: Add Real Chips',
    description: 'At each node vₖ, add ψ(vₖ) - ψ(vₖ₊₁) - ψ(vₖ₋₁) real chips (indices mod 5).',
    calculation: 'Add 7 to v₀, -8 to v₁, 15 to v₂, -9 to v₃, 7 to v₄',
    reference: 'Algorithm 2.1, Step 2',
  },
  {
    stepNumber: 3,
    title: 'Step 3: Remove Imaginary Chips',
    description: 'Remove all imaginary chips from the configuration.',
    expectedState: [
      { real: 10, imag: 0 },
      { real: -4, imag: 0 },
      { real: 22, imag: 0 },
      { real: -17, imag: 0 },
      { real: 10, imag: 0 },
    ],
    calculation: 'Result: (10, -4, 22, -17, 10)',
    reference: 'Algorithm 2.1, Step 3',
  },
  {
    stepNumber: 4,
    title: 'Steps 4-5: Check Parity',
    description: 'Count total chips. If even, set isEven = True; otherwise False.',
    calculation: 'Total = 10 + (-4) + 22 + (-17) + 10 = 21 (odd) → isEven = False',
    reference: 'Algorithm 2.1, Steps 4-5',
  },
  {
    stepNumber: 5,
    title: 'Step 6: Normalize by Distinguished Node',
    description: 'Subtract the number of chips at v₀ from every node.',
    calculation: 'Subtract 10 from each: (0, -14, 12, -27, 0)',
    reference: 'Algorithm 2.1, Step 6',
  },
  {
    stepNumber: 6,
    title: 'Step 7: Modulo 3',
    description: 'At each node, set chips to remainder after dividing by 3.',
    calculation: '0 mod 3 = 0, -14 mod 3 = 1, 12 mod 3 = 0, -27 mod 3 = 0, 0 mod 3 = 0',
    expectedState: PAPER_FINAL_STATE,
    reference: 'Algorithm 2.1, Step 7',
  },
  {
    stepNumber: 7,
    title: 'Step 8: Final Parity Check',
    description: 'Count total chips. If parity changed, add 3 to v₀.',
    calculation: 'Total = 1 (odd), isEven = False → No change needed',
    expectedState: PAPER_FINAL_STATE,
    reference: 'Algorithm 2.1, Step 8',
  },
  {
    stepNumber: 8,
    title: 'Nice Representative Found!',
    description: 'The configuration (0, 1, 0, 0, 0) is the nice representative for this equivalence class.',
    expectedState: PAPER_FINAL_STATE,
    reference: 'Theorem 3.1',
  },
];

interface PaperExampleTutorialProps {
  currentStep: number;
  currentState: ComplexNumber[];
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
}

export default function PaperExampleTutorial({
  currentStep,
  currentState,
  onNextStep,
  onPrevStep,
  onReset,
}: PaperExampleTutorialProps) {
  const step = ALGORITHM_STEPS[currentStep] || ALGORITHM_STEPS[0];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ALGORITHM_STEPS.length - 1;

  // Check if current state matches expected state
  const stateMatches = step.expectedState
    ? currentState.every((v, i) =>
        v.real === step.expectedState![i].real &&
        v.imag === step.expectedState![i].imag
      )
    : true;

  return (
    <div className="absolute top-4 left-4 right-4 md:left-4 md:right-auto md:max-w-md z-20 bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-md px-5 py-4 rounded-xl border-2 border-purple-500/50 shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-purple-400/30">
        <BookOpen className="w-5 h-5 text-purple-300" />
        <h3 className="text-lg font-bold text-white">Algorithm 2.1 in Action</h3>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-purple-300 mb-1">
          <span>Step {currentStep + 1} of {ALGORITHM_STEPS.length}</span>
          <span>{Math.round(((currentStep + 1) / ALGORITHM_STEPS.length) * 100)}%</span>
        </div>
        <div className="w-full bg-purple-950/50 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / ALGORITHM_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-3">
        <div>
          <h4 className="text-md font-bold text-purple-200 mb-1">{step.title}</h4>
          <p className="text-sm text-purple-100 leading-relaxed">{step.description}</p>
        </div>

        {step.calculation && (
          <div className="bg-purple-950/40 rounded-lg p-3 border border-purple-500/20">
            <div className="text-xs font-semibold text-purple-300 mb-1">Calculation:</div>
            <div className="text-sm text-white font-mono">{step.calculation}</div>
          </div>
        )}

        {step.reference && (
          <div className="text-xs text-purple-400 italic">
            Reference: {step.reference}
          </div>
        )}

        {/* State Validation */}
        {step.expectedState && !stateMatches && (
          <div className="bg-yellow-900/40 border border-yellow-500/50 rounded-lg p-2 text-xs text-yellow-200">
            Current state doesn't match expected. Continue following the algorithm steps.
          </div>
        )}

        {step.expectedState && stateMatches && currentStep > 0 && (
          <div className="bg-green-900/40 border border-green-500/50 rounded-lg p-2 text-xs text-green-200 flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span>State matches algorithm output!</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-purple-400/30">
        <button
          onClick={onReset}
          className="px-3 py-2 bg-purple-800/60 hover:bg-purple-700/70 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
        <button
          onClick={onPrevStep}
          disabled={isFirstStep}
          className="px-3 py-2 bg-purple-800/60 hover:bg-purple-700/70 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        <button
          onClick={onNextStep}
          disabled={isLastStep}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          {isLastStep ? 'Completed' : 'Next Step'}
          {!isLastStep && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Educational Context for Final Step */}
      {isLastStep && (
        <div className="mt-3 pt-3 border-t border-purple-400/30 space-y-2">
          <div className="text-xs text-purple-200">
            <div className="font-semibold mb-1">What does this mean?</div>
            <ul className="list-disc list-inside space-y-1 text-purple-100">
              <li>This represents one equivalence class of S(R₁₀)</li>
              <li>v₀ can have 0 or 3 chips (distinguished node)</li>
              <li>Other vertices can have 0, 1, or 2 chips</li>
              <li>This proves there are exactly 162 equivalence classes</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
