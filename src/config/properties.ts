export interface WallpaperConfig {
  accentColor: string;        // Color hex para el aura psíquica y partículas
  backgroundColor: string;    // Color hex del fondo (detrás del canvas)
  animationSpeed: number;     // Multiplicador general de velocidad de animación
  headacheIntensity: number;  // Multiplicador de ondas de distorsión (0.0 - 2.5)
  parallaxStrength: number;   // Intensidad del efecto 3D con el cursor (0.0 - 2.0)
  mathParticles: boolean;     // Activar símbolos matemáticos flotantes
  particleCount: number;      // Cantidad de símbolos (20 - 150)
  audioEffect: boolean;       // Reactividad al sonido
  audioIntensity: number;     // Multiplicador de audio
}

export const defaultConfig: WallpaperConfig = {
  accentColor: '#4db8ff',
  backgroundColor: '#0b0f19',
  animationSpeed: 1.0,
  headacheIntensity: 1.0,
  parallaxStrength: 1.0,
  mathParticles: true,
  particleCount: 60,
  audioEffect: true,
  audioIntensity: 1.2
};
