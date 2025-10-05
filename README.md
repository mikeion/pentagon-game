# Pentagon Complex Number Game

A puzzle game based on group theory and complex number operations. Players manipulate complex numbers on pentagon vertices to reach a goal state.

## Play

- Next.js version: [pentagon-game.vercel.app](https://pentagon-game.vercel.app/)
- HTML version: [mikeion.github.io/pentagon-game](https://mikeion.github.io/pentagon-game/)

## Mechanics

Each vertex of a pentagon holds a complex number (`a+bi`). Four move types transform these values:

- **Move A**: `1+i` to vertex, `-1` to adjacent vertices
- **Move B**: `-1+i` to vertex, `-i` to adjacent vertices
- **Move C**: `-1-i` to vertex, `1` to adjacent vertices (inverse of A)
- **Move D**: `1-i` to vertex, `i` to adjacent vertices (inverse of B)

**Controls:**
- Left-click: apply selected move
- Right-click/long-press: apply inverse move

## Mathematical Background

Based on Dr. Alex McDonough's research into group actions on complex number configurations (see `/docs`). The four moves generate a group with exactly 162 distinct orbital configurations. Each starting position can only reach 161 other states through these operations.

**Paper:** [arXiv link pending]

## Versions

**Next.js** (`pentagon-webapp/`): TypeScript, React, BFS solver, mobile-optimized

**HTML** (`index.html`): Pure p5.js, single file

## Development

**Next.js:**
```bash
cd pentagon-webapp
npm install
npm run dev  # localhost:3000
```

**HTML:**
```bash
python -m http.server 8000  # localhost:8000
```

## Project Structure

```
pentagon-game/
├── pentagon-webapp/          # Enhanced Next.js version
│   ├── src/components/       # React components
│   ├── src/utils/           # Solver and game logic
│   └── src/types/           # TypeScript definitions
├── testing/                 # Python prototype for verification
│   └── pentagon_game.py     # Mathematical testing
├── docs/                    # Original research
│   └── Pentagon complex firing game.pdf
└── index.html              # Simple HTML version
```

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features (puzzle campaign, achievements, daily challenges).

## License

MIT