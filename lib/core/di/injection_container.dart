import 'package:get_it/get_it.dart';

/// Instancia global del Service Locator.
///
/// Usar `sl<Tipo>()` para resolver dependencias en cualquier parte de la app.
/// Ejemplo: `final viewModel = sl<GarmentViewModel>();`
final sl = GetIt.instance;

/// Inicializa todas las dependencias de la aplicación.
///
/// Se debe llamar en [main()] antes de [runApp()].
///
/// Orden de registro:
/// 1. External (paquetes externos, DB, APIs)
/// 2. Data Sources
/// 3. Repositories
/// 4. Use Cases
/// 5. ViewModels
///
/// Ejemplo al agregar un nuevo feature:
/// ```dart
/// // ─── Feature: Garment ──────────────────────────
/// // Data Sources
/// sl.registerLazySingleton<GarmentLocalDataSource>(
///   () => GarmentLocalDataSourceImpl(),
/// );
///
/// // Repositories
/// sl.registerLazySingleton<GarmentRepository>(
///   () => GarmentRepositoryImpl(localDataSource: sl()),
/// );
///
/// // Use Cases
/// sl.registerLazySingleton(() => GetGarments(sl()));
///
/// // ViewModels (registerFactory para nueva instancia por pantalla)
/// sl.registerFactory(() => GarmentViewModel(getGarments: sl()));
/// ```
Future<void> initDependencies() async {
  //
  // ─── External ────────────────────────────────────
  // TODO: Registrar dependencias externas (DB, SharedPreferences, Dio, etc.)

  // ─── Feature: Garment ────────────────────────────
  // TODO: Registrar Data Sources, Repositories, Use Cases, ViewModels

  // ─── Feature: Look ───────────────────────────────
  // TODO: Registrar Data Sources, Repositories, Use Cases, ViewModels

  // ─── Feature: Auth ───────────────────────────────
  // TODO: Registrar Data Sources, Repositories, Use Cases, ViewModels
}
