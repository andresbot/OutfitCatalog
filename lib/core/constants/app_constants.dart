/// Constantes globales de la aplicación Outfit Catalog.
abstract class AppConstants {
  /// Nombre de la aplicación.
  static const String appName = 'Outfit Catalog';

  /// Versión de la aplicación.
  static const String appVersion = '1.0.0';

  // ─── Categorías de prendas ────────────────────────
  static const List<String> garmentCategories = [
    'Tops',
    'Pantalones',
    'Vestidos',
    'Faldas',
    'Zapatos',
    'Accesorios',
    'Abrigos',
    'Ropa Interior',
    'Otros',
  ];

  // ─── Tallas disponibles ───────────────────────────
  static const List<String> availableSizes = [
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    'Única',
  ];

  // ─── Límites ──────────────────────────────────────
  static const int maxGarmentsPerLook = 10;
  static const int minGarmentsPerLook = 2;
  static const int maxImageSizeMB = 5;
}
