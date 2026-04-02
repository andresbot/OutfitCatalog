import 'package:dartz/dartz.dart';
import 'package:outfit_catalog/core/error/failures.dart';

/// Contrato base para todos los Use Cases de la aplicación.
///
/// Cada use case encapsula una única acción de negocio y retorna
/// [Either<Failure, Type>] para manejar errores de forma funcional.
///
/// - [Type]: Tipo de dato que retorna en caso de éxito.
/// - [Params]: Parámetros que recibe el use case. Usar [NoParams] si no necesita.
///
/// Ejemplo de implementación:
/// ```dart
/// class GetGarments implements UseCase<List<Garment>, NoParams> {
///   final GarmentRepository repository;
///
///   GetGarments(this.repository);
///
///   @override
///   Future<Either<Failure, List<Garment>>> call(NoParams params) {
///     return repository.getGarments();
///   }
/// }
/// ```
abstract class UseCase<Type, Params> {
  Future<Either<Failure, Type>> call(Params params);
}

/// Clase para use cases que no requieren parámetros.
class NoParams {
  const NoParams();

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is NoParams;

  @override
  int get hashCode => 0;
}
