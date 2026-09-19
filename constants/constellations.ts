export interface ConstellationDefinition {
  id: string;
  name: string;
  stars: { x: number; y: number }[];
  lines: [number, number][];
  colors: string[];
}

export const CONSTELLATIONS: ConstellationDefinition[] = [
  {
    id: 'orion',
    name: 'Orión',
    stars: [{ x: 0.5, y: 0.15 }, { x: 0.65, y: 0.28 }, { x: 0.55, y: 0.42 }, { x: 0.5, y: 0.45 }, { x: 0.45, y: 0.42 }, { x: 0.35, y: 0.28 }, { x: 0.5, y: 0.72 }],
    lines: [[0, 1], [0, 5], [1, 2], [5, 4], [2, 3], [3, 4], [2, 6], [4, 6]],
    colors: ['#050510', '#0a0520', '#080318', '#050510'],
  },
  {
    id: 'osa-mayor',
    name: 'Osa Mayor',
    stars: [{ x: 0.2, y: 0.55 }, { x: 0.32, y: 0.48 }, { x: 0.44, y: 0.44 }, { x: 0.54, y: 0.5 }, { x: 0.62, y: 0.35 }, { x: 0.72, y: 0.25 }, { x: 0.8, y: 0.18 }],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    colors: ['#020810', '#050f1a', '#030c18', '#020810'],
  },
  {
    id: 'casiopea',
    name: 'Casiopea',
    stars: [{ x: 0.18, y: 0.5 }, { x: 0.32, y: 0.3 }, { x: 0.5, y: 0.45 }, { x: 0.68, y: 0.3 }, { x: 0.82, y: 0.5 }],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
    colors: ['#100510', '#1a0820', '#120618', '#100510'],
  },
  {
    id: 'cruz-del-sur',
    name: 'Cruz del Sur',
    stars: [{ x: 0.5, y: 0.15 }, { x: 0.5, y: 0.85 }, { x: 0.2, y: 0.5 }, { x: 0.8, y: 0.5 }, { x: 0.38, y: 0.72 }],
    lines: [[0, 1], [2, 3], [0, 4]],
    colors: ['#021008', '#030f08', '#021008', '#010805'],
  },
  {
    id: 'escorpio',
    name: 'Escorpio',
    stars: [{ x: 0.5, y: 0.15 }, { x: 0.55, y: 0.25 }, { x: 0.52, y: 0.35 }, { x: 0.45, y: 0.45 }, { x: 0.4, y: 0.55 }, { x: 0.45, y: 0.65 }, { x: 0.55, y: 0.72 }],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    colors: ['#100a02', '#1a1002', '#120c02', '#100a02'],
  },
];

export const MAX_SMALL_STARS = 500;
