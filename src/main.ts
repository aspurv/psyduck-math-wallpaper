import { WallpaperBridge } from './core/wallpaper-bridge';
import { Engine } from './core/engine';
import { PsyduckScene } from './scenes/psyduck-scene';

function bootstrap(): void {
  const container = document.getElementById('canvas-container');
  if (!container) {
    console.error('No se encontró el contenedor de canvas (#canvas-container)');
    return;
  }

  // Inicializar puente con las opciones nativas de Wallpaper Engine
  const bridge = new WallpaperBridge();
  const scene = new PsyduckScene();

  // Arrancar motor gráfico Three.js a pantalla completa
  new Engine(container, bridge, scene);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
