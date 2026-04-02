// Clases Failure para manejo de errores con Either de dartz.

/// Clase base abstracta para representar fallos en la aplicación.
///
/// Se usa con [Either<Failure, T>] de dartz para manejar errores
/// de forma funcional sin lanzar excepciones.
///
/// Ejemplo de uso:
/// ```dart
/// Future<Either<Failure, List<Garment>>> getGarments();
/// ```
abstract class Failure {
  final String message;
  final int? code;

  const Failure({required this.message, this.code});

  @override
  String toString() => 'Failure(message: $message, code: $code)';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Failure &&
          runtimeType == other.runtimeType &&
          message == other.message &&
          code == other.code;

  @override
  int get hashCode => message.hashCode ^ code.hashCode;
}

/// Fallo originado en el servidor / API remota.
class ServerFailure extends Failure {
  const ServerFailure({super.message = 'Error del servidor', super.code});
}

/// Fallo originado en el almacenamiento local (SQLite, SharedPreferences, etc.).
class CacheFailure extends Failure {
  const CacheFailure({super.message = 'Error de caché local', super.code});
}

/// Fallo por falta de conexión a internet.
class NetworkFailure extends Failure {
  const NetworkFailure({super.message = 'Sin conexión a internet', super.code});
}

/// Fallo de autenticación (token expirado, credenciales inválidas, etc.).
class AuthFailure extends Failure {
  const AuthFailure({super.message = 'Error de autenticación', super.code});
}

/// Fallo genérico / inesperado.
class UnexpectedFailure extends Failure {
  const UnexpectedFailure({super.message = 'Error inesperado', super.code});
}
