import { CampaignChapter } from '@/types/game';

/**
 * Campaign Mode: Understanding R₁₀
 *
 * Based on "Chip-Firing and the Sandpile Group of the R₁₀ Matroid" by McDonough & Ion
 * Each chapter teaches key concepts from the paper
 */

export const campaignChapters: CampaignChapter[] = [
  {
    id: 'ch1-basics',
    title: 'Chapter 1: Learning the Moves',
    description: 'Understand how moves A and B work on pentagon vertices',
    levels: [
      {
        id: '1-1',
        title: 'Meet Move A',
        description: 'Apply move A to return to zero. A adds 1+i to the vertex and -i to neighbors.',
        startState: [
          { real: -1, imag: -1 }, // V0: needs one A move
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
        ],
        goalType: 'all-zeros',
        par: 1,
      },
      {
        id: '1-2',
        title: 'Meet Move B',
        description: 'Apply move B to return to zero. B adds -1+i to the vertex and +1 to neighbors.',
        startState: [
          { real: 1, imag: -1 }, // V0: needs one B move
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
        ],
        goalType: 'all-zeros',
        par: 1,
      },
      {
        id: '1-3',
        title: 'Neighbors Matter',
        description: 'Moves affect the clicked vertex AND its two neighbors. V0 connects to V1 and V4.',
        startState: [
          { real: -1, imag: -1 }, // V0: click here with A
          { real: 0, imag: 1 },   // V1: will get -i from V0
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
          { real: 0, imag: 1 },   // V4: will get -i from V0
        ],
        goalType: 'all-zeros',
        par: 1,
      },
      {
        id: '1-4',
        title: 'Combining A and B',
        description: 'Use both moves to solve. Remember: right-click applies the negative move!',
        startState: [
          { real: 0, imag: 0 },
          { real: 0, imag: 1 },   // Needs -B (or D)
          { real: 0, imag: -1 },  // Needs B
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
        ],
        goalType: 'all-zeros',
        par: 2,
      },
    ],
  },
  {
    id: 'ch2-imaginary',
    title: 'Chapter 2: Eliminating Imaginary Chips',
    description: 'Lemma 3.1: Every equivalence class contains configurations with no imaginary chips',
    levels: [
      {
        id: '2-1',
        title: 'Pure Imaginary',
        description: 'Remove imaginary chips using moves B and -B. This demonstrates Lemma 3.1 from the paper.',
        startState: [
          { real: 0, imag: 2 },   // 2i -> use 2 B moves
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
        ],
        goalType: 'all-zeros',
        par: 2,
      },
      {
        id: '2-2',
        title: 'Mixed Numbers',
        description: 'Complex numbers can be split into real and imaginary parts. Handle each separately.',
        startState: [
          { real: 1, imag: 2 },   // 1+2i
          { real: 0, imag: -1 },  // -i
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
        ],
        goalType: 'all-zeros',
        par: 4,
      },
      {
        id: '2-3',
        title: 'All Imaginary',
        description: 'Every vertex has imaginary chips. You can always eliminate them!',
        startState: [
          { real: 0, imag: 1 },
          { real: 0, imag: -1 },
          { real: 0, imag: 1 },
          { real: 0, imag: -1 },
          { real: 0, imag: 1 },
        ],
        goalType: 'all-zeros',
        par: 5,
      },
    ],
  },
  {
    id: 'ch3-special-element',
    title: 'Chapter 3: The Special Element H',
    description: 'Lemma 3.3: There exists a unique element of order 2 in the sandpile group',
    levels: [
      {
        id: '3-1',
        title: 'One Chip Each',
        description: 'Config [1,1,1,1,1] is special - it equals H, the unique order-2 element. Double it to get [2,2,2,2,2].',
        startState: [
          { real: 1, imag: 0 },
          { real: 1, imag: 0 },
          { real: 1, imag: 0 },
          { real: 1, imag: 0 },
          { real: 1, imag: 0 },
        ],
        goalType: 'all-zeros',
        par: 10, // This one is interesting!
      },
      {
        id: '3-2',
        title: 'Three on One',
        description: 'Config [3,0,0,0,0] also equals H! Try reaching [6,0,0,0,0] (which equals 2H = 0).',
        startState: [
          { real: 3, imag: 0 },
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
          { real: 0, imag: 0 },
        ],
        goalType: 'all-zeros',
        par: 8,
      },
    ],
  },
  {
    id: 'ch4-representatives',
    title: 'Chapter 4: Finding Nice Representatives',
    description: 'Theorem 3.7: Reach a "nice" configuration with V0 having 0 or 3 chips, others having 0, 1, or 2',
    levels: [
      {
        id: '4-1',
        title: 'Remove Imaginary Parts',
        description: 'GOAL CHANGE: Reach a "nice representative" - V0 has {0 or 3}, others have {0, 1, or 2}. Start by removing imaginary parts.',
        startState: [
          { real: 4, imag: 2 },
          { real: -3, imag: 1 },
          { real: 5, imag: 0 },
          { real: 0, imag: 2 },
          { real: -1, imag: 0 },
        ],
        goalType: 'nice-representative',
        distinguishedVertex: 0,
        par: 15,
      },
      {
        id: '4-2',
        title: 'Reduce Mod 3',
        description: 'Get all non-V0 vertices to {0, 1, 2} by adding/subtracting 3 chips repeatedly.',
        startState: [
          { real: 7, imag: 0 },   // 7 mod 3 = 1, or set to 0/3
          { real: 5, imag: 0 },   // 5 mod 3 = 2
          { real: -4, imag: 0 },  // -4 mod 3 = 2
          { real: 3, imag: 0 },   // 3 mod 3 = 0
          { real: 1, imag: 0 },   // 1 mod 3 = 1
        ],
        goalType: 'nice-representative',
        distinguishedVertex: 0,
        par: 12,
      },
      {
        id: '4-3',
        title: 'The Full Algorithm',
        description: 'Apply the complete algorithm from Theorem 3.7: eliminate imaginary, reduce mod 3, check parity.',
        startState: [
          { real: -5, imag: 3 },
          { real: 4, imag: -2 },
          { real: 7, imag: 1 },
          { real: -3, imag: 0 },
          { real: 2, imag: -1 },
        ],
        goalType: 'nice-representative',
        distinguishedVertex: 0,
        par: 20,
      },
    ],
  },
  {
    id: 'ch5-exploration',
    title: 'Chapter 5: Exploring the 162',
    description: 'Advanced challenges - explore the 162 equivalence classes of the sandpile group',
    levels: [
      {
        id: '5-1',
        title: 'Representative Hunt 1',
        description: 'Each of the 162 "nice representatives" corresponds to a unique equivalence class. Find one!',
        startState: [
          { real: 8, imag: -4 },
          { real: -6, imag: 3 },
          { real: 12, imag: -2 },
          { real: -5, imag: 5 },
          { real: 3, imag: -7 },
        ],
        goalType: 'nice-representative',
        distinguishedVertex: 0,
        par: 25,
      },
      {
        id: '5-2',
        title: 'Representative Hunt 2',
        description: 'Another complex configuration to reduce. Can you find the pattern?',
        startState: [
          { real: -10, imag: 6 },
          { real: 15, imag: -8 },
          { real: -3, imag: 4 },
          { real: 7, imag: -3 },
          { real: -12, imag: 9 },
        ],
        goalType: 'nice-representative',
        distinguishedVertex: 0,
        par: 30,
      },
    ],
  },
];
