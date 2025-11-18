import { UserAccountRepository } from '../../application/ports/UserAccountRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';

/**
 * Repositorio en memoria pensado para pruebas de integración y documentación.
 * Mantiene las entidades en un Map usando el email normalizado como clave.
 */
export class InMemoryUserAccountRepository implements UserAccountRepository {
  private readonly store = new Map<string, User>();

  constructor(seed: Iterable<User> = []) {
    for (const user of seed) {
      this.seed(user);
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.store.get(this.normalize(email.value)) ?? null;
  }

  async save(user: User): Promise<void> {
    this.store.set(this.normalize(user.email.value), user);
  }

  seed(user: User): void {
    this.store.set(this.normalize(user.email.value), user);
  }

  list(): User[] {
    return [...this.store.values()];
  }

  clear(): void {
    this.store.clear();
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }
}
