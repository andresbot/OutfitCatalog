# Matriz de Casos de Prueba

## 1. Objetivo

Documentar los escenarios principales que deben verificarse para validar la calidad funcional de OutfitCatalog. La matriz combina pruebas automatizadas existentes, pruebas manuales recomendadas y criterios de aceptacion para la entrega final.

## 2. Resumen de pruebas automatizadas

| Fuente | Resultado |
|---|---|
| `npm run build` | Aprobado |
| `npm test` | Aprobado |
| Archivos de prueba | 9 |
| Casos automatizados | 14 |

## 3. Casos de prueba funcionales

| ID | Modulo | Caso de prueba | Pasos resumidos | Resultado esperado | Estado |
|---|---|---|---|---|---|
| QA-001 | Onboarding | Primer ingreso | Abrir app nueva | Muestra onboarding antes del login | Por validar manualmente |
| QA-002 | Onboarding | Onboarding completado | Completar onboarding y reabrir | La app inicia en login | Por validar manualmente |
| QA-003 | Auth | Registro cliente | Ingresar nombre, correo, contrasena, telefono y rol cliente | Crea cuenta y entra al home cliente | Por validar manualmente |
| QA-004 | Auth | Registro vendedor | Ingresar datos y rol vendedor | Crea cuenta y entra al home vendedor | Por validar manualmente |
| QA-005 | Auth | Telefono obligatorio | Intentar registrarse sin telefono | Muestra validacion y bloquea registro | Por validar manualmente |
| QA-006 | Auth | Login correcto | Ingresar correo y contrasena validos | Inicia sesion y redirige por rol | Por validar manualmente |
| QA-007 | Auth | Login incorrecto | Ingresar contrasena invalida | Muestra error legible | Por validar manualmente |
| QA-008 | Auth | Google Sign-In | Iniciar con Google | Permite elegir cuenta y autentica | Por validar manualmente |
| QA-009 | Auth | Google nuevo usuario | Iniciar con Google sin perfil previo | Solicita rol y telefono | Por validar manualmente |
| QA-010 | Auth | Cierre de sesion | Cerrar sesion desde home | Regresa a login | Por validar manualmente |
| QA-011 | Catalogo | Listar productos | Entrar como cliente al catalogo | Muestra prendas publicadas | Por validar manualmente |
| QA-012 | Catalogo | Buscar producto | Usar buscador por nombre/categoria | Filtra resultados | Por validar manualmente |
| QA-013 | Catalogo | Filtros | Filtrar por categoria/precio | Muestra resultados coherentes | Por validar manualmente |
| QA-014 | Catalogo | Detalle de prenda | Abrir una prenda | Muestra imagen, precio, talla, color, vendedor y acciones | Por validar manualmente |
| QA-015 | Favoritos | Agregar favorito | Marcar prenda como favorita | Aparece en pantalla favoritos | Por validar manualmente |
| QA-016 | Favoritos | Quitar favorito | Quitar prenda favorita | Desaparece de favoritos | Por validar manualmente |
| QA-017 | Looks | Crear look desde catalogo | Seleccionar varias prendas y guardar | Se crea look con items | Por validar manualmente |
| QA-018 | Looks | Crear look desde favoritos | Entrar a favoritos y seleccionar prendas | Se crea look desde prendas favoritas | Por validar manualmente |
| QA-019 | Looks | Ver detalle de look | Abrir look creado | Muestra prendas asociadas y acciones | Por validar manualmente |
| QA-020 | Solicitudes | Solicitud de prenda | Desde detalle de prenda crear solicitud | Solicitud queda pendiente para vendedor | Por validar manualmente |
| QA-021 | Solicitudes | Solicitud de look multi-vendedor | Crear solicitud desde look con varios vendedores | Genera una solicitud por vendedor | Por validar manualmente |
| QA-022 | Solicitudes | Listado comprador | Entrar a solicitudes como cliente | Muestra solicitudes del comprador | Por validar manualmente |
| QA-023 | Solicitudes | Listado vendedor | Entrar a solicitudes como vendedor | Muestra solicitudes recibidas | Por validar manualmente |
| QA-024 | Solicitudes | Cambiar estado | Vendedor cambia a contactado, reservado o vendido | Actualiza solicitud y metricas | Por validar manualmente |
| QA-025 | Solicitudes | Eliminar solicitud | Eliminar solicitud permitida | Se elimina local/remoto segun reglas | Por validar manualmente |
| QA-026 | Inventario | Listar inventario | Entrar como vendedor | Muestra solo productos del vendedor | Por validar manualmente |
| QA-027 | Inventario | Crear producto | Vendedor crea prenda con imagen | Se guarda en SQLite/Firestore y aparece en inventario | Por validar manualmente |
| QA-028 | Inventario | Editar producto | Modificar datos de prenda | Se actualiza inventario y catalogo si esta publicada | Por validar manualmente |
| QA-029 | Inventario | Eliminar producto | Eliminar prenda del vendedor | Desaparece del inventario | Por validar manualmente |
| QA-030 | Stock | Reservar solicitud | Cambiar solicitud a reservado | Disminuye stock disponible | Por validar manualmente |
| QA-031 | Stock | Cancelar reserva | Cambiar reservado a cancelado/contactado | Restaura stock si aplica | Por validar manualmente |
| QA-032 | Admin | Gestion usuarios | Entrar como admin | Muestra modulo de usuarios | Por validar manualmente |
| QA-033 | Admin | Reportes | Entrar a reportes | Muestra conteos y resumen de datos | Por validar manualmente |

