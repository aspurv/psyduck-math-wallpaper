import * as THREE from 'three';
import { IScene } from './base-scene';
import { WallpaperConfig } from '../config/properties';
import { AudioBands } from '../utils/audio';

const MATH_SYMBOLS = ['π', '∑', '∫', '√x', '∞', '∂', 'eⁱᵖ', 'λ', 'θ', 'f(x)', '∆', 'Ψ', '∇', '≈', '≠', '42'];

export class PsyduckScene implements IScene {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private bgMesh?: THREE.Mesh;
  private bgMaterial?: THREE.ShaderMaterial;
  private textureLoader = new THREE.TextureLoader();

  // Partículas de símbolos matemáticos
  private symbolGroup: THREE.Group = new THREE.Group();
  private symbolSprites: { sprite: THREE.Sprite; initialPos: THREE.Vector3; speed: number; phase: number }[] = [];
  private symbolTextures: THREE.Texture[] = [];

  // Parallax con ratón
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;

  // Interacción de clic
  private clickPulse = 0;

  public init(_renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
    this.scene = scene;
    this.camera = camera;

    this.createBackground();
    this.updateBackgroundSize(window.innerWidth, window.innerHeight);
    this.createMathTextures();
    this.createMathSprites(60);
    this.setupEvents();
  }

