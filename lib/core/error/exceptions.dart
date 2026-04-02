// Excepciones técnicas que se lanzan en la capa Data
// y se capturan para convertirse en [Failure] antes de llegar al Domain.
//
// Flujo: DataSource lanza Exception → Repository la captura → retorna Left(Failure)

/// Excepción lanzada cuando el servidor responde con un error.
class ServerException implements Exception {
  final String message;
  final int? statusCode;

  const ServerException({this.message = 'Error del servidor', this.statusCode});

  @override
  String toString() => 'ServerException(message: $message, statusCode: $statusCode)';
}

/// Excepción lanzada cuando hay un error de almacenamiento local.
class CacheException implements Exception {
  final String message;

  const CacheException({this.message = 'Error de caché local'});

  @override
  String toString() => 'CacheException(message: $message)';
}

/// Excepción lanzada cuando no hay conexión a internet.
class NetworkException implements Exception {
  final String message;

  const NetworkException({this.message = 'Sin conexión a internet'});

  @override
  String toString() => 'NetworkException(message: $message)';
}
