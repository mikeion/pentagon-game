# Pentagon Game - Development Roadmap

This document tracks progress on transforming the Pentagon Complex Number Game into an engaging, replayable puzzle game with progression systems and social features.

## Legend
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Complete
- ⏸️  Blocked/On Hold

---

## Week 1: Core Game Loop (Days 1-7)

### Day 1-2: Enhanced Completion Screen 🔴
**Goal:** Make winning feel rewarding and encourage replaying

- [ ] 🔴 Add star rating calculation (3★ = par or better, 2★ = par+3, 1★ = solved)
- [ ] 🔴 Show detailed stats (time, moves, hints used, solution viewed)
- [ ] 🔴 Add "Next Puzzle" button (loads next in campaign)
- [ ] 🔴 Add "Retry for 3 Stars" button
- [ ] 🔴 Victory animations (confetti, screen shake, haptics)
- [ ] 🔴 Share button (copy stats to clipboard)

**Files:**
- `src/components/CompletionScreen.tsx` (NEW)
- `src/components/PentagonGame.tsx` (MODIFY)

---

### Day 3-4: Puzzle Bank & Campaign System 🔴
**Goal:** Give players a sense of progression

- [ ] 🔴 Generate 50 curated puzzles with varying difficulty
- [ ] 🔴 Create puzzle metadata (id, name, difficulty, par moves, category)
- [ ] 🔴 Implement linear progression (unlock next after solving)
- [ ] 🔴 Add localStorage to save progress
- [ ] 🔴 Campaign selection screen showing locked/unlocked puzzles
- [ ] 🔴 Show progress: "15/50 puzzles completed, 38/150 stars"

**Files:**
- `src/utils/puzzleBank.ts` (NEW)
- `src/utils/storage.ts` (NEW)
- `src/types/game.ts` (MODIFY - add Puzzle type)
- `src/components/CampaignScreen.tsx` (NEW)

---

### Day 5-6: Personal Best Tracking 🔴
**Goal:** Encourage self-improvement and replayability

- [ ] 🔴 Track best moves, best time, best stars per puzzle
- [ ] 🔴 Show "Your Best" on puzzle start screen
- [ ] 🔴 Add "Beat Your Record!" messaging when retrying
- [ ] 🔴 Simple stats dashboard (total solved, total stars, avg time)
- [ ] 🔴 Personal records screen showing all bests

**Files:**
- `src/utils/storage.ts` (MODIFY)
- `src/components/StatsScreen.tsx` (NEW)
- `src/types/game.ts` (MODIFY - add PlayerStats type)

---

### Day 7: Share Feature 🔴
**Goal:** Viral growth through social sharing

- [ ] 🔴 Generate shareable text with stats
- [ ] 🔴 Web Share API for mobile (native share sheet)
- [ ] 🔴 Copy to clipboard fallback for desktop
- [ ] 🔴 Format: "🎯 Solved Pentagon Puzzle #23 in 14 moves! ⭐⭐⭐ Can you beat me?"
- [ ] 🔴 Include link to puzzle

**Files:**
- `src/components/CompletionScreen.tsx` (MODIFY)
- `src/utils/share.ts` (NEW)

---

## Week 2: Daily Engagement (Days 8-14)

### Day 8-9: Daily Challenge 🔴
**Goal:** Give players a reason to return daily

- [ ] 🔴 Seed-based puzzle generation from date
- [ ] 🔴 "Daily Challenge" mode separate from campaign
- [ ] 🔴 Track daily challenge completion streak
- [ ] 🔴 Daily challenge route (`/daily`)
- [ ] 🔴 Show "Today's Challenge" on main menu
- [ ] 🔴 Timer showing time until next daily puzzle

**Files:**
- `src/utils/dailyChallenge.ts` (NEW)
- `src/app/daily/page.tsx` (NEW)

---

### Day 10-11: Streak Counter 🔴
**Goal:** Build habit formation

- [ ] 🔴 Track consecutive days played
- [ ] 🔴 Show streak prominently on main menu
- [ ] 🔴 "Don't break the streak!" reminders
- [ ] 🔴 Streak milestones (7 days, 30 days, 100 days)
- [ ] 🔴 Streak recovery (grace period if missed by 1 day)

**Files:**
- `src/utils/storage.ts` (MODIFY)
- `src/components/StreakDisplay.tsx` (NEW)

---

### Day 12-14: Achievement System 🔴
**Goal:** Add long-term goals and milestones

#### Achievement Definitions:
- [ ] 🔴 "First Steps" - Complete first puzzle
- [ ] 🔴 "⭐ Perfectionist" - Get 3 stars on 10 puzzles
- [ ] 🔴 "⭐⭐ Star Collector" - Earn 50 total stars
- [ ] 🔴 "⭐⭐⭐ Constellation" - Earn all 150 stars
- [ ] 🔴 "🔥 Hot Streak" - Solve 5 puzzles in a row with 3 stars each
- [ ] 🔴 "🧠 Einstein" - Solve hard puzzle without hints
- [ ] 🔴 "⚡ Speed Demon" - Solve any puzzle under 30 seconds
- [ ] 🔴 "🎯 Sharpshooter" - Solve puzzle in exactly par moves
- [ ] 🔴 "📚 Mathematician" - Complete all campaign puzzles
- [ ] 🔴 "🌙 Night Owl" - Solve puzzle after midnight
- [ ] 🔴 "☀️ Early Bird" - Solve puzzle before 6am
- [ ] 🔴 "💯 Century" - Solve 100 puzzles total
- [ ] 🔴 "🎓 Group Theory Master" - Complete all educational content
- [ ] 🔴 "🤝 Challenger" - Share 10 puzzle results
- [ ] 🔴 "📅 Dedicated" - Maintain 30-day streak

