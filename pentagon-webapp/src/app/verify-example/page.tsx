'use client';

import { generateExample311Tutorial, formatState, formatComplexNumber } from '@/utils/pedagogical-solver';

export default function VerifyExample() {
  const steps = generateExample311Tutorial();

  // Expected from Example 3.11
  const expected = {
    initial: { real: 3, imag: 1 }, // v0 initial
    final: { real: 0, imag: 1 }, // v1 final (nice representative)
    firingVector: [
      { real: -5, imag: -1 }, // v0: -5 A-firings, -1 B-firings
      { real: -4, imag: 1 },  // v1: -4 A-firings, +1 B-firings
      { real: -4, imag: 3 },  // v2: -4 A-firings, +3 B-firings
      { real: 4, imag: -1 },  // v3: +4 A-firings, -1 B-firings
      { real: -1, imag: 0 },  // v4: -1 A-firings, 0 B-firings
    ]
  };

  // Count firings from our solver
  const firingCounts = [
    { vertex: 0, A: 0, B: 0 },
    { vertex: 1, A: 0, B: 0 },
    { vertex: 2, A: 0, B: 0 },
    { vertex: 3, A: 0, B: 0 },
    { vertex: 4, A: 0, B: 0 },
  ];

  for (const step of steps) {
    // Skip explanation steps (no vertex)
    if (step.vertex === undefined || step.moveType === undefined || step.count === undefined) continue;

    const v = step.vertex;
    if (step.moveType === 'A') {
      firingCounts[v].A += step.count;
    } else if (step.moveType === '-A') {
      firingCounts[v].A -= step.count;
    } else if (step.moveType === 'B') {
      firingCounts[v].B += step.count;
    } else if (step.moveType === '-B') {
      firingCounts[v].B -= step.count;
    }
  }

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">Example 3.11 Verification</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Expected from Paper</h2>
        <div className="bg-slate-800 p-4 rounded-lg space-y-2 font-mono text-sm">
          <p>Initial state: (3+i, 4-6i, 7+i, -8-8i, 3)</p>
          <p>Final state: (0, 1, 0, 0, 0)</p>
          <p className="text-cyan-300 mt-4">K⁻¹ firing vector:</p>
          {expected.firingVector.map((v, i) => (
            <p key={i} className="ml-4">
              v{i}: A-firings = {v.real}, B-firings = {v.imag}
            </p>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-green-400">Our Solver Output</h2>
        <div className="bg-slate-800 p-4 rounded-lg space-y-2 font-mono text-sm">
          <p>Initial: {formatState(steps[0]?.stateBefore || [])}</p>
          <p>Final: {formatState(steps[steps.length - 1]?.stateAfter || [])}</p>
          <p className="text-green-300 mt-4">Firing counts:</p>
          {firingCounts.map((counts, i) => (
            <p key={i} className="ml-4">
              v{i}: A-firings = {counts.A}, B-firings = {counts.B}
            </p>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-purple-400">Verification</h2>
        <div className="bg-slate-800 p-4 rounded-lg">
          {firingCounts.map((counts, i) => {
            const exp = expected.firingVector[i];
            const aMatch = counts.A === exp.real;
            const bMatch = counts.B === exp.imag;
            const match = aMatch && bMatch;

            return (
              <div key={i} className={`p-2 mb-2 rounded ${match ? 'bg-green-900/40' : 'bg-red-900/40'}`}>
                <p className="font-semibold">v{i}: {match ? '✓ MATCH' : '✗ MISMATCH'}</p>
                <p className="text-sm ml-4">
                  A: expected {exp.real}, got {counts.A} {aMatch ? '✓' : '✗'}
                </p>
                <p className="text-sm ml-4">
                  B: expected {exp.imag}, got {counts.B} {bMatch ? '✓' : '✗'}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Step-by-Step Firing Sequence</h2>
        <div className="bg-slate-800 p-4 rounded-lg space-y-3">
          <p className="text-cyan-300 mb-4">
            Strategy: B/-B firings first (remove imaginary), then A/-A firings (handle real)
          </p>
          {steps.map((step, idx) => (
            <div key={idx} className="border-l-4 border-cyan-500 pl-4 py-2">
              <p className="font-semibold">
                Step {idx + 1}: {step.count}× {step.moveType} at v{step.vertex}
              </p>
              <p className="text-sm text-slate-400">{step.explanation}</p>
              {step.stateBefore && step.stateAfter && (
                <p className="text-xs text-slate-500 mt-1">
                  Before: {formatState(step.stateBefore)} → After: {formatState(step.stateAfter)}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-orange-400">Algorithm 3.10 Steps (for reference)</h2>
        <div className="bg-slate-800 p-4 rounded-lg space-y-2 text-sm">
          <p>1. Label nodes and count imaginary chips ψ(vₖ)</p>
          <p>2. At each node vₖ, add ψ(vₖ) - ψ(vₖ₊₁) - ψ(vₖ₋₁) real chips</p>
          <p>3. Remove all imaginary chips</p>
          <p>4-5. Track parity with isEven boolean</p>
          <p>6. Subtract chips at v₀ from all nodes</p>
          <p>7. Take remainder mod 3 at each node</p>
          <p>8. Check parity and add 3 to v₀ if needed</p>
          <p className="text-yellow-300 mt-4">
            Note: These are ABSTRACT mathematical steps. The firing sequence shows the CONCRETE moves
            needed to achieve the same result.
          </p>
        </div>
      </section>
    </div>
  );
}
