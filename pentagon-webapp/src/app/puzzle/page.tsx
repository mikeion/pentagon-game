'use client';

import { useState } from 'react';
import PentagonGame from '@/components/PentagonGame';
import DifficultySelector from '@/components/DifficultySelector';

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export default function PuzzlePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  if (!selectedDifficulty) {
    return <DifficultySelector onSelectDifficulty={setSelectedDifficulty} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <PentagonGame initialMode="puzzle" initialDifficulty={selectedDifficulty} key={`puzzle-${selectedDifficulty}`} />
    </div>
  );
}