**Files:**
- `src/utils/achievements.ts` (NEW)
- `src/components/AchievementToast.tsx` (NEW)
- `src/components/AchievementGallery.tsx` (NEW)

---

## Week 3: Polish & Settings (Days 15-21)

### Day 15-16: Onboarding Tutorial 🔴
**Goal:** Reduce drop-off for new players

- [ ] 🔴 3-step interactive tutorial (how moves work, goal, right-click)
- [ ] 🔴 "Skip tutorial" option
- [ ] 🔴 First-time user detection
- [ ] 🔴 Tutorial completion tracking

**Files:**
- `src/components/Tutorial.tsx` (NEW)
- `src/utils/storage.ts` (MODIFY)

---

### Day 17-18: Settings & Persistence 🔴
**Goal:** Customization and data portability

- [ ] 🔴 Settings screen (sound on/off, haptics on/off, theme)
- [ ] 🔴 Save settings to localStorage
- [ ] 🔴 Import/export progress feature (backup/restore)
- [ ] 🔴 Reset progress option (with confirmation)
- [ ] 🔴 About/credits screen

**Files:**
- `src/components/SettingsScreen.tsx` (NEW)
- `src/utils/storage.ts` (MODIFY)

---

### Day 19-21: Juice & Polish 🔴
**Goal:** Make every interaction feel good

- [ ] 🔴 Sound effects (button clicks, move applied, puzzle solved)
- [ ] 🔴 Haptic feedback on mobile (light tap, success vibration)
- [ ] 🔴 Smooth transitions everywhere (page changes, modal opens)
- [ ] 🔴 Victory animations/particles (confetti library)
- [ ] 🔴 Loading states for async operations
- [ ] 🔴 Error handling UI

**Files:**
- `src/utils/sounds.ts` (NEW)
- `src/utils/haptics.ts` (NEW)
- `public/sounds/` (NEW - sound effect files)

---

## Week 4: Advanced Features (Days 22-28)

### Day 22-24: Leaderboard Foundation 🔴
**Goal:** Prepare for future backend integration

- [ ] 🔴 Local leaderboard per puzzle (best moves, best time)
- [ ] 🔴 Global stats tracking structure (prepare for backend)
- [ ] 🔴 Leaderboard UI component
- [ ] 🔴 "Compare with friends" placeholder

**Files:**
- `src/components/Leaderboard.tsx` (NEW)
- `src/utils/leaderboard.ts` (NEW)

---

### Day 25-26: Visual Improvements 🔴
**Goal:** Make the game more visually appealing

- [ ] 🔴 Better color scheme/theming
- [ ] 🔴 Glassmorphism effects for overlays
- [ ] 🔴 Smoother animations (framer-motion integration?)
- [ ] 🔴 Improved typography (better fonts, sizing)
- [ ] 🔴 Visual feedback for move application

**Files:**
- `src/app/globals.css` (MODIFY)
- Various components (MODIFY)

---

### Day 27-28: Testing & Bug Fixes 🔴
**Goal:** Ship quality product

- [ ] 🔴 Test all features on mobile (iOS Safari, Android Chrome)
- [ ] 🔴 Fix any localStorage issues (quota, corruption)
- [ ] 🔴 Performance optimization (reduce re-renders)
- [ ] 🔴 Cross-browser testing
- [ ] 🔴 Accessibility audit (keyboard navigation, screen readers)
- [ ] 🔴 Final polish pass

---

## Future Enhancements (Post-Launch)

### Phase 2: Backend Integration ⏸️
- [ ] User accounts (auth)
- [ ] Cloud save sync
- [ ] Global leaderboards
- [ ] Friend system
- [ ] Multiplayer challenges

### Phase 3: Content Expansion ⏸️
- [ ] Puzzle creator/editor
- [ ] User-generated puzzles
- [ ] Weekly tournaments
- [ ] Seasonal events
- [ ] Puzzle packs (themed collections)

### Phase 4: Monetization (Optional) ⏸️
- [ ] Hint pack purchases
- [ ] Remove ads option
- [ ] Premium themes
- [ ] Support the developer

---

## Notes & Decisions

### Storage Strategy
- Use `localStorage` for all client-side data
- Namespace keys: `pentagon:progress`, `pentagon:stats`, `pentagon:settings`
- Implement versioning for data migration
- Add export/import for backup

### Puzzle Generation Strategy
- Pre-generate 50 puzzles for campaign (ensures quality)
- Use deterministic seeded generation for daily challenges
- Store puzzle metadata only, generate state on demand

### Star Rating Formula
```typescript
function calculateStars(moves: number, par: number): 1 | 2 | 3 {
  if (moves <= par) return 3;
  if (moves <= par + 3) return 2;
  return 1;
}
```

### Share Format
```
🎯 Pentagon Puzzle #23
⭐⭐⭐ 14 moves in 1:23
Can you beat me?
[link]
```

---

## Progress Summary

**Week 1:** 0/7 tasks complete
**Week 2:** 0/4 tasks complete
**Week 3:** 0/3 tasks complete
**Week 4:** 0/3 tasks complete

**Overall:** 0/17 major features complete

Last updated: 2025-10-05
