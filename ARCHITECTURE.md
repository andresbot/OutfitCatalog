# Arquitectura del Proyecto — Outfit Catalog

## 🏛️ Patrón: MVVM + Clean Architecture

Este proyecto implementa **MVVM (Model-View-ViewModel)** combinado con **Clean Architecture** para lograr:

- **Separación de responsabilidades** clara entre capas
- **Testabilidad** en cada capa de forma independiente
- **Escalabilidad** al agregar nuevos features sin afectar los existentes
- **Mantenibilidad** con código organizado y predecible

---

## 📐 Diagrama de Capas

```
┌───────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                   │
│                                                       │
│   ┌─────────┐    ┌──────────────┐    ┌──────────┐    │
│   │  Pages  │───▶│  ViewModels  │    │ Widgets  │    │
│   │ (Views) │    │(ChangeNotify)│    │(Reusable)│    │
│   └─────────┘    └──────┬───────┘    └──────────┘    │
│                         │                             │
├─────────────────────────┼─────────────────────────────┤
│                         ▼                             │
│                    DOMAIN LAYER                       │
│                   (Capa Central)                      │
│                                                       │
│   ┌──────────┐   ┌──────────┐   ┌────────────────┐   │
│   │ Entities │   │Use Cases │──▶│  Repository    │   │
│   │  (Pure)  │   │ (Lógica) │   │  (Contracts)   │   │
│   └──────────┘   └──────────┘   └────────┬───────┘   │
│                                          │ abstract   │
├──────────────────────────────────────────┼────────────┤
│                                          ▼            │
│                     DATA LAYER                        │
│                                                       │
│   ┌─────────────┐   ┌────────┐   ┌──────────────┐   │
│   │  Repository  │   │ Models │   │ Data Sources │   │
│   │    (Impl)    │   │ (DTOs) │   │ (Local/API)  │   │
│   └─────────────┘   └────────┘   └──────────────┘   │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### Regla de Dependencia (Dependency Rule)

```
Presentation ──▶ Domain ◀── Data
```

- **Domain** es el centro y **NO depende de ninguna otra capa**.
- **Presentation** depende de Domain (usa Use Cases y Entities).
- **Data** depende de Domain (implementa los contratos de Repository).
- Las capas externas **nunca** son importadas por las capas internas.

---

## 📁 Estructura de Carpetas

```
lib/
├── main.dart                              # Entry point: inicializa DI y corre la app
├── app.dart                               # Widget raíz: MaterialApp, temas, routing
│
├── core/                                  # 🔧 Código compartido entre features
│   ├── di/
│   │   └── injection_container.dart       # Configuración de get_it (Service Locator)
│   ├── error/
│   │   ├── failures.dart                  # Clases Failure para Either<Failure, T>
│   │   └── exceptions.dart                # Excepciones técnicas (capa Data)
│   ├── usecases/
│   │   └── usecase.dart                   # Clase base abstracta UseCase<Type, Params>
│   ├── theme/
│   │   ├── app_theme.dart                 # ThemeData claro y oscuro
│   │   ├── app_colors.dart                # Paleta de colores centralizada
│   │   └── text_styles.dart               # Estilos tipográficos
│   ├── constants/
│   │   └── app_constants.dart             # Constantes globales
│   └── utils/
│       └── extensions.dart                # Extensiones de Dart/Flutter
│
├── features/                              # 📦 Organizado por feature (vertical slicing)
│   ├── garment/                           # Feature: Catálogo de Prendas
│   │   ├── data/
│   │   │   ├── datasources/               # Fuentes de datos (SQLite, API, memoria)
│   │   │   ├── models/                    # DTOs con toJson/fromJson/toEntity
│   │   │   └── repositories/             # Implementaciones concretas de repos
│   │   ├── domain/
│   │   │   ├── entities/                  # Entidades puras del negocio
│   │   │   ├── repositories/             # Contratos abstractos de repos
│   │   │   └── usecases/                 # Casos de uso (1 acción = 1 use case)
│   │   └── presentation/
│   │       ├── viewmodels/               # ViewModels (ChangeNotifier)
│   │       ├── pages/                    # Pantallas/Vistas
│   │       └── widgets/                  # Widgets reutilizables del feature
│   │
│   ├── look/                              # Feature: Looks / Conjuntos
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   ├── models/
│   │   │   └── repositories/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── viewmodels/
│   │       ├── pages/
│   │       └── widgets/
│   │
│   └── auth/                              # Feature: Autenticación
│       ├── data/
│       │   ├── datasources/
│       │   ├── models/
│       │   └── repositories/
│       ├── domain/
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── usecases/
│       └── presentation/
│           ├── viewmodels/
│           ├── pages/
│           └── widgets/
│
└── shared/                                # Widgets compartidos entre features
    └── widgets/
