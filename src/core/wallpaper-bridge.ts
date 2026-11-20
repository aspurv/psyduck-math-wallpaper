import { WallpaperConfig, defaultConfig } from '../config/properties';
import { parseWallpaperColor } from '../utils/math';
import { AudioProcessor } from '../utils/audio';

declare global {
  interface Window {
    wallpaperPropertyListener?: {
      applyUserProperties?: (properties: Record<string, { value: any }>) => void;
      applyGeneralProperties?: (properties: Record<string, { value: any }>) => void;
      setPaused?: (isPaused: boolean) => void;
    };
    wallpaperRegisterAudioListener?: (callback: (audioArray: number[]) => void) => void;
  }
}

export type PropertyChangeCallback = (config: WallpaperConfig) => void;
export type PauseCallback = (paused: boolean) => void;

export class WallpaperBridge {
  private config: WallpaperConfig = { ...defaultConfig };
  private onPropertyChangeListeners: PropertyChangeCallback[] = [];
  private onPauseListeners: PauseCallback[] = [];
  public readonly audio: AudioProcessor = new AudioProcessor();

  constructor() {
    this.setupListeners();
  }

  public getConfig(): WallpaperConfig {
    return { ...this.config };
  }

  public onPropertyChange(callback: PropertyChangeCallback): void {
    this.onPropertyChangeListeners.push(callback);
    callback(this.config);
  }

  public onPause(callback: PauseCallback): void {
    this.onPauseListeners.push(callback);
  }

  private notifyProperties(): void {
    for (const listener of this.onPropertyChangeListeners) {
      listener(this.config);
    }
  }

  private setupListeners(): void {
    // Interfaz nativa de Wallpaper Engine
    window.wallpaperPropertyListener = {
      applyUserProperties: (properties) => {
        if (!properties) return;

        if (properties.schemecolor && properties.schemecolor.value !== undefined) {
          this.config.accentColor = parseWallpaperColor(String(properties.schemecolor.value));
        }
        if (properties.backgroundcolor && properties.backgroundcolor.value !== undefined) {
          this.config.backgroundColor = parseWallpaperColor(String(properties.backgroundcolor.value));
        }
        if (properties.headacheintensity && properties.headacheintensity.value !== undefined) {
          this.config.headacheIntensity = parseFloat(properties.headacheintensity.value);
        }
        if (properties.parallaxstrength && properties.parallaxstrength.value !== undefined) {
          this.config.parallaxStrength = parseFloat(properties.parallaxstrength.value);
        }
        if (properties.mathparticles && properties.mathparticles.value !== undefined) {
          this.config.mathParticles = Boolean(properties.mathparticles.value);
        }
        if (properties.particlecount && properties.particlecount.value !== undefined) {
          this.config.particleCount = parseInt(properties.particlecount.value, 10);
        }
        if (properties.audioeffect && properties.audioeffect.value !== undefined) {
          this.config.audioEffect = Boolean(properties.audioeffect.value);
        }
        if (properties.audiointensity && properties.audiointensity.value !== undefined) {
          this.config.audioIntensity = parseFloat(properties.audiointensity.value);
        }

        this.notifyProperties();
      },

      setPaused: (isPaused) => {
        for (const listener of this.onPauseListeners) {
          listener(isPaused);
        }
      }
    };

    // Registro de espectro de audio de Wallpaper Engine
    if (window.wallpaperRegisterAudioListener) {
      window.wallpaperRegisterAudioListener((audioArray) => {
        if (this.config.audioEffect) {
          this.audio.process(audioArray);
        }
      });
    }
  }
}
