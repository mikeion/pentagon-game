'use client';

import { useState, useEffect } from 'react';

export interface LevelProgress {
  completed: boolean;
  moves?: number;
  time?: number;
  stars?: number; // 1-3 stars based on performance
  bestMoves?: number;
  bestTime?: number;
}

export interface CampaignProgress {
  [chapterId: string]: {
    [levelId: string]: LevelProgress;
  };
}

const STORAGE_KEY = 'pentagon-campaign-progress';

export function useCampaignProgress() {
  const [progress, setProgress] = useState<CampaignProgress>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load campaign progress:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (error) {
        console.error('Failed to save campaign progress:', error);
      }
    }
  }, [progress, isLoaded]);

  const getLevelProgress = (chapterId: string, levelId: string): LevelProgress => {
    return progress[chapterId]?.[levelId] || { completed: false };
  };

  const updateLevelProgress = (
    chapterId: string,
    levelId: string,
    levelProgress: Partial<LevelProgress>
  ) => {
    setProgress(prev => {
      const chapter = prev[chapterId] || {};
      const current = chapter[levelId] || { completed: false };

      // Calculate stars (1-3 based on performance vs par)
      let stars = 1;
      if (levelProgress.moves !== undefined) {
        const par = levelProgress.moves; // This should come from level.par
        if (levelProgress.moves <= par) stars = 3;
        else if (levelProgress.moves <= par * 1.5) stars = 2;
      }

      const updated = {
        ...current,
        ...levelProgress,
        stars: levelProgress.stars !== undefined ? levelProgress.stars : stars,
        bestMoves: Math.min(current.bestMoves || Infinity, levelProgress.moves || Infinity),
        bestTime: Math.min(current.bestTime || Infinity, levelProgress.time || Infinity),
      };

      return {
        ...prev,
        [chapterId]: {
          ...chapter,
          [levelId]: updated,
        },
      };
    });
  };

  const getChapterProgress = (chapterId: string, totalLevels: number) => {
    const chapterData = progress[chapterId] || {};
    const completed = Object.values(chapterData).filter(l => l.completed).length;
    const totalStars = Object.values(chapterData).reduce((sum, l) => sum + (l.stars || 0), 0);

    return {
      completed,
      total: totalLevels,
      percentage: totalLevels > 0 ? Math.round((completed / totalLevels) * 100) : 0,
      stars: totalStars,
      maxStars: totalLevels * 3,
    };
  };

  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    progress,
    isLoaded,
    getLevelProgress,
    updateLevelProgress,
    getChapterProgress,
    resetProgress,
  };
}
