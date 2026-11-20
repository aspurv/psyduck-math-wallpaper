import * as THREE from 'three';
import { IScene } from './base-scene';
import { WallpaperConfig } from '../config/properties';
import { AudioBands } from '../utils/audio';

export class ParticleScene implements IScene {
  private scene!: THREE.Scene;
  private particles?: THREE.Points;
  private geometry?: THREE.BufferGeometry;
  private material?: THREE.PointsMaterial;
  private currentCount: number = 0;

  // Interacción suave de mouse / parallax
  private mouseX: number = 0;
  private mouseY: number = 0;
  private targetMouseX: number = 0;
  private targetMouseY: number = 0;

  private originalPositions: Float32Array = new Float32Array(0);

  public init(_renderer: THREE.WebGLRenderer, scene: THREE.Scene, _camera: THREE.PerspectiveCamera): void {
    this.scene = scene;

    this.setupMouseEvents();
  }

  public onConfigChange(config: WallpaperConfig): void {
    if (this.currentCount !== config.particleCount || !this.particles) {
      this.rebuildParticles(config);
    }

    if (this.material) {
      this.material.color.set(config.accentColor);
    }
  }

  public update(_delta: number, elapsed: number, config: WallpaperConfig, audio: AudioBands): void {
    if (!this.particles || !this.geometry) return;

    // Suavizado de mouse parallax
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    this.particles.rotation.y = elapsed * 0.05 * config.animationSpeed + this.mouseX * 0.2;
    this.particles.rotation.x = elapsed * 0.02 * config.animationSpeed + this.mouseY * 0.2;

    const positions = this.geometry.attributes.position.array as Float32Array;
    const audioBoost = config.audioEffect ? audio.bass * config.audioIntensity * 1.8 : 0;

    for (let i = 0; i < this.currentCount; i++) {
      const idx = i * 3;
      const origX = this.originalPositions[idx];
      const origY = this.originalPositions[idx + 1];
      const origZ = this.originalPositions[idx + 2];

      const wave = Math.sin(elapsed * config.animationSpeed + origX * 0.1) * 0.5;
      const audioDisplacement = 1 + audioBoost;

      positions[idx] = origX * audioDisplacement;
      positions[idx + 1] = (origY + wave) * audioDisplacement;
      positions[idx + 2] = origZ * audioDisplacement;
    }

    this.geometry.attributes.position.needsUpdate = true;

    // Efecto de escala en el tamaño de partícula según agudos
    if (this.material) {
      const trebleBoost = config.audioEffect ? audio.treble * config.audioIntensity * 2.0 : 0;
      this.material.size = 2.5 + trebleBoost;
    }
  }

  public onResize(_width: number, _height: number): void {
    // La cámara principal se recalibra en el Core Engine
  }

  public destroy(): void {
    if (this.particles) {
      this.scene.remove(this.particles);
      this.geometry?.dispose();
      this.material?.dispose();
    }
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  private rebuildParticles(config: WallpaperConfig): void {
    if (this.particles) {
      this.scene.remove(this.particles);
      this.geometry?.dispose();
      this.material?.dispose();
    }

    this.currentCount = config.particleCount;
    const positions = new Float32Array(this.currentCount * 3);
    this.originalPositions = new Float32Array(this.currentCount * 3);

    const radius = 35;
    for (let i = 0; i < this.currentCount; i++) {
      const idx = i * 3;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * radius;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;

      this.originalPositions[idx] = x;
      this.originalPositions[idx + 1] = y;
      this.originalPositions[idx + 2] = z;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.material = new THREE.PointsMaterial({
      color: new THREE.Color(config.accentColor),
      size: 2.5,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particles);
  }

  private handleMouseMove = (event: MouseEvent) => {
    this.targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  private setupMouseEvents(): void {
    window.addEventListener('mousemove', this.handleMouseMove);
  }
}
