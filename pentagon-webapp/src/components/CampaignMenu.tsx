'use client';

import { motion } from 'framer-motion';
import { campaignChapters } from '@/data/campaign-levels';

interface CampaignMenuProps {
  onSelectChapter: (chapterId: string) => void;
  onBack: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
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

export default function CampaignMenu({ onSelectChapter, onBack }: CampaignMenuProps) {
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
          className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mb-4 text-center"
        >
          Campaign Mode
        </motion.h1>
        <motion.p
          variants={headerVariants}
          className="text-slate-300 text-center mb-8 max-w-2xl mx-auto"
        >
          Learn chip-firing step by step through carefully designed puzzles based on mathematical research.
        </motion.p>

        <motion.div
          variants={containerVariants}
          className="space-y-4 mb-8"
        >
          {campaignChapters.map((chapter, index) => (
            <motion.button
              key={chapter.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectChapter(chapter.id)}
              className="w-full bg-slate-800/50 backdrop-blur border-2 border-purple-500/30 rounded-lg p-6 text-left hover:bg-slate-700/50 hover:border-purple-400/50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {chapter.title}
                  </h2>
                  <p className="text-slate-400 text-sm mb-3">
                    {chapter.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>{chapter.levels.length} levels</span>
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
          ← Back to Main Menu
        </motion.button>
      </div>
    </motion.div>
  );
}
