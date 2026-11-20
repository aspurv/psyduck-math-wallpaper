import * as THREE from 'three';
import { IScene } from '../scenes/base-scene';
import { WallpaperBridge } from './wallpaper-bridge';

export class Engine {
  private container: HTMLElement;
  private bridge: WallpaperBridge;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private activeScene: IScene;

  private clock: THREE.Clock = new THREE.Clock();
  private animationFrameId: number | null = null;
  private isPaused: boolean = false;

  constructor(container: HTMLElement, bridge: WallpaperBridge, initialScene: IScene) {
    this.container = container;
    this.bridge = bridge;
    this.activeScene = initialScene;

    this.initThree();
    this.bindEvents();
    this.start();
  }

  private initThree(): void {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Escena y Cámara
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.z = 40;

    // Renderer optimizado para consumo mínimo de batería/GPU
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.container.appendChild(this.renderer.domElement);

    // Inicializar escena activa
    this.activeScene.init(this.renderer, this.scene, this.camera);
    this.activeScene.onConfigChange(this.bridge.getConfig());
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.onResize);

    // Escuchar cambios de configuración desde Wallpaper Engine o dev tools
    this.bridge.onPropertyChange((config) => {
      document.body.style.backgroundColor = config.backgroundColor;
      this.activeScene.onConfigChange(config);
    });

    // Pausar render loop cuando Wallpaper Engine detecta otra app en pantalla completa
    this.bridge.onPause((paused) => {
      this.isPaused = paused;
      if (!paused && !this.animationFrameId) {
        this.clock.start();
        this.start();
      }
    });
  }

  private onResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.activeScene.onResize(width, height);
  };

  private start(): void {
    const renderLoop = () => {
      if (this.isPaused) {
        this.animationFrameId = null;
        return;
      }

      this.animationFrameId = requestAnimationFrame(renderLoop);

      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();
      const config = this.bridge.getConfig();
      const audioData = this.bridge.audio.current;

      this.activeScene.update(delta, elapsed, config, audioData);
      this.renderer.render(this.scene, this.camera);
    };

    this.animationFrameId = requestAnimationFrame(renderLoop);
  }

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    this.activeScene.destroy();
    this.renderer.dispose();
  }
}
