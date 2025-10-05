'use client';

import { useParams, useRouter } from 'next/navigation';
import { campaignChapters } from '@/data/campaign-levels';
import CampaignLevelGame from '@/components/CampaignLevelGame';

export default function LevelPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.chapterId as string;
  const levelId = params.levelId as string;

  // Find the chapter and level
  const chapter = campaignChapters.find(c => c.id === chapterId);
  const level = chapter?.levels.find(l => l.id === levelId);

  if (!chapter || !level) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Level not found</h1>
          <button
            onClick={() => router.push('/campaign')}
            className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Back to Campaign
          </button>
        </div>
      </div>
    );
  }

  return (
    <CampaignLevelGame
      chapterId={chapterId}
      level={level}
      onBack={() => router.push(`/campaign/${chapterId}`)}
      onNext={() => {
        // Find next level
        const currentIndex = chapter.levels.findIndex(l => l.id === levelId);
        if (currentIndex < chapter.levels.length - 1) {
          const nextLevel = chapter.levels[currentIndex + 1];
          router.push(`/campaign/${chapterId}/${nextLevel.id}`);
        } else {
          // Go back to chapter selection if this was the last level
          router.push(`/campaign/${chapterId}`);
        }
      }}
    />
  );
}
