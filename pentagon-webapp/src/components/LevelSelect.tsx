'use client';

import { motion } from 'framer-motion';
import { campaignChapters } from '@/data/campaign-levels';
import { CampaignLevel } from '@/types/game';

interface LevelSelectProps {
  chapterId: string;
  onSelectLevel: (level: CampaignLevel) => void;
  onBack: () => void;
}

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

export default function LevelSelect({ chapterId, onSelectLevel, onBack }: LevelSelectProps) {
  const chapter = campaignChapters.find(c => c.id === chapterId);

  if (!chapter) {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Chapter not found</div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4"
    >
      <div className="max-w-4xl w-full">
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
          {chapter.levels.map((level, index) => (
            <motion.button
              key={level.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectLevel(level)}
              className="bg-slate-800/50 backdrop-blur border-2 border-purple-500/30 rounded-lg p-5 text-left hover:bg-slate-700/50 hover:border-purple-400/50 transition-colors group"
            >
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
                  <div className="flex items-center gap-3 text-xs">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                      {level.goalType === 'all-zeros' ? 'Reach Zero' : 'Nice Representative'}
                    </span>
                    {level.par && (
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded">
                        Par: {level.par}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="w-full bg-slate-800/50 backdrop-blur border-2 border-slate-600/50 rounded-lg px-6 py-3 text-white hover:bg-slate-700/50 hover:border-slate-500/50 transition-colors"
        >
          ← Back to Chapters
        </motion.button>
      </div>
    </motion.div>
  );
}
