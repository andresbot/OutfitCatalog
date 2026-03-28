# Arquitectura del Proyecto - Outfit Catalog

## 📁 Estructura de Carpetas

```
outfit_catalog/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   │
│   ├── models/
│   │   ├── garment.dart              # Prenda individual
│   │   ├── look.dart                 # Look (conjunto de prendas)
│   │   ├── catalog.dart              # Catálogo del vendedor
│   │   ├── vendor.dart               # Información del vendedor
│   │   └── look_share.dart           # Datos para compartir por WhatsApp
│   │
│   ├── providers/
│   │   ├── catalog_provider.dart      # State de catálogo
│   │   ├── look_provider.dart         # State de looks en creación
│   │   ├── vendor_provider.dart       # State de vendedor
│   │   └── settings_provider.dart     # State de configuración
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── login_screen.dart
│   │   │   └── register_screen.dart
│   │   │
│   │   ├── dashboard/
│   │   │   └── dashboard_screen.dart
│   │   │
│   │   ├── catalog/
│   │   │   ├── catalog_list_screen.dart      # Ver prendas
│   │   │   ├── garment_detail_screen.dart    # Detalle de prenda
│   │   │   ├── add_garment_screen.dart       # Agregar prenda
│   │   │   └── edit_garment_screen.dart      # Editar prenda
│   │   │
│   │   ├── looks/
│   │   │   ├── looks_list_screen.dart        # Ver looks guardados
│   │   │   ├── create_look_screen.dart       # Armar nuevo look
│   │   │   ├── look_detail_screen.dart       # Ver look armado
│   │   │   └── look_preview_screen.dart      # Preview antes de compartir
│   │   │
│   │   ├── sharing/
│   │   │   ├── share_options_screen.dart     # Opciones de envío
│   │   │   ├── whatsapp_share_screen.dart    # Preparar para WhatsApp
│   │   │   └── share_confirmation_screen.dart
│   │   │
│   │   └── profile/
│   │       ├── profile_screen.dart           # Perfil del vendedor
│   │       └── settings_screen.dart          # Configuración
│   │
│   ├── widgets/
│   │   ├── catalog/
│   │   │   ├── garment_card.dart             # Card de prenda
│   │   │   ├── garment_grid.dart             # Grid de prendas
│   │   │   └── garment_filter.dart           # Filtros de prendas
│   │   │
│   │   ├── looks/
│   │   │   ├── look_item_selector.dart       # Selector de prendas para look
│   │   │   ├── look_preview_card.dart        # Preview del look
│   │   │   ├── color_picker.dart             # Selector de colores
│   │   │   └── look_canvas.dart              # Visor de look (grid visual)
│   │   │
│   │   ├── shared/
│   │   │   ├── loading_widget.dart
│   │   │   ├── error_widget.dart
│   │   │   ├── empty_state_widget.dart
│   │   │   └── custom_app_bar.dart
│   │   │
│   │   └── common/
│   │       ├── image_picker_widget.dart      # Para fotos de prendas
│   │       ├── category_badge.dart
│   │       └── price_display.dart
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── api_client.dart
│   │   │   ├── garment_service.dart
│   │   │   ├── look_service.dart
│   │   │   └── vendor_service.dart
│   │   │
│   │   ├── storage/
│   │   │   ├── local_storage_service.dart    # SQLite/Hive para datos locales
│   │   │   ├── image_storage_service.dart    # Guardar imágenes
│   │   │   └── preferences_service.dart      # SharedPreferences
│   │   │
│   │   └── integration/
│   │       ├── whatsapp_service.dart         # Integración WhatsApp
│   │       ├── share_service.dart            # Servicios de compartir
│   │       └── image_generator_service.dart  # Generar imágenes de looks
│   │
│   ├── config/
│   │   ├── theme/
│   │   │   ├── app_theme.dart
│   │   │   ├── app_colors.dart
│   │   │   └── text_styles.dart
│   │   │
│   │   ├── routes/
│   │   │   └── app_routes.dart
│   │   │
│   │   ├── constants/
│   │   │   ├── app_constants.dart
│   │   │   ├── api_constants.dart
│   │   │   └── garment_categories.dart       # Categorías predefinidas
│   │   │
│   │   └── environment/
│   │       └── config.dart
│   │
│   ├── utils/
│   │   ├── validators.dart
│   │   ├── formatters.dart
│   │   ├── dialog_utils.dart
│   │   ├── image_utils.dart                  # Utilidades de imagen
│   │   ├── whatsapp_utils.dart               # Generar links WhatsApp
│   │   └── extensions.dart
│   │
│   └── exceptions/
│       └── app_exceptions.dart
│
├── assets/
│   ├── images/
│   │   ├── app_logo.png
│   │   ├── empty_states/
│   │   └── illustrations/
│   │
│   ├── icons/
│   │   ├── categories/
│   │   └── custom_icons.ttf
│   │
│   └── fonts/
│
├── android/
├── ios/
├── web/
├── windows/
├── macos/
├── linux/
│
└── pubspec.yaml
```