## 4. Casos de conectividad

| ID | Escenario | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| NET-001 | Sin conexion en catalogo | Desactivar red y abrir catalogo | Muestra banner offline y cache local | Por validar manualmente |
| NET-002 | Recuperacion de red | Volver a activar red | La app puede refrescar datos | Por validar manualmente |
| NET-003 | Firebase no disponible | Simular error remoto | Muestra error controlado y evita cierre inesperado | Por validar manualmente |
| NET-004 | Imagen lenta | Abrir catalogo con red lenta | Skeleton/carga visual sin bloquear UI | Por validar manualmente |

## 5. Casos de seguridad

| ID | Escenario | Resultado esperado | Estado |
|---|---|---|---|
| SEC-001 | Usuario no autenticado intenta entrar a home | Debe redirigir o bloquear acceso | Por validar manualmente |
| SEC-002 | Cliente intenta editar inventario | Acceso denegado por UI/reglas | Por validar manualmente |
| SEC-003 | Vendedor intenta ver solicitudes de otro vendedor | Firestore debe bloquear lectura | Por validar manualmente con reglas |
| SEC-004 | Password incorrecto | Firebase no revela detalles sensibles | Por validar manualmente |
| SEC-005 | Google OAuth mal configurado | Muestra error legible de configuracion | Por validar manualmente |

## 6. Pruebas automatizadas existentes

| Archivo | Cobertura principal |
|---|---|
| `test/garmentDao.test.ts` | CRUD, busqueda y carga batch de prendas |
| `test/lookDao.test.ts` | CRUD y carga batch de looks por usuario |
| `test/lookItemDao.test.ts` | CRUD y reemplazo de items de look |
| `test/favoriteDao.test.ts` | Creacion, busqueda y eliminacion de favoritos |
| `test/garmentRepositorySync.test.ts` | Sincronizacion remota/cache y prendas publicadas |
| `src/core/services/lookShareService.test.ts` | Mensajes para WhatsApp |
| `src/core/services/purchaseRequestService.test.ts` | Mensaje de solicitud de compra |

## 7. Criterios de aceptacion global

La aplicacion se considera aceptada para entrega academica si:

- Compila sin errores TypeScript.
- Ejecuta pruebas automatizadas correctamente.
- El APK se instala y abre en Android.
- Login, registro y Google Auth funcionan con Firebase configurado.
- Cliente puede navegar catalogo, favoritos, looks y solicitudes.
- Vendedor puede gestionar inventario y solicitudes.
- La app no se cierra ante errores comunes de red.
- Las reglas de Firebase permiten solo las operaciones autorizadas.

## 8. Observaciones

Esta matriz debe completarse con evidencia de ejecucion manual antes de una entrega en produccion. Para una entrega academica, la matriz sirve como soporte de validacion y como guia de pruebas funcionales finales.