  private createBackground(): void {
    const texture = this.textureLoader.load('assets/psyduck_math.jpg');
    // Filtrado suave y limpio sin artefactos ni grano artificial
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const geometry = new THREE.PlaneGeometry(1, 1, 64, 64);

    this.bgMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uHeadPos: { value: new THREE.Vector2(0.50, 0.49) },
        uHeadacheIntensity: { value: 1.0 },
        uAudioBass: { value: 0.0 },
        uClickPulse: { value: 0.0 },
        uAuraColor: { value: new THREE.Color('#4db8ff') },
        uAspect: { value: window.innerWidth / window.innerHeight }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform vec2 uHeadPos;
        uniform float uHeadacheIntensity;
        uniform float uAudioBass;
        uniform float uClickPulse;
        uniform vec3 uAuraColor;
        uniform float uAspect;
        varying vec2 vUv;

        vec2 getCoverUV(vec2 uv, float screenAspect, float imgAspect) {
          vec2 s = uv;
          if (screenAspect > imgAspect) {
            float scaleY = imgAspect / screenAspect;
            s.y = (s.y - 0.5) * scaleY + 0.5;
          } else {
            float scaleX = screenAspect / imgAspect;
            s.x = (s.x - 0.5) * scaleX + 0.5;
          }
          return s;
        }

        void main() {
          vec2 imgUv = getCoverUV(vUv, uAspect, 1.7777778);

          vec2 delta = (imgUv - uHeadPos) * vec2(1.7777778, 1.0);
          float dist = length(delta);

          // Ondas concéntricas de jaqueca psíquica suaves
          float wave = sin(dist * 20.0 - uTime * 4.0);
          float waveFalloff = exp(-dist * 2.0);

          float pulseStrength = (uHeadacheIntensity * 0.003 + uAudioBass * 0.006 + uClickPulse * 0.012) * waveFalloff;
          vec2 uvOffset = normalize(delta + 0.0001) * wave * pulseStrength;
          
          vec2 finalUv = imgUv + uvOffset;

          // Muestreo limpio sin ruidos ni grano artificial
          vec4 texColor = texture2D(uTexture, finalUv);

          // Resplandor del aura psíquica
          float auraGlow = exp(-dist * 4.2) * (0.12 * uHeadacheIntensity + uAudioBass * 0.4 + uClickPulse * 0.6);
          float ringGlow = smoothstep(0.65, 1.0, wave) * waveFalloff * (0.15 + uAudioBass * 0.35);

          vec3 finalRgb = texColor.rgb + uAuraColor * (auraGlow + ringGlow);
          gl_FragColor = vec4(finalRgb, 1.0);
        }
      `
    });

    this.bgMesh = new THREE.Mesh(geometry, this.bgMaterial);
    this.bgMesh.position.z = 0;
    this.scene.add(this.bgMesh);
  }

  private updateBackgroundSize(width: number, height: number): void {
    if (!this.bgMesh || !this.camera) return;

    const vFovRad = (this.camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFovRad / 2) * this.camera.position.z;
    const visibleWidth = visibleHeight * (width / height);

    // Margen sutil del 5% para parallax sin zoom destructivo
    const margin = 1.05;
    this.bgMesh.scale.set(visibleWidth * margin, visibleHeight * margin, 1);

    if (this.bgMaterial) {
      this.bgMaterial.uniforms.uAspect.value = width / height;
    }
  }

  private createMathTextures(): void {
    MATH_SYMBOLS.forEach((symbol) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 128, 128);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 54px "Courier New", monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(77, 184, 255, 0.9)';
        ctx.shadowBlur = 14;
        ctx.fillText(symbol, 64, 64);
      }
      const tex = new THREE.CanvasTexture(canvas);
      this.symbolTextures.push(tex);
    });
  }

  private createMathSprites(count: number): void {
    this.scene.add(this.symbolGroup);

    for (let i = 0; i < count; i++) {
      const tex = this.symbolTextures[i % this.symbolTextures.length];
      const mat = new THREE.SpriteMaterial({
        map: tex,
        color: 0xffffff,
        transparent: true,
        opacity: 0.35 + Math.random() * 0.35,
        blending: THREE.AdditiveBlending
      });

      const sprite = new THREE.Sprite(mat);
      const x = (Math.random() - 0.5) * 55;
      const y = (Math.random() - 0.5) * 30;
      const z = 2 + Math.random() * 12;

      sprite.position.set(x, y, z);
      const scale = 1.4 + Math.random() * 1.2;
      sprite.scale.set(scale, scale, 1);

      this.symbolSprites.push({
        sprite,
        initialPos: new THREE.Vector3(x, y, z),
        speed: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2
      });

      this.symbolGroup.add(sprite);
    }
  }

  public onConfigChange(config: WallpaperConfig): void {
    if (this.bgMaterial) {
      this.bgMaterial.uniforms.uHeadacheIntensity.value = config.headacheIntensity;
      this.bgMaterial.uniforms.uAuraColor.value.set(config.accentColor);
    }

    this.symbolGroup.visible = config.mathParticles;

    this.symbolSprites.forEach((item) => {
      (item.sprite.material as THREE.SpriteMaterial).color.set(config.accentColor);
    });
  }

  public update(_delta: number, elapsed: number, config: WallpaperConfig, audio: AudioBands): void {
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    const pStrength = config.parallaxStrength;
    this.camera.position.x = this.mouseX * 1.5 * pStrength;
    this.camera.position.y = this.mouseY * 1.0 * pStrength;
    this.camera.lookAt(0, 0, 0);

    this.clickPulse *= 0.94;

    if (this.bgMaterial) {
      this.bgMaterial.uniforms.uTime.value = elapsed;
      this.bgMaterial.uniforms.uClickPulse.value = this.clickPulse;
      this.bgMaterial.uniforms.uAudioBass.value = config.audioEffect ? audio.bass * config.audioIntensity : 0;
    }

    if (config.mathParticles) {
      const audioTreble = config.audioEffect ? audio.treble * config.audioIntensity : 0;

      for (let i = 0; i < this.symbolSprites.length; i++) {
        const item = this.symbolSprites[i];
        const floatOffset = Math.sin(elapsed * item.speed + item.phase) * 0.8;
        const driftX = Math.cos(elapsed * item.speed * 0.5 + item.phase) * 0.4;

        item.sprite.position.x = item.initialPos.x + driftX;
        item.sprite.position.y = item.initialPos.y + floatOffset;

        const boost = 1.0 + audioTreble * 0.6;
        item.sprite.scale.set(item.initialPos.z * 0.15 * boost, item.initialPos.z * 0.15 * boost, 1);
      }
    }
  }

  public onResize(width: number, height: number): void {
    this.updateBackgroundSize(width, height);
  }

  public destroy(): void {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('click', this.handleClick);

    if (this.bgMesh) {
      this.scene.remove(this.bgMesh);
      this.bgMesh.geometry.dispose();
      this.bgMaterial?.dispose();
    }

    this.symbolSprites.forEach((item) => {
      this.symbolGroup.remove(item.sprite);
      item.sprite.material.dispose();
    });

    this.symbolTextures.forEach((tex) => tex.dispose());
  }

  private handleMouseMove = (event: MouseEvent) => {
    this.targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  private handleClick = () => {
    this.clickPulse = 1.2;
  };

  private setupEvents(): void {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('click', this.handleClick);
  }
}
