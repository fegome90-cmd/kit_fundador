import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';

/**
 * Puerto que abstrae la persistencia de cuentas para el use case RegisterUserAccount.
 * Las implementaciones reales viven en la capa de infraestructura del consumidor.
 */
export interface UserAccountRepository {
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}

export class UserAccountAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`UserAccount with email ${email} already exists`);
    this.name = 'UserAccountAlreadyExistsError';
  }
}
