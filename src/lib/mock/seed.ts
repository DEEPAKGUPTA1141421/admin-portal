// Deterministic pseudo-random generator so demo data is stable across reloads (no hydration mismatch).
let seed = 42;

export function rand(): number {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

export function resetSeed(n = 42) {
  seed = n;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export function pickMany<T>(arr: readonly T[], count: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < count && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

export function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function randFloat(min: number, max: number, decimals = 2): number {
  const v = rand() * (max - min) + min;
  return Number(v.toFixed(decimals));
}

export function randBool(probTrue = 0.5): boolean {
  return rand() < probTrue;
}

export function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function futureDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function makeId(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(5, "0")}`;
}
