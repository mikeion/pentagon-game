'use client';

import PentagonGame from '@/components/PentagonGame';

/**
 * Direct route to Example 3.11 tutorial
 * This page starts immediately in Paper Example mode
 */
export default function Example311Page() {
  return (
    <div className="min-h-screen bg-slate-900">
      <PentagonGame key="example-311" initialMode="paper-example" />
    </div>
  );
}
