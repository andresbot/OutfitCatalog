# Evaluacion de Negocio y Metricas (KPIs)

## 1. Proposito

Definir como se evaluaria el rendimiento de OutfitCatalog desde una perspectiva de negocio, adopcion, retencion, conversion y valor operativo para vendedores.

## 2. Modelo de negocio propuesto

OutfitCatalog funciona como una app de catalogo de moda donde vendedores publican prendas y clientes exploran, guardan favoritos, crean looks y envian solicitudes de compra. El valor central esta en conectar intencion de compra con vendedores mediante una experiencia visual y movil.

## 3. Usuarios objetivo

| Segmento | Necesidad |
|---|---|
| Clientes | Descubrir prendas, crear looks y contactar vendedores |
| Vendedores | Publicar inventario, recibir solicitudes y medir stock |
| Administradores | Supervisar usuarios, productos y reportes |

## 4. Indicadores de adopcion

| KPI | Formula | Fuente sugerida | Estado actual |
|---|---|---|---|
| Descargas | Instalaciones totales | Google Play Console / App Store Connect | Pendiente de tienda |
| Registros | Nuevos usuarios creados | Firebase Auth / Firestore `users` | Medible desde Firebase |
| DAU | Usuarios activos diarios | Firestore `analyticsEvents` | Integrado como analitica propia |
| MAU | Usuarios activos mensuales | Firestore `analyticsEvents` | Integrado como analitica propia |
| Usuarios por rol | Conteo por `role` | Firestore `users` | Medible desde Firestore |

## 5. Retencion y churn

| KPI | Formula | Interpretacion |
|---|---|---|
| Retencion D1 | Usuarios que vuelven al dia siguiente / usuarios nuevos | Mide primera impresion |
| Retencion D7 | Usuarios que vuelven en 7 dias / usuarios nuevos | Mide utilidad semanal |
| Retencion D30 | Usuarios que vuelven en 30 dias / usuarios nuevos | Mide valor sostenido |
| Churn | Usuarios inactivos / usuarios activos previos | Mide abandono |

En esta entrega se integro una capa gratuita de medicion propia usando Firebase Firestore. La aplicacion registra eventos en la coleccion `analyticsEvents`, lo que permite medir actividad sin depender de un SDK nativo adicional. Esta estrategia es adecuada para una entrega academica y para un MVP, porque aprovecha Firebase ya configurado y funciona con Expo/EAS.

Para una publicacion comercial se recomienda complementar esta medicion con Firebase Analytics y Crashlytics nativos.

## 6. Conversion

La conversion principal de la app no es un pago directo, sino la generacion de una solicitud comercial.

| Etapa del embudo | Evento implementado |
|---|---|
| Registro por correo | `sign_up_completed` |
| Registro con Google | `google_sign_up_completed` |
| Login por correo | `login_success` |
| Login con Google | `google_sign_in_success` |
| Vista catalogo | `catalog_viewed` |
| Vista prenda | `garment_viewed` |
| Favorito agregado | `favorite_added` |
| Favorito eliminado | `favorite_removed` |
| Look creado | `look_created` |
| Look actualizado | `look_updated` |
| Look eliminado | `look_deleted` |
| Solicitud creada | `purchase_request_created` |
| Estado de solicitud cambiado | `purchase_request_status_changed` |
| Solicitud eliminada | `purchase_request_deleted` |
| Producto creado | `inventory_item_created` |
| Producto actualizado | `inventory_item_updated` |
| Producto eliminado | `inventory_item_deleted` |

### KPIs de conversion

| KPI | Formula |
|---|---|
| Conversion a favorito | Usuarios que agregan favorito / usuarios que ven catalogo |
| Conversion a look | Usuarios que crean look / usuarios registrados |
| Conversion a solicitud | Solicitudes creadas / usuarios activos |
| Conversion a venta | Solicitudes vendidas / solicitudes creadas |
| Contactabilidad | Solicitudes contactadas / solicitudes creadas |

## 7. Metricas para vendedores

La app ya incorpora metricas operativas para vendedores:

- Cantidad de productos.
- Unidades disponibles.
- Productos con stock bajo.
- Productos agotados.
- Unidades reservadas.
- Unidades vendidas.
- Solicitudes activas.

Estas metricas permiten evaluar el estado del inventario y el avance comercial sin depender inicialmente de un panel externo.

## 8. Datos de prueba masivos

El script `seed:massive` permite simular adopcion y carga de catalogo.

Configuracion por defecto:

| Dato | Cantidad |
|---|---:|
| Administradores | 3 |
| Vendedores | 40 |
| Clientes | 250 |
| Prendas | 1500 |
| Total documentos Firestore | 1793 |

Configuracion de estres usada como referencia:

| Dato | Cantidad |
|---|---:|
| Administradores | 3 |
| Vendedores | 80 |
| Clientes | 500 |
| Usuarios Auth | 583 |
| Prendas | 3000 |
| Total documentos Firestore | 3583 |

## 9. Rendimiento en tiendas (ASO)

La app aun no esta publicada en Google Play ni App Store, por lo que no existen calificaciones, reseñas ni metricas ASO reales. Para una publicacion formal se recomienda:

- Nombre claro: OutfitCatalog o ATELIER Fashion Catalog.
- Descripcion breve orientada a catalogo, looks y vendedores.
- Capturas de login, catalogo, look, inventario y solicitudes.
- Politica de privacidad.
- Categoria: shopping, lifestyle o moda.
- Palabras clave: moda, catalogo, outfits, prendas, looks, vendedores.

## 10. Analitica integrada

La aplicacion incluye el servicio `src/core/services/analyticsService.ts`, encargado de registrar eventos KPI en Firestore. Cada evento guarda:

- Nombre del evento.
- Fecha de creacion.
- Identificador de sesion.
- Plataforma.
- Usuario y rol cuando esta disponible.
- Parametros del evento.

El panel de administrador consume estos eventos y muestra KPIs de los ultimos 30 dias en `AdminReportsScreen`.

Metricas visibles en reportes:

- Eventos totales.
- Usuarios activos medidos.
- Registros.
- Logins.
- Vistas de catalogo.
- Vistas de prenda.
- Favoritos agregados.
- Looks creados.
- Solicitudes creadas.
- Solicitudes marcadas como vendidas.

## 11. Recomendaciones de analitica futura

Se recomienda integrar Firebase Analytics nativo por compatibilidad con el ecosistema ya usado cuando el proyecto pase a una etapa de tienda. Eventos minimos equivalentes:

- `login`
- `sign_up`
- `catalog_view`
- `garment_detail_view`
- `favorite_add`
- `look_create`
- `purchase_request_create`
- `inventory_item_create`
- `purchase_request_status_change`

Tambien se recomienda integrar Crashlytics para medir estabilidad real en dispositivos.

## 12. Conclusion de negocio

OutfitCatalog tiene un flujo de negocio claro: convertir exploracion visual en solicitudes comerciales para vendedores. Con la integracion de eventos KPI en Firestore, la aplicacion ya puede medir comportamiento basico de usuarios, conversion e inventario sin costo adicional. Para una publicacion comercial se recomienda ampliar esta base con Firebase Analytics nativo, Crashlytics y metricas reales de tienda.
