# Pentagon Complex Number Game

An interactive mathematical puzzle game where players manipulate complex numbers on pentagon vertices to reach goal configurations.

## 🎮 Play Online

**[Play the game here!](https://mikeion.github.io/pentagon-game/)**

## How It Works

The game features a pentagon where each vertex contains a complex number (in the form `a+bi`). Players can apply one of four different "moves" to transform these numbers and try to match a target configuration.

### The Four Move Types

Each move affects the clicked vertex and its two adjacent neighbors:

- **Move A**: Adds `1+i` to clicked vertex, adds `-1-i` to neighbors
- **Move B**: Adds `-1+i` to clicked vertex, adds `-i` to neighbors  
- **Move C**: Adds `1-i` to clicked vertex, adds `1` to neighbors
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

## Technical Details

- **Frontend**: HTML5 Canvas with p5.js for graphics
- **Mobile-friendly**: Touch controls with long-press support
- **No backend required**: Pure client-side JavaScript
- **Python prototype**: Mathematical verification in `pentagon_game.py`

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/mikeion/pentagon-game.git
cd pentagon-game
```

2. Start a local server:
```bash
python -m http.server 8000
```

3. Open http://localhost:8000 in your browser

## Files

- `index.html` - Main game file (self-contained)
- `pentagon_game.py` - Python prototype for mathematical verification
- `docs/Pentagon complex firing game.pdf` - Dr. Alex McDonough's original game design document

## Contributing

This is a research-based mathematical game. Contributions welcome for:
- Orbit detection algorithms
- Move history/undo functionality  
- Difficulty levels
- Visual improvements
- Mathematical analysis tools

## License

MIT License - feel free to use for educational or research purposes.