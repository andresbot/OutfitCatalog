# ATELIER / Landing 3D

Experiencia web 3D para exponer la app movil ATELIER (OutfitCatalog).
Por Andres Botero y Juan Camilo Triana.

## Uso en la exposicion
La pagina funciona como apoyo visual por scroll:
- Hero: objetivo del proyecto y acceso al APK.
- App: problema que resuelve, solucion y stack base.
- Flujo: registro, catalogo optimizado, favoritos, looks y solicitudes.
- Roles: cliente, vendedor y admin con permisos separados.
- Arquitectura: Expo, Firebase, SQLite, Cloudinary, KPIs y solicitudes.
- QA: seguridad, red, rendimiento, APK y evidencias de entrega.

## Guia por modulo
- Hero: presentar ATELIER como una app movil de catalogo de moda, no como una galeria estatica. La idea central es pasar de exploracion visual a contacto comercial medible.
- App: explicar el problema: muchas ventas de moda se manejan por chats, imagenes sueltas y seguimiento manual. La solucion centraliza prendas, usuarios, vendedores, solicitudes y stock.
- Flujo: mostrar el recorrido del cliente: registro, telefono obligatorio, catalogo de 100 prendas, favoritos, looks y solicitud por prenda o por look.
- Roles: explicar que los tres perfiles usan la misma base de datos, pero con permisos distintos. Cliente compra, vendedor gestiona inventario y admin revisa control/KPIs.
- Arquitectura: resumir el stack: React Native con Expo para la app, Firebase para autenticacion y datos, SQLite para cache local, Cloudinary para imagenes y EAS Build para APK.
- KPIs: defender que la app ya deja bases para medir adopcion, retencion, conversion e inventario mediante eventos y estados.
- QA: hablar de pruebas, reglas de Firebase, manejo de red, optimizacion del catalogo y APK instalado como evidencia real.
- Demo: cerrar abriendo la APK y mostrando login, catalogo, favoritos/look, solicitud y vista de vendedor/admin si aplica.

## Puntos tecnicos clave
- Catalogo actual reducido a 100 prendas para evitar lag y mantener una demo fluida.
- Seed masivo usado como evidencia historica de carga y pruebas, pero no como volumen actual de produccion.
- Solicitudes separadas por vendedor cuando un look mezcla prendas de tiendas diferentes.
- Estados comerciales: pendiente, contactado, reservado, vendido y cancelado.
- Stock medible por disponibilidad, reservas, ventas y cancelaciones.
- APK generado con EAS Build en perfil `preview`.

## Stack
Vite / React 19 / Three.js / React Three Fiber / Drei / Postprocessing / GSAP / Lenis.

## Desarrollo
```bash
npm install
npm run dev
```

## Build + verificacion
```bash
npm run build
npm run preview
npm run verify
```

## Despliegue en Vercel
Configurar desde Vercel Dashboard:
- Root Directory: `landing`
- Framework: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

## Concepto
Viaje cinematico WebGL con HUD holografico. La camara recorre 8 escenas con scroll.
El video IA (`public/video.mp4`) aparece como holograma en el hero y dentro del telefono 3D.
Incluye fallback sin WebGL, poster cuando autoplay se bloquea y soporte para `prefers-reduced-motion`.
