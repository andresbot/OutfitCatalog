import 'package:flutter/material.dart';
import 'package:outfit_catalog/app.dart';
import 'package:outfit_catalog/core/di/injection_container.dart';

/// Entry point de la aplicación Outfit Catalog.
///
/// Inicializa:
/// 1. Bindings de Flutter (necesario para código async antes de runApp)
/// 2. Inyección de dependencias (get_it)
/// 3. La aplicación (App widget)
void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializar inyección de dependencias
  await initDependencies();

  runApp(const App());
}
