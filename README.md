# Pentagon Chip Firing Game

Web app for exploring chip-firing on the R₁₀ matroid using Gaussian integers.

**Play:** [pentagon-game.github.io](https://pentagon-game.github.io/)

## About

This game implements chip-firing on a pentagon graph where each vertex holds a Gaussian integer (a complex number a+bi with integer coefficients). You can fire vertices using four different moves (A, B, -A, -B) to explore the 162 equivalence classes of this system.

Based on research by Alex McDonough and Mike Ion.

**Paper:** [arXiv link - coming soon]

## How to Play

- Click a vertex to fire using the current move (A or B)
- Right-click (or long-press on mobile) to fire the negative move (-A or -B)
- Try puzzle mode to solve configurations
- Check out the Example 3.11 tutorial for a walkthrough

## Development

```bash
cd pentagon-webapp
npm install
npm run dev
```

Built with Next.js, React, and TypeScript.

## License

MIT
