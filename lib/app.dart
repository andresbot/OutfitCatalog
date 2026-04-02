import 'package:flutter/material.dart';
import 'package:outfit_catalog/core/theme/app_theme.dart';

/// Widget raíz de la aplicación Outfit Catalog.
///
/// Configura:
/// - [MaterialApp] con routing
/// - Temas claro y oscuro
/// - Providers de ViewModels (cuando se implementen)
class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Outfit Catalog',
      debugShowCheckedModeBanner: false,

      // ─── Temas ──────────────────────────────────────
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,

      // ─── Pantalla inicial ───────────────────────────
      // TODO: Reemplazar con el router (go_router) cuando se implemente navegación
      home: const Scaffold(
        body: Center(
          child: Text('Outfit Catalog — Clean Architecture'),
        ),
      ),
    );
  }
}