```

---

## 🧩 Descripción de cada Capa

### Domain Layer (Capa Central)

La capa más importante. Contiene la **lógica de negocio pura** sin dependencias externas.

| Componente | Responsabilidad | Ejemplo |
|------------|----------------|---------|
| **Entities** | Objetos de negocio puros, inmutables | `Garment`, `Look`, `Vendor` |
| **Repositories** | Contratos abstractos (interfaces) | `abstract class GarmentRepository` |
| **Use Cases** | Una acción de negocio encapsulada | `GetGarments`, `CreateLook` |

Los Use Cases retornan `Either<Failure, T>` usando `dartz` para manejo funcional de errores:

```dart
abstract class UseCase<Type, Params> {
  Future<Either<Failure, Type>> call(Params params);
}
```

### Data Layer

Implementa los contratos definidos en Domain. Maneja la comunicación con fuentes de datos.

| Componente | Responsabilidad | Ejemplo |
|------------|----------------|---------|
| **Models** | DTOs con serialización (JSON ↔ Entity) | `GarmentModel` con `toJson()`, `toEntity()` |
| **Data Sources** | Acceso directo a datos (DB, API, etc.) | `GarmentLocalDataSource` |
| **Repositories** | Implementación concreta de los contracts | `GarmentRepositoryImpl` |

**Flujo de errores en Data:**
```
DataSource lanza Exception → Repository captura → Retorna Left(Failure)
```

### Presentation Layer

Muestra datos al usuario y captura interacciones. Usa **MVVM** con `ChangeNotifier`.

| Componente | Responsabilidad | Ejemplo |
|------------|----------------|---------|
| **ViewModels** | Estado reactivo, lógica de presentación | `GarmentViewModel extends ChangeNotifier` |
| **Pages** | Pantallas que consumen ViewModels | `GarmentListPage` |
| **Widgets** | Componentes UI reutilizables | `GarmentCard` |

---

## 💉 Inyección de Dependencias (get_it)

Usamos `get_it` como **Service Locator** para inyectar dependencias:

```dart
final sl = GetIt.instance;

// Registrar en orden: External → DataSources → Repos → UseCases → ViewModels
Future<void> initDependencies() async {
  // Data Sources
  sl.registerLazySingleton<GarmentLocalDataSource>(
    () => GarmentLocalDataSourceImpl(),
  );

  // Repositories (registrar con el tipo abstracto)
  sl.registerLazySingleton<GarmentRepository>(
    () => GarmentRepositoryImpl(localDataSource: sl()),
  );

  // Use Cases
  sl.registerLazySingleton(() => GetGarments(sl()));

  // ViewModels (Factory = nueva instancia por pantalla)
  sl.registerFactory(() => GarmentViewModel(getGarments: sl()));
}
```

### ¿Por qué `registerFactory` para ViewModels?

Cada pantalla necesita su propia instancia del ViewModel. Si fuera Singleton, todas las pantallas compartirían el mismo estado.

### ¿Por qué `registerLazySingleton` para Repos y UseCases?

Son stateless — una sola instancia es suficiente y más eficiente en memoria.

---

## 📐 Convenciones de Nombrado

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Entity | Nombre del concepto | `Garment` |
| Model (DTO) | `<Entity>Model` | `GarmentModel` |
| Repository (abstract) | `<Entity>Repository` | `GarmentRepository` |
| Repository (impl) | `<Entity>RepositoryImpl` | `GarmentRepositoryImpl` |
| Use Case | Verbo + Sustantivo | `GetGarments`, `CreateLook` |
| ViewModel | `<Entity>ViewModel` | `GarmentViewModel` |
| Page | `<Entity><Acción>Page` | `GarmentListPage` |
| Data Source | `<Entity><Tipo>DataSource` | `GarmentLocalDataSource` |

---

## 🆕 Guía: Agregar un Nuevo Feature

1. **Crear la estructura de carpetas** dentro de `features/<nombre>/`:
   ```
   features/nuevo_feature/
   ├── data/
   │   ├── datasources/
   │   ├── models/
   │   └── repositories/
   ├── domain/
   │   ├── entities/
   │   ├── repositories/
   │   └── usecases/
   └── presentation/
       ├── viewmodels/
       ├── pages/
       └── widgets/
   ```

2. **Domain primero** (sin dependencias):
   - Crear la Entity
   - Definir el Repository contract (abstract class)
   - Crear los Use Cases necesarios

3. **Data después** (implementa Domain):
   - Crear el Model (DTO) con mapeo a Entity
   - Implementar el Data Source
   - Implementar el Repository concreto

4. **Presentation al final** (consume Domain):
   - Crear el ViewModel con los Use Cases inyectados
   - Crear Pages y Widgets

5. **Registrar en DI**: Agregar todas las dependencias en `injection_container.dart`

---

## 📦 Dependencias Principales

```yaml
# Arquitectura
get_it: ^8.0.3         # Service Locator / Inyección de dependencias
provider: ^6.1.2       # State management en widget tree

# Programación Funcional
dartz: ^0.10.1         # Either<Failure, T> para manejo de errores
```

---

## 🧪 Estrategia de Testing

| Capa | Tipo de Test | Qué se testea |
|------|-------------|---------------|
| **Domain** | Unit Test | Use Cases (lógica pura) |
| **Data** | Unit Test | Models (serialización), Repositories (con mocks) |
| **Presentation** | Widget Test | Pages y Widgets con ViewModels mockeados |
| **E2E** | Integration Test | Flujos completos de usuario |

---

## 🔄 Flujo de Datos (End-to-End)

```
Usuario toca botón
       │
       ▼
   Page detecta evento
       │
       ▼
   ViewModel.método()          ← Presentation
       │
       ▼
   UseCase.call(params)        ← Domain
       │
       ▼
   Repository.método()         ← Domain (contract) → Data (impl)
       │
       ▼
   DataSource.query()          ← Data
       │
       ▼
   Retorna datos / Exception
       │
       ▼
   Repository convierte a Either<Failure, T>
       │
       ▼
   UseCase retorna Either
       │
       ▼
   ViewModel actualiza estado + notifyListeners()
       │
       ▼
   Page se reconstruye con nuevos datos
```
