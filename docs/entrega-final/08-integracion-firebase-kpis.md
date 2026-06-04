# Integracion Firebase para KPIs

## 1. Objetivo

Documentar la integracion gratuita de medicion de KPIs implementada en OutfitCatalog mediante Firebase Firestore.

## 2. Estrategia seleccionada

Para esta entrega se implemento una analitica propia usando Firestore en lugar de agregar inicialmente un SDK nativo de Firebase Analytics. Esta decision permite:

- Mantener compatibilidad con Expo.
- Evitar configuraciones nativas adicionales.
- Usar Firebase ya configurado en el proyecto.
- Medir eventos clave para una entrega academica.
- Mantener costo cero dentro del uso gratuito razonable de Firebase.

## 3. Servicio implementado

Archivo:

```text
src/core/services/analyticsService.ts
```

Funciones principales:

```text
trackEvent(name, params, user)
getAnalyticsSummary(days)
```

`trackEvent` registra eventos en Firestore. `getAnalyticsSummary` lee los eventos y calcula KPIs para reportes administrativos.

## 4. Coleccion Firestore

```text
analyticsEvents
```

Campos principales:

| Campo | Descripcion |
|---|---|
| `id` | Identificador del evento |
| `name` | Nombre del evento |
| `createdAt` | Fecha ISO |
| `sessionId` | Sesion de app |
| `platform` | Plataforma movil |
| `userId` | Usuario autenticado, cuando aplica |
| `role` | Rol del usuario, cuando aplica |
| `params` | Parametros del evento |

## 5. Eventos implementados

| Evento | Uso |
|---|---|
| `login_success` | Inicio de sesion por correo |
| `sign_up_completed` | Registro por correo |
| `google_sign_in_success` | Inicio de sesion con Google |
| `google_sign_up_completed` | Registro completado con Google |
| `catalog_viewed` | Vista del catalogo |
| `garment_viewed` | Vista de detalle de prenda |
| `favorite_added` | Favorito agregado |
| `favorite_removed` | Favorito eliminado |
| `look_created` | Look creado |
| `look_updated` | Look actualizado |
| `look_deleted` | Look eliminado |
| `purchase_request_created` | Solicitud de compra creada |
| `purchase_request_status_changed` | Estado de solicitud actualizado |
| `purchase_request_deleted` | Solicitud eliminada |
| `inventory_item_created` | Producto de inventario creado |
| `inventory_item_updated` | Producto de inventario actualizado |
| `inventory_item_deleted` | Producto de inventario eliminado |
| `admin_report_viewed` | Reporte de administrador consultado |

## 6. KPIs calculados

El panel de reportes calcula, para los ultimos 30 dias:

- Total de eventos.
- Usuarios activos medidos.
- Sesiones anonimas.
- Registros.
- Logins.
- Vistas de catalogo.
- Vistas de prendas.
- Favoritos agregados.
- Favoritos eliminados.
- Looks creados.
- Solicitudes creadas.
- Solicitudes vendidas.
- Productos creados.
- Productos actualizados.
- Eventos mas frecuentes.

## 7. Reglas Firebase recomendadas

Agregar el siguiente bloque dentro de `match /databases/{database}/documents`, junto a las reglas actuales:

```js
match /analyticsEvents/{eventId} {
  allow create: if signedIn()
    && request.resource.data.name is string
    && request.resource.data.createdAt is string
    && request.resource.data.sessionId is string
    && request.resource.data.platform is string
    && request.resource.data.params is map
    && (
      !request.resource.data.keys().hasAny(["userId"])
      || request.resource.data.userId == request.auth.uid
    );

  allow read: if isAdmin();
  allow update, delete: if false;
}
```

Estas reglas permiten que usuarios autenticados creen eventos, pero solo administradores puedan leerlos. No se permite editar o borrar eventos desde la app.

## 8. Consideraciones de privacidad

La analitica implementada no guarda contrasenas ni datos bancarios. Los eventos pueden guardar identificador de usuario y rol, por lo que se recomienda:

- Informar el uso de analitica en la politica de privacidad.
- Evitar incluir datos sensibles en `params`.
- Limitar la lectura de `analyticsEvents` a administradores.
- Depurar eventos antiguos si el volumen crece.

## 9. Limitaciones

Esta solucion es adecuada para MVP y entrega academica. Para produccion se recomienda:

- Firebase Analytics nativo.
- Firebase Crashlytics.
- Agregaciones periodicas para no leer demasiados eventos.
- Exportacion a BigQuery si el proyecto escala.

## 10. Conclusion

La aplicacion queda con medicion KPI integrada de forma gratuita y verificable desde Firebase. Esto fortalece la entrega final porque permite evidenciar adopcion, conversion y actividad comercial sin depender de servicios pagos.
