type Factory<T> = () => T;

type Registration<T> =
  | { kind: 'singleton'; value: T }
  | { kind: 'factory'; factory: Factory<T> };

class ServiceLocator {
  private registry = new Map<string, Registration<unknown>>();

  registerSingleton<T>(token: string, value: T): void {
    this.registry.set(token, { kind: 'singleton', value });
  }

  registerFactory<T>(token: string, factory: Factory<T>): void {
    this.registry.set(token, { kind: 'factory', factory });
  }

  get<T>(token: string): T {
    const registration = this.registry.get(token);
    if (!registration) {
      throw new Error(`Dependency not registered: ${token}`);
    }

    if (registration.kind === 'singleton') {
      return registration.value as T;
    }

    return registration.factory() as T;
  }

  isRegistered(token: string): boolean {
    return this.registry.has(token);
  }
}

export const getIt = new ServiceLocator();
