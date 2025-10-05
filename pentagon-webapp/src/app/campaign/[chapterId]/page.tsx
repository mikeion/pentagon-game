'use client';

import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { campaignChapters } from '@/data/campaign-levels';
import { useCampaignProgress } from '@/hooks/useCampaignProgress';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

export default function ChapterPage() {
  const router = useRouter();
  const params = useParams();
  const chapterId = params.chapterId as string;
  const { getLevelProgress, isLoaded } = useCampaignProgress();

  const chapter = campaignChapters.find(c => c.id === chapterId);

  if (!chapter) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Chapter not found</h1>
          <button
            onClick={() => router.push('/campaign')}
            className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Back to Chapters
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.h1
          variants={headerVariants}
          className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mb-2 text-center"
        >
          {chapter.title}
        </motion.h1>
        <motion.p
          variants={headerVariants}
          className="text-slate-300 text-center mb-8 max-w-2xl mx-auto"
        >
          {chapter.description}
        </motion.p>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {chapter.levels.map((level, index) => {
            const progress = isLoaded ? getLevelProgress(chapterId, level.id) : null;
            const isLocked = false; // TODO: Implement level unlocking logic

            return (
              <motion.button
                key={level.id}
                variants={itemVariants}
                whileHover={!isLocked ? { scale: 1.03, y: -2 } : {}}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                onClick={() => !isLocked && router.push(`/campaign/${chapterId}/${level.id}`)}
                disabled={isLocked}
                className={`bg-slate-800/50 backdrop-blur border-2 rounded-lg p-5 text-left transition-colors group relative ${
                  isLocked
                    ? 'border-slate-600/30 opacity-50 cursor-not-allowed'
                    : 'border-purple-500/30 hover:bg-slate-700/50 hover:border-purple-400/50'
                }`}
              >
                {/* Completion badge */}
                {progress?.completed && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                )}

                {/* Lock icon for locked levels */}
                {isLocked && (
                  <div className="absolute top-3 right-3">
                    <Lock className="w-6 h-6 text-slate-500" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {level.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3">
                      {level.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                        {level.goalType === 'all-zeros' ? 'Reach Zero' : 'Nice Representative'}
                      </span>
                      {level.par && (
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded">
                          Par: {level.par}
                        </span>
                      )}
                      {progress?.stars && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
                          {'⭐'.repeat(progress.stars)}
                        </span>
                      )}
                      {progress?.bestMoves && progress.bestMoves < Infinity && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">
                          Best: {progress.bestMoves} moves
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/campaign')}
          className="w-full bg-slate-800/50 backdrop-blur border-2 border-slate-600/50 rounded-lg px-6 py-3 text-white hover:bg-slate-700/50 hover:border-slate-500/50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Chapters
        </motion.button>
      </div>
    </motion.div>
  );
}