## 🔄 Flujo de Datos

```
┌─────────────────┐
│   Login/Auth    │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│ Dashboard (Home Screen) │
└────────┬────────────────┘
         │
    ┌────┼────┬────────────────┐
    │    │    │                │
    ↓    ↓    ↓                ↓
┌──────┐  │   │           ┌─────────┐
│Catálogo  │   │           │ Perfil  │
└──────┘  │   │           └─────────┘
    │    │    │
    ↓    ↓    ↓
    ├─→ Ver/Agregar Prendas
    │   ├─ Foto
    │   ├─ Nombre
    │   ├─ Precio
    │   ├─ Talla
    │   ├─ Color
    │   └─ Categoría
    │
    ├─→ Crear Look (Armar conjunto)
    │   ├─ Seleccionar 3-5 prendas
    │   ├─ Preview visual
    │   ├─ Nombre y descripción
    │   └─ Guardar/Compartir
    │
    └─→ Compartir por WhatsApp
        ├─ Generar imagen del look
        ├─ Mensaje personalizado
        └─ Enviar por WhatsApp
```

## 🎨 Configuración Visual

### Theme System
- `AppTheme` - Temas claro y oscuro
- `AppColors` - Paleta de colores
- `TextStyles` - Estilos de texto

## 🔐 Flujo de Autenticación

```
1. Login Screen
   ↓
2. Validar credenciales
   ↓
3. Guardar token local
   ↓
4. Cargar datos del vendedor
   ↓
5. Ir a Dashboard
```

## 💾 Estrategia de Almacenamiento

```
Local (SQLite/Hive)
├─ Prendas (catálogo)
├─ Looks (conjuntos guardados)
├─ Configuración de vendedor
└─ Preferencias de app

Network (API Backend)
├─ Autenticación
├─ Sincronización de datos
└─ Historial de compartidos
```

## 📦 Dependencias Principales

```yaml
- provider: ^6.0.0              # State management
- go_router: ^10.0.0            # Navegación
- sqflite: ^2.3.0               # Base de datos local
- image_picker: ^1.0.0          # Seleccionar fotos
- cached_network_image: ^3.3.0  # Caché de imágenes
- url_launcher: ^6.1.0          # Abrir WhatsApp
- share_plus: ^7.0.0            # Compartir
- dio: ^5.3.0                   # HTTP requests
- shared_preferences: ^2.2.0    # Key-value storage
- intl: ^0.18.0                 # Internacionalización
- google_fonts: ^6.0.0          # Fuentes
```

## 🚀 Flujo de Desarrollo

1. **Capas inferiores primero**
   - Models → Services → Providers → Screens

2. **Separación clara de responsabilidades**
   - Screens solo llamar a Providers
   - Providers manejar lógica de negocio
   - Services comunicar con API/BD

3. **Testing**
   - Unit tests para Services
   - Widget tests para Widgets
   - Integration tests para flujos completos
```
