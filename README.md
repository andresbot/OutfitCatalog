# Outfit Catalog (React Native + Expo)

Outfit Catalog es una aplicacion movil construida con React Native y Expo para gestionar prendas, navegar por catalogo y operar flujos por rol (user, vendor, admin).

## Estado del proyecto

- Base de aplicacion: Expo SDK 54
- UI y navegacion funcionales
- Arquitectura MVVM + Clean Architecture implementada para el feature `garment`
- Persistencia local con SQLite via `expo-sqlite`
- Inyeccion de dependencias configurada con un service locator estilo `getIt`

## Stack tecnico

- Expo SDK 54
- React Native 0.81
- TypeScript 5.9
- React Navigation (native stack)

## Requisitos

- Node.js LTS
- npm 10+
- Expo Go (opcional para dispositivo fisico)
- Proyecto Firebase con Firestore habilitado (opcional para sync remota)

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm run start
```

Scripts utiles:

- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run build`

## Configuracion Firebase (US-06)

La sincronizacion remota usa Firestore via variables de entorno `EXPO_PUBLIC_*`.

Define en tu entorno:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

Coleccion esperada en Firestore:

- `garments`

Campos por documento:

- `name` (string)
- `category` (string)
- `price` (number)
- `imageUrl` (string)
- `description` (string)
- `size` (string)
- `color` (string)
- `stock` (number)

## Estructura del codigo

```text
src/
├── auth/                      # Estado de autenticacion y contexto
├── components/                # Componentes compartidos de UI
├── core/
│   ├── database/              # Inicializacion, migraciones y esquema SQLite
│   └── di/                    # Contenedor de dependencias
├── features/
│   └── garment/
│       ├── data/              # Datasource, modelos y repositorio concreto
│       ├── domain/            # Entidades, contratos y casos de uso
│       └── presentation/      # ViewModels + utilidades de presentacion
├── screens/                   # Pantallas de la app
├── theme.ts                   # Tokens visuales
└── types.ts                   # Tipos compartidos de la app
```

## Arquitectura (US-04)

Se implemento MVVM + Clean Architecture para cumplir estos criterios:

- Capas `data`, `domain` y `presentation` separadas
- Repositorios abstractos con implementaciones concretas
- Inyeccion de dependencias centralizada
- Estructura documentada y mantenible
- Base local SQLite con tablas versionadas para `garments`, `looks`, `look_items` y `favorites`

Consulta detalles en [ARCHITECTURE.md](ARCHITECTURE.md).

## Proximos pasos recomendados

- Replicar el mismo patron de capas para `auth` y `look`
- Agregar tests unitarios para DAOs, repositorios y migraciones
- Separar commits por subtareas para trazabilidad del sprint
