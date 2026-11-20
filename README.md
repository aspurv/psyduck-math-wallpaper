# Psyduck Math Headache - Wallpaper Engine

Wallpaper animado, interactivo y reactivo al audio para Wallpaper Engine basado en el arte de Psyduck abrumado por una habitacion llena de formulas matematicas y ecuaciones complejas.

Construido con TypeScript, Vite y Three.js con shaders WebGL optimizados.

---

## Caracteristicas y Efectos

1. **Ondas de Jaqueca (Shader WebGL)**:
   - Ondas concentricas de choque y distorsion refractiva originadas en la cabeza de Psyduck.
   - Resplandor y aura animada configurable en color e intensidad.
2. **Reactividad al Audio**:
   - Integracion nativa con `wallpaperRegisterAudioListener` de Wallpaper Engine.
   - Frecuencias graves expanden las ondas de jaqueca y aumentan el resplandor al ritmo del sonido.
3. **Efecto Parallax 2.5D**:
   - Movimiento de camara suave con el cursor para dar profundidad tridimensional al vortice de formulas.
4. **Simbolos Matematicos Flotantes**:
   - Simbolos matematicos tridimensionales que flotan en el espacio y reaccionan al audio.
5. **Interaccion con Clic**:
   - Al hacer clic en pantalla, genera una descarga psiquica con ondas expansivas.
6. **Propiedades en Wallpaper Engine**:
   - Selector de color de aura.
   - Sliders de intensidad de ondas, fuerza de parallax y sensibilidad de audio.
   - Interruptores para simbolos flotantes y reactividad de sonido.

---

## Ejecucion en Desarrollo

```bash
npm run dev
```

Inicia el servidor local en `http://localhost:3000` con panel minimalista de pruebas para calibrar parametros.

---

## Compilar para Wallpaper Engine

1. Ejecuta:
   ```bash
   npm run build
   ```
2. En Wallpaper Engine: **Wallpaper Editor** -> **Create Wallpaper** -> **Web Wallpaper**.
3. Selecciona el archivo `dist/index.html`.
