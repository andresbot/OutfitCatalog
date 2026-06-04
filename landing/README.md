# ATELIER · Landing 3D

Experiencia web 3D que expone la app movil ATELIER (OutfitCatalog).
Por Andres Botero y Juan Camilo Triana.

## Stack
Vite · React 19 · three / react-three-fiber / drei / postprocessing · GSAP (ScrollTrigger) · Lenis.

## Desarrollo
```bash
npm install
npm run dev        # http://127.0.0.1:5178
```

## Build + verificacion
```bash
npm run build              # tsc + vite build
npm run preview            # sirve dist en :5178
npm run verify             # smoke test Playwright (requiere preview corriendo)
```

## Concepto
Viaje cinematico WebGL + HUD holografico. La camara recorre 8 escenas con el scroll.
El video IA (`public/video.mp4`) aparece como holograma en el hero y dentro del telefono 3D.
Degradacion: fallback sin WebGL, poster si el autoplay se bloquea, animaciones reducidas con `prefers-reduced-motion`.
