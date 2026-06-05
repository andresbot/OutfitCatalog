# Informe Final del Proyecto Movil

## Portada

**Proyecto:** OutfitCatalog - ATELIER Fashion Catalog
**Tipo de producto:** Aplicacion movil de catalogo, looks, inventario y solicitudes de compra
**Asignatura:** Dispositivos Moviles
**Estudiante(s):** [Completar nombres]
**Docente:** [Completar nombre]
**Institucion:** [Completar institucion]
**Fecha:** 2026-06-04
**Version entregada:** 1.0.0

## Resumen ejecutivo

OutfitCatalog es una aplicacion movil desarrollada con React Native y Expo, orientada a la gestion y exploracion de prendas de moda. La aplicacion permite registrar usuarios con roles diferenciados, navegar por un catalogo de productos, crear favoritos, construir looks, contactar vendedores, administrar inventario y generar solicitudes de compra. El producto se entrega como un MVP funcional con persistencia local, sincronizacion remota mediante Firebase y un APK generado con EAS Build.

El proyecto implementa flujos diferenciados para clientes, vendedores y administradores. Los clientes pueden explorar prendas, guardar favoritos, crear looks y enviar solicitudes. Los vendedores pueden administrar sus productos, revisar solicitudes, actualizar estados y consultar metricas basicas de stock. Los administradores cuentan con pantallas de gestion y reportes.

## Objetivo general

Desarrollar y evaluar una aplicacion movil funcional para catalogo de moda, aplicando buenas practicas de arquitectura, persistencia, autenticacion, experiencia de usuario, despliegue y verificacion de calidad en un entorno movil.

## Objetivos especificos

- Implementar una aplicacion movil multiplataforma con React Native y Expo.
- Gestionar autenticacion por correo, contrasena y Google Sign-In.
- Diferenciar la experiencia de usuario segun el rol: cliente, vendedor y administrador.
- Permitir la gestion de catalogo, favoritos, looks, inventario y solicitudes de compra.
- Incorporar persistencia local con SQLite y sincronizacion remota con Firebase.
- Evaluar la aplicacion desde los enfoques de calidad tecnica, UX/UI, negocio y despliegue.
- Generar evidencia de pruebas, build y documentacion academica final.

## Alcance funcional

La version final incluye:

- Onboarding inicial.
- Registro e inicio de sesion.
- Inicio de sesion con Google.
- Seleccion de rol para usuarios autenticados con Google cuando no existe perfil previo.
- Telefono obligatorio para clientes y vendedores al crear cuenta.
- Catalogo de prendas publicadas.
- Detalle de prenda.
- Favoritos.
- Creacion de looks desde catalogo o favoritos.
- Detalle de look.
- Envio de looks o prendas por WhatsApp.
- Solicitudes de compra para prendas y looks.
- Solicitudes agrupadas por vendedor cuando un look tiene prendas de varios vendedores.
- Pantalla de solicitudes para cliente y vendedor.
- Inventario para vendedores.
- Metricas de productos, unidades, stock bajo, agotadas, reservadas y vendidas.
- Script de carga masiva de usuarios y prendas.
- Optimizacion de carga de productos e inventario.
- APK final generado con EAS Build.

## Evidencia tecnica de entrega

| Elemento | Evidencia |
|---|---|
| Repositorio | `https://github.com/andresbot/OutfitCatalog.git` |
| Commit final | `5bd8d25 feat: optimiza inventario y solicitudes de compra` |
| APK final | `https://expo.dev/artifacts/eas/hFhAPFSHte8uvkEKgF2FTW.apk` |
| EAS Build ID | `b56095a2-87a4-4dac-ae47-7f5d8599dee4` |
| Estado del build | `FINISHED` |
| Comando de build TypeScript | `npm run build` |
| Resultado de pruebas | 9 archivos de prueba, 17 pruebas aprobadas |

## Metodologia de evaluacion

La evaluacion se organiza en tres dimensiones principales:

1. Calidad tecnica y QA: compatibilidad, rendimiento, conectividad, seguridad, estabilidad y pruebas.
2. Usabilidad y UX/UI: navegacion, claridad de flujos, accesibilidad, consistencia visual y experiencia tactil.
3. Negocio y KPIs: adopcion, retencion, conversion, inventario, solicitudes y medicion futura.

Adicionalmente se incluyen anexos de arquitectura, plan de despliegue, mantenimiento y guia visual.

## Resultados principales

La aplicacion cumple con los requerimientos centrales de un proyecto movil funcional: tiene navegacion real, autenticacion, persistencia local, sincronizacion remota, roles, gestion de inventario y build instalable en Android. El uso de Expo facilita la generacion de artefactos y reduce la complejidad de configuracion nativa.

El proyecto tambien evidencia una base tecnica mantenible mediante TypeScript, separacion por carpetas, servicios, DAOs, casos de uso y pruebas automatizadas. La aplicacion cuenta con una estrategia offline-first para catalogo e inventario, apoyada en SQLite y manejo visual de desconexion.

Como evidencia de validacion con usuarios, se aplico una encuesta de prueba piloto a 7 personas en Android el 4 de junio de 2026. El 100% de los participantes indico que pudo instalar la aplicacion, el 100% afirmo que la recomendaria y el promedio general de calificacion fue 4.91 sobre 5. Los comentarios positivos destacaron la utilidad del catalogo, la variedad de prendas, la facilidad para contactar vendedores y la calidad visual de las imagenes.

La encuesta tambien permitio identificar mejoras futuras. Un usuario reporto que algunas fotos no aparecieron, por lo que se recomienda reforzar estados de carga, fallback visual y manejo de imagenes remotas. Dos usuarios sugirieron agregar filtro por genero o tipo de ropa para hombre/mujer, y un usuario propuso incluir modo claro. Estos hallazgos no bloquearon el flujo principal, pero sirven como insumo para una version posterior.

Como puntos pendientes para una publicacion productiva completa, se recomienda complementar la analitica propia en Firestore con Firebase Analytics nativo, Crashlytics, pruebas manuales documentadas en dispositivos iOS, publicacion en tiendas y politicas legales de privacidad.

## Anexos documentales

- `01-evaluacion-tecnica-qa.md`
- `02-matriz-casos-prueba.md`
- `03-evaluacion-ux-ui.md`
- `04-evaluacion-negocio-kpis.md`
- `05-documentacion-tecnica-arquitectura.md`
- `06-plan-despliegue-mantenimiento.md`
- `07-entregables-diseno-ui-kit.md`
- `08-integracion-firebase-kpis.md`
- `09-reglas-firestore-finales.md`

## Conclusion

OutfitCatalog puede considerarse finalizado como MVP academico y funcional. La aplicacion resuelve un problema concreto de catalogo movil de moda, integra flujos de cliente y vendedor, permite administrar productos, crear looks y gestionar solicitudes de compra. La version entregada cuenta con APK instalable, pruebas automatizadas y documentacion tecnica suficiente para continuar su mantenimiento o evolucion hacia una publicacion formal en tiendas.
