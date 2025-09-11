# Pentagon Complex Number Game

An interactive mathematical puzzle game where players manipulate complex numbers on pentagon vertices to reach goal configurations.

## 🎮 Play Online

**[Play the enhanced version here!](https://pentagon-game.vercel.app/)**

> A simple HTML version is also available at [GitHub Pages](https://mikeion.github.io/pentagon-game/)

## How It Works

The game features a pentagon where each vertex contains a complex number (in the form `a+bi`). Players can apply one of four different "moves" to transform these numbers and try to match a target configuration.

### The Four Move Types

Each move affects the clicked vertex and its two adjacent neighbors:

- **Move A**: Adds `1+i` to clicked vertex, adds `-1` to neighbors
- **Move B**: Adds `-1+i` to clicked vertex, adds `-i` to neighbors  
- **Move C**: Adds `-1-i` to clicked vertex, adds `1` to neighbors
- **Move D**: Adds `1-i` to clicked vertex, adds `i` to neighbors

### Controls

- **Left-click** a vertex to apply the selected move (add)
- **Right-click** or **long-press** a vertex to subtract the move
- **Select move types** A, B, C, or D using the buttons
- Click **"Show Guide"** for detailed instructions

### Mathematical Background

This game is based on Dr. Alex McDonough's research (see `/docs`) into group theory and complex number operations. The four moves generate a group action on the space of complex number configurations on a pentagon. Remarkably, there are exactly **162 unique orbital configurations** possible - meaning only 162 distinct states can be reached from any starting position through these moves.

Key insights:
- Move A and Move C are inverses (they cancel each other)
- Move B and Move D are inverses (they cancel each other)
- Each vertex is connected to its two adjacent neighbors in the pentagon

## Versions

### Enhanced Version (Recommended)
- **Framework**: Next.js with TypeScript and React
- **Solver**: Built-in BFS algorithm to find optimal solutions
- **UI**: Modern design with Tailwind CSS
- **Features**: Hint system, goal generation, responsive design
- **Deployment**: Vercel ([pentagon-game.vercel.app](https://pentagon-game.vercel.app/))

### Simple Version
- **Framework**: Pure HTML5 with p5.js
- **Features**: Core game mechanics only
- **Deployment**: GitHub Pages ([mikeion.github.io/pentagon-game](https://mikeion.github.io/pentagon-game/))

## Local Development

### Enhanced Version (Next.js)
1. Clone and navigate:
```bash
git clone https://github.com/mikeion/pentagon-game.git
cd pentagon-game/pentagon-webapp
```

2. Install dependencies and run:
```bash
npm install
npm run dev
```

3. Open http://localhost:3000

### Simple Version (HTML)
1. Clone the repository:
```bash
git clone https://github.com/mikeion/pentagon-game.git
cd pentagon-game
```

2. Start a local server:
```bash
python -m http.server 8000
```

3. Open http://localhost:8000

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

## Future Development

Planned enhancements for the Next.js version:
- **Advanced Solver**: More sophisticated algorithms for complex puzzles
- **Move History**: Undo/redo functionality with move tracking
- **Puzzle Library**: Curated collection of interesting configurations
- **Educational Mode**: Step-by-step tutorials explaining group theory
- **Performance**: Optimize solver for deeper searches
- **Analytics**: Track solving patterns and difficulty metrics

## Contributing

This is a research-based mathematical game. Contributions welcome for:
- Solver algorithm improvements
- UI/UX enhancements
- Educational content
- Mathematical analysis
- Performance optimizations

Please submit PRs to the `main` branch. The enhanced version lives in `pentagon-webapp/`.

## License

MIT License - feel free to use for educational or research purposes.