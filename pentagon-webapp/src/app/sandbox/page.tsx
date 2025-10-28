'use client';

import PentagonGame from '@/components/PentagonGame';

export default function SandboxPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <PentagonGame initialMode="free-play" key="sandbox" />
    </div>
  );
}
