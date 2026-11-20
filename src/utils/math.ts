/**
 * Utilidades matemáticas y de interpolación para animaciones fluidas a 60/120fps.
 */

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convierte un color de Wallpaper Engine ("0.2 0.5 0.9" o hex) a formato CSS/Hex para Three.js.
 */
export function parseWallpaperColor(val: string): string {
  if (!val) return '#38bdf8';
  if (val.startsWith('#')) return val;

  const parts = val.trim().split(/\s+/).map(Number);
  if (parts.length >= 3) {
    const r = Math.round(clamp(parts[0], 0, 1) * 255);
    const g = Math.round(clamp(parts[1], 0, 1) * 255);
    const b = Math.round(clamp(parts[2], 0, 1) * 255);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  return val;
}
