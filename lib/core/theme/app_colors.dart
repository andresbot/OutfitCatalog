import 'package:flutter/material.dart';

/// Paleta de colores centralizada de Outfit Catalog.
///
/// Todos los colores de la aplicación deben referenciarse desde aquí
/// para mantener consistencia visual y facilitar cambios de tema.
abstract class AppColors {
  // ─── Primarios ────────────────────────────────────
  static const Color primary = Color(0xFF6C63FF);
  static const Color primaryLight = Color(0xFF9D97FF);
  static const Color primaryDark = Color(0xFF4A42DB);

  // ─── Secundarios ──────────────────────────────────
  static const Color secondary = Color(0xFFFF6584);
  static const Color secondaryLight = Color(0xFFFF8FA3);
  static const Color secondaryDark = Color(0xFFD94A66);

  // ─── Fondos ───────────────────────────────────────
  static const Color background = Color(0xFFF8F9FE);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color backgroundDark = Color(0xFF1A1A2E);
  static const Color surfaceDark = Color(0xFF16213E);

  // ─── Texto ────────────────────────────────────────
  static const Color textPrimary = Color(0xFF2D2D3A);
  static const Color textSecondary = Color(0xFF7C7C8A);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textPrimaryDark = Color(0xFFF0F0F0);
  static const Color textSecondaryDark = Color(0xFFB0B0C0);

  // ─── Estados ──────────────────────────────────────
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFFC107);
  static const Color error = Color(0xFFEF5350);
  static const Color info = Color(0xFF29B6F6);

  // ─── Bordes y divisores ───────────────────────────
  static const Color border = Color(0xFFE0E0E8);
  static const Color divider = Color(0xFFF0F0F5);
  static const Color borderDark = Color(0xFF2A2A4A);
}
