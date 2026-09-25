/**
 * Seeded PRNG implementation using Mulberry32 and MurmurHash3 string hashing.
 * Deterministic for the same seed string.
 */

export class SeededRNG {
  private s: number;

  constructor(seedStr?: string) {
    this.s = SeededRNG.hashString(seedStr || SeededRNG.generateRandomSeed());
  }

  static generateRandomSeed(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  private static hashString(str: string): number {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }

  // Returns float in [0, 1)
  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns integer in [min, max] inclusive
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Pick random element from array
  choice<T>(arr: T[]): T {
    const idx = Math.floor(this.next() * arr.length);
    return arr[idx];
  }

  // Shuffle array copy
  shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Returns true with given probability [0, 1]
  chance(prob: number): boolean {
    return this.next() < prob;
  }
}
