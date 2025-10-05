/**
 * Local Storage Management for Pentagon Game
 *
 * Handles all localStorage operations with type safety, versioning, and error handling.
 */

import {
  PlayerStats,
  CampaignProgress,
  PuzzleRecord,
  PuzzleAttempt,
  GameSettings,
  DailyChallenge,
  Achievement,
  AchievementId,
} from '@/types/game';

// Storage keys
const STORAGE_VERSION = 1;
const KEYS = {
  VERSION: 'pentagon:version',
  STATS: 'pentagon:stats',
  CAMPAIGN: 'pentagon:campaign',
  SETTINGS: 'pentagon:settings',
  DAILY: 'pentagon:daily',
  ACHIEVEMENTS: 'pentagon:achievements',
} as const;

// Default values
const DEFAULT_STATS: PlayerStats = {
  totalPuzzlesSolved: 0,
  totalStarsEarned: 0,
  totalMoves: 0,
  totalPlayTime: 0,
  averageMoves: 0,
  averageTime: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: new Date().toISOString().split('T')[0],
  hintsUsed: 0,
  solutionsViewed: 0,
  achievementsUnlocked: [],
};

const DEFAULT_CAMPAIGN: CampaignProgress = {
  unlockedPuzzles: ['puzzle-001'], // First puzzle unlocked by default
  completedPuzzles: [],
  puzzleRecords: {},
  currentPuzzle: 'puzzle-001',
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  theme: 'dark',
  showTutorial: true,
};

// Helper functions
function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    // Handle quota exceeded
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Consider clearing old data.');
    }
  }
}

// Initialize storage (check version, migrate if needed)
export function initStorage(): void {
  const version = safeGet(KEYS.VERSION, 0);

  if (version === 0) {
    // First time - initialize with defaults
    safeSet(KEYS.VERSION, STORAGE_VERSION);
    safeSet(KEYS.STATS, DEFAULT_STATS);
    safeSet(KEYS.CAMPAIGN, DEFAULT_CAMPAIGN);
    safeSet(KEYS.SETTINGS, DEFAULT_SETTINGS);
    console.log('Storage initialized');
  } else if (version < STORAGE_VERSION) {
    // Future: Handle migrations here
    console.log(`Migrating storage from v${version} to v${STORAGE_VERSION}`);
    safeSet(KEYS.VERSION, STORAGE_VERSION);
  }
}

// Player Stats
export function getPlayerStats(): PlayerStats {
  return safeGet(KEYS.STATS, DEFAULT_STATS);
}

export function setPlayerStats(stats: PlayerStats): void {
  safeSet(KEYS.STATS, stats);
}

export function updatePlayerStats(updates: Partial<PlayerStats>): void {
  const current = getPlayerStats();
  setPlayerStats({ ...current, ...updates });
}

// Campaign Progress
export function getCampaignProgress(): CampaignProgress {
  return safeGet(KEYS.CAMPAIGN, DEFAULT_CAMPAIGN);
}

export function setCampaignProgress(campaign: CampaignProgress): void {
  safeSet(KEYS.CAMPAIGN, campaign);
}

export function unlockPuzzle(puzzleId: string): void {
  const campaign = getCampaignProgress();
  if (!campaign.unlockedPuzzles.includes(puzzleId)) {
    campaign.unlockedPuzzles.push(puzzleId);
    setCampaignProgress(campaign);
  }
}

export function markPuzzleComplete(puzzleId: string): void {
  const campaign = getCampaignProgress();
  if (!campaign.completedPuzzles.includes(puzzleId)) {
    campaign.completedPuzzles.push(puzzleId);
    setCampaignProgress(campaign);
  }
}

export function getPuzzleRecord(puzzleId: string): PuzzleRecord | null {
  const campaign = getCampaignProgress();
  return campaign.puzzleRecords[puzzleId] || null;
}

