# Outfit Catalog

**Outfit Catalog** es una aplicación móvil para vendedores que permite crear un catálogo digital de prendas, armar "looks" (conjuntos) y compartirlos directamente por WhatsApp.

## Estado Actual Del Repositorio

Actualmente conviven dos implementaciones:

- App Flutter (estructura Clean Architecture documentada en este README).
- App React Native con Expo en la carpeta [rn-mobile](rn-mobile), enfocada en flujo de autenticación por rol y catálogo inicial.

Si quieres revisar el detalle técnico de la implementación en React Native, consulta [rn-mobile/README.md](rn-mobile/README.md).

## App React Native (Expo)

### Stack

- Expo 54
- React 19
- React Native 0.81
- TypeScript 5.9
- React Navigation

### Ejecución

```bash
cd rn-mobile
npm install
npx expo start
```

Scripts disponibles en rn-mobile:

- npm run start
- npm run android
- npm run ios
- npm run web

## 🏛️ Arquitectura

El proyecto implementa **MVVM + Clean Architecture** con 3 capas bien definidas:

| Capa | Responsabilidad | Patrón |
|------|----------------|--------|
| **Presentation** | UI, estado reactivo | ViewModels (`ChangeNotifier`) + Pages |
| **Domain** | Lógica de negocio pura | Entities, Use Cases, Repository contracts |
| **Data** | Acceso a datos | Models (DTOs), Data Sources, Repository impl |

📖 **Documentación completa de arquitectura:** [ARCHITECTURE.md](./ARCHITECTURE.md)

### Stack Técnico

| Tecnología | Propósito |
|-----------|-----------|
| `get_it` | Inyección de dependencias (Service Locator) |
| `provider` | State management en widget tree |
| `dartz` | `Either<Failure, T>` para manejo funcional de errores |

### Estructura de Features

Cada feature sigue la misma estructura de 3 capas:

```
features/<nombre>/
├── data/          → datasources, models, repositories (impl)
├── domain/        → entities, repositories (contracts), usecases
└── presentation/  → viewmodels, pages, widgets
```

## 🎯 Funcionalidades Clave

### 1. Catálogo Digital de Prendas
- CRUD completo de prendas (crear, leer, actualizar, eliminar)
- Subir y gestionar fotos de prendas
- Categorizar prendas (tops, pantalones, accesorios, etc.)
- Asignar precio, talla y color
- Filtrar por categoría, color o rango de precio
- Gestión de stock

### 2. Crear Looks (Outfits/Conjuntos)
- Seleccionar múltiples prendas del catálogo
- Visualizar el look en tiempo real
- Guardar looks como favoritos
- Calcular precio total del look

### 3. Compartir por WhatsApp
- Generar imagen visual del look
- Mensaje automático personalizado
- Enviar directamente por WhatsApp

### 4. Autenticación de Vendedor
- Registro e inicio de sesión
- Perfil del vendedor con datos personales
- Número de WhatsApp asociado

## 📋 Requisitos Previos

- Flutter 3.11.0 o superior
- Dart 3.11.0 o superior
- IDE: VS Code o Android Studio
- Android SDK 21+ o iOS 11.0+

## 🚀 Instalación

```bash
# 1. Instalar dependencias
flutter pub get

# 2. Ejecutar la app
flutter run
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

## 🐛 Debugging

```bash
# Ejecutar con logs detallados
flutter run -v

# Limpiar caché
flutter clean
flutter pub get

# Analizar código
flutter analyze
```

## 📦 Convención de Ramas

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Feature | `feat/US-XX-descripcion` | `feat/US-04-clean-architecture` |
| Bugfix | `fix/descripcion` | `fix/garment-serialization` |
| Hotfix | `hotfix/descripcion` | `hotfix/crash-on-launch` |
