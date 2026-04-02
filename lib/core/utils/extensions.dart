import 'package:flutter/material.dart';

/// Extensiones útiles para tipos comunes en la aplicación.

/// Extensiones sobre [String].
extension StringExtensions on String {
  /// Capitaliza la primera letra del string.
  String get capitalize =>
      isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';

  /// Capitaliza cada palabra del string.
  String get capitalizeWords =>
      split(' ').map((word) => word.capitalize).join(' ');
}

/// Extensiones sobre [BuildContext] para acceso rápido.
extension ContextExtensions on BuildContext {
  /// Acceso rápido a [ThemeData].
  ThemeData get theme => Theme.of(this);

  /// Acceso rápido a [ColorScheme].
  ColorScheme get colorScheme => Theme.of(this).colorScheme;

  /// Acceso rápido a [TextTheme].
  TextTheme get textTheme => Theme.of(this).textTheme;

  /// Acceso rápido a [MediaQueryData].
  MediaQueryData get mediaQuery => MediaQuery.of(this);

  /// Ancho de la pantalla.
  double get screenWidth => mediaQuery.size.width;

  /// Alto de la pantalla.
  double get screenHeight => mediaQuery.size.height;

  /// Mostrar un [SnackBar] rápidamente.
  void showSnackBar(String message, {bool isError = false}) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError
            ? Theme.of(this).colorScheme.error
            : Theme.of(this).colorScheme.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }
}

/// Extensiones sobre [num] para formateo de precios.
extension NumExtensions on num {
  /// Formatea el número como precio en COP.
  String get toCOP => '\$${toStringAsFixed(0).replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (Match m) => '${m[1]}.',
      )}';
}
