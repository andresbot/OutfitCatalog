# Evaluacion de Usabilidad y Experiencia de Usuario (UX/UI)

## 1. Proposito

Evaluar la experiencia de usuario de OutfitCatalog desde la claridad de navegacion, facilidad de uso, diseno visual, accesibilidad y adaptacion a dispositivos moviles.

## 2. Identidad visual

La aplicacion usa una identidad de catalogo de moda con marca visual `ATELIER`, paleta oscura y acento dorado. La combinacion busca transmitir sensacion premium y editorial, adecuada para una aplicacion de prendas y looks.

| Token | Color |
|---|---|
| Fondo principal | `#0C0C0E` |
| Superficie | `#161618` |
| Superficie elevada | `#1F1F22` |
| Primario dorado | `#C9A84C` |
| Primario presionado | `#A8883A` |
| Texto principal | `#F0EAD6` |
| Texto secundario | `#9B9080` |
| Error | `#E05252` |
| Exito | `#52A882` |

## 3. Flujo de usuario

### Cliente

1. Abre la app.
2. Completa onboarding.
3. Se registra o inicia sesion.
4. Explora catalogo.
5. Guarda prendas favoritas.
6. Crea looks.
7. Envia solicitudes o comparte por WhatsApp.
8. Consulta estado de solicitudes.

### Vendedor

1. Inicia sesion como vendedor.
2. Visualiza dashboard de metricas.
3. Administra inventario.
4. Crea, edita o elimina prendas.
5. Consulta solicitudes recibidas.
6. Cambia estados de solicitud: pendiente, contactado, reservado, vendido o cancelado.
7. Revisa indicadores de stock.

### Administrador

1. Inicia sesion como administrador.
2. Accede a reportes, gestion de usuarios y moderacion.
3. Supervisa datos generales de la aplicacion.

## 4. Diseno responsivo e intuitivo

La app usa patrones comunes de interfaz movil:

- Botones grandes para acciones principales.
- Navegacion por pantallas con transiciones.
- Listas verticales para catalogo, favoritos, looks e inventario.
- Cards visuales con imagen, nombre, categoria y precio.
- Formularios con labels claros.
- Estados vacios con mensajes descriptivos.
- Indicadores de carga y error.
- Banner offline cuando no hay conexion.

El diseno esta optimizado para smartphones en orientacion vertical. Para tablets, la aplicacion puede funcionar por adaptacion flexible, pero se recomienda una revision visual adicional para aprovechar mejor el espacio.

## 5. Claridad del onboarding y registro

El onboarding introduce la app antes del login. El registro solicita datos esenciales:

- Nombre.
- Correo.
- Contrasena.
- Telefono.
- Rol: cliente o vendedor.

El telefono es obligatorio para ambos roles porque la aplicacion depende de contacto comercial y solicitudes. Esta decision mejora la viabilidad del flujo de compra, aunque agrega un paso adicional al registro.

## 6. Evaluacion heuristica

| Criterio | Evaluacion |
|---|---|
| Visibilidad del estado | La app muestra cargas, errores, banners offline y estados de solicitudes |
| Correspondencia con el mundo real | Usa conceptos comprensibles: prendas, favoritos, looks, vendedores, solicitudes |
| Control del usuario | Permite volver, cancelar seleccion, eliminar favoritos y crear looks |
| Consistencia | Mantiene paleta, botones redondeados, cards y jerarquia visual |
| Prevencion de errores | Valida campos obligatorios y muestra mensajes legibles |
| Flexibilidad | Permite crear looks desde catalogo o favoritos |
| Estetica minimalista | La interfaz mantiene enfoque en productos e imagenes |
| Recuperacion de errores | Muestra errores de Firebase, red y permisos de forma controlada |

## 7. Accesibilidad

### Fortalezas

- Alto contraste entre fondo oscuro y texto claro.
- Botones principales destacados con color dorado.
- Tipografia legible en titulos y cuerpos.
- Mensajes de error visibles.
- Estructuras de pantalla simples.

### Pendientes recomendados

- Agregar `accessibilityLabel` a botones iconicos.
- Verificar navegacion con lector de pantalla.
- Revisar contraste exacto con herramientas WCAG.
- Asegurar tamanos minimos tactiles de 44 x 44 px en todos los controles.
- Evitar depender solo del color para estados criticos.

## 8. Evaluacion por modulo

| Modulo | UX actual | Recomendacion |
|---|---|---|
| Login/registro | Claro y directo | Agregar recuperacion de contrasena si se publica |
| Catalogo | Visual, basado en cards | Agregar ordenamiento avanzado en produccion |
| Favoritos | Facil de entender | Mantener accion de crear look visible |
| Looks | Flujo diferencial de valor | Mejorar vista tipo collage en futuras versiones |
| Inventario | Util para vendedor | Agregar filtros por stock y categoria mas avanzados |
| Solicitudes | Flujo comercial claro | Agregar notificaciones push en produccion |
| Admin | Cumple supervision basica | Ampliar reportes con graficas |

## 9. Conclusion UX/UI

OutfitCatalog presenta una experiencia coherente con su categoria de moda. La app combina una identidad visual premium con flujos funcionales de cliente y vendedor. El producto es usable como MVP academico y permite completar los procesos principales. Para una version comercial se recomienda reforzar accesibilidad, notificaciones, analiticas de comportamiento y pruebas con usuarios reales.