export function updatePuzzleRecord(attempt: PuzzleAttempt): void {
  const campaign = getCampaignProgress();
  const existing = campaign.puzzleRecords[attempt.puzzleId];

  const newRecord: PuzzleRecord = {
    puzzleId: attempt.puzzleId,
    bestMoves: existing ? Math.min(existing.bestMoves, attempt.moves) : attempt.moves,
    bestTime: existing ? Math.min(existing.bestTime, attempt.time) : attempt.time,
    bestStars: (existing ? Math.max(existing.bestStars, attempt.stars) : attempt.stars) as 1 | 2 | 3,
    attempts: (existing?.attempts || 0) + 1,
    completions: (existing?.completions || 0) + (attempt.completed ? 1 : 0),
    firstCompletedAt: existing?.firstCompletedAt || (attempt.completed ? attempt.timestamp : undefined),
    lastCompletedAt: attempt.completed ? attempt.timestamp : existing?.lastCompletedAt,
  };

  campaign.puzzleRecords[attempt.puzzleId] = newRecord;
  setCampaignProgress(campaign);
}

// Settings
export function getSettings(): GameSettings {
  return safeGet(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function setSettings(settings: GameSettings): void {
  safeSet(KEYS.SETTINGS, settings);
}

export function updateSettings(updates: Partial<GameSettings>): void {
  const current = getSettings();
  setSettings({ ...current, ...updates });
}

// Daily Challenge
export function getDailyChallenge(): DailyChallenge | null {
  return safeGet<DailyChallenge | null>(KEYS.DAILY, null);
}

export function setDailyChallenge(daily: DailyChallenge): void {
  safeSet(KEYS.DAILY, daily);
}

// Achievements
export function getAchievements(): Achievement[] {
  return safeGet<Achievement[]>(KEYS.ACHIEVEMENTS, []);
}

export function setAchievements(achievements: Achievement[]): void {
  safeSet(KEYS.ACHIEVEMENTS, achievements);
}

export function unlockAchievement(id: AchievementId): void {
  const achievements = getAchievements();
  const achievement = achievements.find(a => a.id === id);

  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();
    setAchievements(achievements);

    // Also update player stats
    const stats = getPlayerStats();
    if (!stats.achievementsUnlocked.includes(id)) {
      stats.achievementsUnlocked.push(id);
      setPlayerStats(stats);
    }
  }
}

// Export/Import for backup
export function exportAllData(): string {
  const data = {
    version: STORAGE_VERSION,
    stats: getPlayerStats(),
    campaign: getCampaignProgress(),
    settings: getSettings(),
    daily: getDailyChallenge(),
    achievements: getAchievements(),
    exportedAt: Date.now(),
  };

  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    // Validate version (optional - could handle migrations here)
    if (data.version > STORAGE_VERSION) {
      console.error('Cannot import data from newer version');
      return false;
    }

    // Import all data
    if (data.stats) setPlayerStats(data.stats);
    if (data.campaign) setCampaignProgress(data.campaign);
    if (data.settings) setSettings(data.settings);
    if (data.daily) setDailyChallenge(data.daily);
    if (data.achievements) setAchievements(data.achievements);

    console.log('Data imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

// Clear all data (with confirmation in UI)
export function clearAllData(): void {
  Object.values(KEYS).forEach(key => {
    localStorage.removeItem(key);
  });

  // Reinitialize with defaults
  initStorage();
  console.log('All data cleared and reinitialized');
}

// Utility: Calculate star rating
export function calculateStars(moves: number, par: number): 1 | 2 | 3 {
  if (moves <= par) return 3;
  if (moves <= par + 3) return 2;
  return 1;
}

// Utility: Format time
export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Utility: Update streak
export function updateStreak(): void {
  const stats = getPlayerStats();
  const today = new Date().toISOString().split('T')[0];
  const lastPlayed = stats.lastPlayedDate;

  if (lastPlayed === today) {
    // Already played today, no change
    return;
  }

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (lastPlayed === yesterday) {
    // Consecutive day - increment streak
    stats.currentStreak += 1;
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
  } else {
    // Streak broken - reset to 1
    stats.currentStreak = 1;
  }

  stats.lastPlayedDate = today;
  setPlayerStats(stats);
}
