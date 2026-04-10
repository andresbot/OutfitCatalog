# Arquitectura del Proyecto

## Contexto

La app esta construida en React Native + Expo y usa MVVM + Clean Architecture para tener separacion clara de responsabilidades.

El objetivo es que cada feature sea escalable, testeable y facil de mantener.

## Principios

- `domain` no depende de capas externas
- `data` implementa contratos definidos en `domain`
- `presentation` consume casos de uso y no accede a datos crudos
- dependencias registradas en un solo punto

## Diagrama de capas

```text
Presentation  ->  Domain  <-  Data
```

- `presentation`: pantallas + viewmodels
- `domain`: entidades + contratos + casos de uso
- `data`: datasource + DTOs + implementaciones concretas

## Implementacion actual

### Base de datos local

- `expo-sqlite` maneja la persistencia local
- `src/core/database/database.ts` centraliza la apertura, migraciones y seed inicial
- Tablas actuales: `garments`, `looks`, `look_items` y `favorites`
- El feature `garment` sigue consumiendo un repositorio; solo cambio el origen de datos

### Feature garment

Domain:

- `Garment` (entidad)
- `GarmentRepository` (contrato)
- `GetGarmentsUseCase`
- `GetGarmentByIdUseCase`
- `GetGarmentCategoriesUseCase`

Data:

- `GarmentLocalDataSource` + `GarmentLocalDataSourceImpl`
- `GarmentModel`
- `GarmentRepositoryImpl`
- Persistencia respaldada por SQLite en lugar de datos en memoria

Presentation:

- `useGarmentGalleryViewModel`
- `useGarmentDetailViewModel`
- `GarmentGalleryScreen`
- `GarmentDetailScreen`

## Inyeccion de dependencias

Se usa un service locator propio inspirado en `get_it`.

Archivos:

- `src/core/di/getIt.ts`
- `src/core/di/injectionContainer.ts`

Bootstrap:

- `App.tsx` llama `initDependencies()` al iniciar.

Orden de registro:

1. Datasource
2. Repositorio concreto como contrato abstracto
3. Casos de uso
4. Consumo desde ViewModels

## Estructura de carpetas

```text
src/
├── auth/
├── components/
├── core/
│   └── di/
├── features/
│   └── garment/
│       ├── data/
│       │   ├── datasources/
│       │   ├── models/
│       │   └── repositories/
│       ├── domain/
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── usecases/
│       └── presentation/
│           ├── utils/
│           └── viewmodels/
├── screens/
├── theme.ts
└── types.ts
```

## Flujo de datos

1. La pantalla llama al ViewModel.
2. El ViewModel dispara casos de uso.
3. El caso de uso consulta el contrato del repositorio.
4. El repositorio concreto obtiene y transforma datos del datasource.
5. El resultado vuelve al ViewModel y luego a la UI.

## Convenciones

- Entidad: `X`
- Repositorio abstracto: `XRepository`
- Repositorio concreto: `XRepositoryImpl`
- Caso de uso: `AccionXUseCase`
- ViewModel: `useXViewModel` o `XViewModel`

## Roadmap tecnico

- Aplicar la misma estructura en `auth` y `look`
- Introducir capa de errores tipados en domain/data
- Incorporar tests unitarios por capa y cobertura de migraciones SQLite
