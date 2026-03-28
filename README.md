# Outfit Catalog - Flutter App

**Outfit Catalog** es una aplicación móvil para vendedores que permite crear un catálogo digital de prendas, armar "looks" (conjuntos) y compartirlos directamente por WhatsApp.

## 🎯 Funcionalidades Clave

### 1. **Autenticación de Vendedor**
- Registro e inicio de sesión
- Perfil del vendedor con datos personales
- Número de WhatsApp asociado

### 2. **Catálogo Digital de Prendas**
- CRUD completo de prendas (crear, leer, actualizar, eliminar)
- Subir y gestionar fotos de prendas
- Categorizar prendas (tops, pantalones, accesorios, etc.)
- Asignar precio, talla y color
- Filtrar por categoría, color o rango de precio
- Gestión de stock

### 3. **Crear looks (Outfits/Conjuntos)**
- Seleccionar múltiples prendas del catálogo
- Visualizar el look en tiempo real
- Previsualización del conjunto armado
- Guardar looks como favoritos
- Editar y personalizar looks existentes
- Calcular precio total del look

### 4. **Compartir por WhatsApp**
- Generar imagen visual del look
- Mensaje automático personalizado con detalles del look
- Enviar directamente por WhatsApp
- Copiar información del look al portapapeles
- Historial de looks compartidos

### 5. **Gestión de Perfil**
- Editar información del vendedor
- Cambiar logo/foto de perfil
- Configurar número de WhatsApp
- Preferencias de la aplicación

### 6. **Almacenamiento Local**
- Base de datos local para prendas y looks
- Sincronización con servidor (opcional)
- Caché de imágenes

## 📋 Requisitos Previos

- Flutter 3.0.0 o superior
- Dart 3.0.0 o superior
- IDE: VS Code o Android Studio
- Android SDK 21+ o iOS 11.0+

## 🚀 Instalación

1. **Instalar dependencias:**
```bash
flutter pub get
```

2. **Generar archivos necesarios:**
```bash
flutter pub run build_runner build
```

## ▶️ Ejecución

```bash
# Modo debug
flutter run

# Especificar plataforma
flutter run -d linux    # Desktop Linux
flutter run -d chrome   # Web
flutter run -d emulator # Android Emulator

# Modo release
flutter run --release
```

## 📁 Estructura del Proyecto

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalles completos de la estructura.

## 📦 Dependencias Principales

- **provider** - State management
- **go_router** - Navegación
- **sqflite** - Base de datos local
- **image_picker** - Seleccionar fotos
- **cached_network_image** - Caché de imágenes
- **url_launcher** - Abrir WhatsApp
- **share_plus** - Compartir contenido
- **dio** - HTTP requests
- **shared_preferences** - Almacenamiento clave-valor

## 🐛 Debugging

```bash
# Ejecutar con logs detallados
flutter run -v

# Limpio de caché
flutter clean
flutter pub get
```

