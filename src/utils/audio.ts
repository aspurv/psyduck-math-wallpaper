import { lerp } from './math';

export interface AudioBands {
  bass: number;
  mid: number;
  treble: number;
  overall: number;
}

export class AudioProcessor {
  public current: AudioBands = { bass: 0, mid: 0, treble: 0, overall: 0 };
  private smoothed: AudioBands = { bass: 0, mid: 0, treble: 0, overall: 0 };
  private readonly smoothFactor: number = 0.25;

  /**
   * Procesa el espectro de 128 frecuencias emitido por Wallpaper Engine
   * (0-63 canal izquierdo, 64-127 canal derecho)
   */
  public process(frequencies: number[]): void {
    if (!frequencies || frequencies.length < 128) return;

    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;
    let totalSum = 0;

    // Procesar promedio de canales Izquierdo + Derecho
    for (let i = 0; i < 64; i++) {
      const val = (frequencies[i] + frequencies[i + 64]) * 0.5;
      totalSum += val;

      if (i < 6) {
        bassSum += val;
      } else if (i < 24) {
        midSum += val;
      } else {
        trebleSum += val;
      }
    }

    const rawBass = bassSum / 6;
    const rawMid = midSum / 18;
    const rawTreble = trebleSum / 40;
    const rawOverall = totalSum / 64;

    // Interpolación suave para evitar sacudidas bruscas en los gráficos
    this.smoothed.bass = lerp(this.smoothed.bass, rawBass, this.smoothFactor);
    this.smoothed.mid = lerp(this.smoothed.mid, rawMid, this.smoothFactor);
    this.smoothed.treble = lerp(this.smoothed.treble, rawTreble, this.smoothFactor);
    this.smoothed.overall = lerp(this.smoothed.overall, rawOverall, this.smoothFactor);

    this.current.bass = this.smoothed.bass;
    this.current.mid = this.smoothed.mid;
    this.current.treble = this.smoothed.treble;
    this.current.overall = this.smoothed.overall;
  }

  public reset(): void {
    this.current = { bass: 0, mid: 0, treble: 0, overall: 0 };
    this.smoothed = { bass: 0, mid: 0, treble: 0, overall: 0 };
  }
}
