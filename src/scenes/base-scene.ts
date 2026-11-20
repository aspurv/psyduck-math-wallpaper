import * as THREE from 'three';
import { WallpaperConfig } from '../config/properties';
import { AudioBands } from '../utils/audio';

/**
 * Interfaz base que deben implementar todas las escenas visuales del wallpaper.
 * Permite cambiar o extender escenas fácilmente respetando el principio de abierto/cerrado (OCP).
 */
export interface IScene {
  init(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera): void;
  update(delta: number, elapsed: number, config: WallpaperConfig, audio: AudioBands): void;
  onResize(width: number, height: number): void;
  onConfigChange(config: WallpaperConfig): void;
  destroy(): void;
}
