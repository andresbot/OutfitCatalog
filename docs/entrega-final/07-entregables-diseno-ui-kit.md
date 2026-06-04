# Entregables de Diseno y UI Kit

## 1. Proposito

Documentar la identidad visual, componentes y lineamientos de interfaz de OutfitCatalog para mantener consistencia en futuras actualizaciones.

## 2. Identidad de marca

| Elemento | Definicion |
|---|---|
| Marca visual | ATELIER |
| Nombre tecnico | OutfitCatalog |
| Categoria | Moda, catalogo, looks e inventario |
| Tono visual | Premium, editorial, oscuro, elegante |
| Personalidad | Sofisticada, clara, comercial, visual |

## 3. Paleta de colores

| Nombre | Hex | Uso |
|---|---|---|
| Background | `#0C0C0E` | Fondo principal |
| Surface | `#161618` | Cards, formularios, paneles |
| Surface High | `#1F1F22` | Modales, superficies elevadas |
| Primary | `#C9A84C` | Botones principales, acentos, estados activos |
| Primary Dark | `#A8883A` | Estado presionado |
| Text Primary | `#F0EAD6` | Titulos y texto principal |
| Text Secondary | `#9B9080` | Texto secundario |
| Text Muted | `#4E4A44` | Placeholders y ayudas |
| Border | `#2A2820` | Bordes sutiles |
| Border Light | `#3A3630` | Bordes activos |
| Error | `#E05252` | Errores |
| Success | `#52A882` | Exito |

## 4. Tipografia

La app usa tipografia del sistema operativo por defecto, con jerarquias definidas desde tokens:

| Estilo | Tamano | Peso | Uso |
|---|---:|---|---|
| Brand | 22 | 800 | Logo textual ATELIER |
| Display | 32 | 800 | Titulos grandes |
| Title | 22 | 700 | Titulos de seccion |
| Label | 11 | 700 | Etiquetas de formularios |
| Body | 15 | Regular | Texto descriptivo |
| Caption | 12 | Regular | Ayudas y metadatos |

## 5. Espaciado

| Token | Valor |
|---|---:|
| xs | 6 |
| sm | 10 |
| md | 16 |
| lg | 24 |
| xl | 36 |
| xxl | 52 |

## 6. Radios

| Token | Valor |
|---|---:|
| xs | 4 |
| sm | 10 |
| md | 14 |
| lg | 20 |
| xl | 28 |
| round | 999 |

## 7. Componentes principales

### Boton primario

Uso: acciones principales como crear cuenta, iniciar sesion, crear look o continuar.

Caracteristicas:

- Fondo dorado `#C9A84C`.
- Texto oscuro.
- Borde redondeado.
- Peso tipografico alto.

### Boton secundario

Uso: acciones alternativas como volver, crear desde favoritos o filtros.

Caracteristicas:

- Fondo transparente o superficie.
- Borde dorado o texto dorado.
- Menor jerarquia que el primario.

### Cards de producto

Uso: mostrar prendas en catalogo, favoritos e inventario.

Elementos:

- Imagen.
- Categoria.
- Nombre.
- Precio.
- Estado favorito o seleccion.

### Cards de look

Uso: mostrar looks creados.

Elementos:

- Collage o imagenes de prendas.
- Nombre del look.
- Descripcion.
- Cantidad de prendas.
- Acciones de editar/eliminar.

### Formularios

Uso: login, registro, producto, perfil.

Lineamientos:

- Labels en mayuscula.
- Inputs sobre superficie oscura.
- Mensajes de error visibles.
- Validaciones antes de enviar.

### Banner offline

Uso: informar perdida de conexion.

Mensaje:

```text
Sin conexion - mostrando datos guardados localmente
```

## 8. Pantallas clave

| Pantalla | Proposito |
|---|---|
| Onboarding | Presentar la app |
| Login | Inicio de sesion |
| Register | Crear cuenta |
| GoogleRoleSelect | Completar perfil Google |
| UserHome | Inicio cliente |
| VendorHome | Inicio vendedor y metricas |
| AdminHome | Inicio administrador |
| GarmentGallery | Catalogo |
| GarmentDetail | Detalle de prenda |
| Favorites | Favoritos y creacion desde favoritos |
| Looks | Listado de looks |
| LookDetail | Detalle de look |
| InventoryManagement | Inventario vendedor |
| PurchaseRequests | Solicitudes de compra |

## 9. Recomendaciones de accesibilidad visual

- Mantener contraste alto entre texto y fondo.
- No usar dorado como unico indicador de estado.
- Agregar labels de accesibilidad a iconos.
- Mantener botones con area tactil minima de 44 x 44 px.
- Validar texto con tamanos de fuente aumentados.
- Revisar lectores de pantalla antes de publicacion.

## 10. Archivos fuente de diseno

Actualmente el repo contiene assets de aplicacion en `assets/`, incluyendo iconos usados por Expo. Si se requiere entrega formal de UI/UX en Figma, Sketch o Adobe XD, se recomienda crear un archivo fuente con:

- Paleta.
- Tipografia.
- Componentes.
- Pantallas principales.
- Flujo cliente.
- Flujo vendedor.
- Flujo administrador.

## 11. Conclusion

El UI Kit actual define una identidad coherente para una app de moda: fondo oscuro, acento dorado, texto marfil y cards visuales centradas en producto. La guia permite mantener consistencia visual y sirve como base para futuras mejoras de diseno.
