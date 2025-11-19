import { DomainEvent } from '@domain/entities/DomainEvent';
import { User, UserRole } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { Password } from '@domain/value-objects/Password';

import {
  UserAccountAlreadyExistsError,
  UserAccountRepository,
} from '../../ports/UserAccountRepository';
import { RegisterUserAccountCommand } from './RegisterUserAccountCommand';

export interface RegisterUserAccountHandlerDeps {
  userAccountRepository: UserAccountRepository;
}

export interface RegisterUserAccountResult {
  userSnapshot: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    emailVerified: boolean;
    createdAt: Date;
  };
  domainEvents: DomainEvent[];
}

/**
 * Handler principal para el caso de uso RegisterUserAccount.
 *
 * Orquesta los value objects, consulta el repositorio y retorna una vista reducida
 * del usuario creado junto con los domain events listos para ser despachados por
 * la capa de infraestructura del consumidor.
 */
export class RegisterUserAccountHandler {
  constructor(private readonly deps: RegisterUserAccountHandlerDeps) {}

  async execute(command: RegisterUserAccountCommand): Promise<RegisterUserAccountResult> {
    const email = await this.ensureEmailIsAvailable(command.email);
    const user = await this.buildUserAggregate(command, email);

    await this.deps.userAccountRepository.save(user);

    return {
      userSnapshot: {
        id: user.id,
        email: user.email.value,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      domainEvents: user.getDomainEvents(),
    };
  }

  private async ensureEmailIsAvailable(rawEmail: string): Promise<Email> {
    const email = Email.create(rawEmail);
    const existingUser = await this.deps.userAccountRepository.findByEmail(email);

    if (existingUser) {
      throw new UserAccountAlreadyExistsError(email.value);
    }

    return email;
  }

  private async buildUserAggregate(
    command: RegisterUserAccountCommand,
    email: Email
  ): Promise<User> {
    const password = await Password.create(command.password);

    return User.create({
      email,
      name: command.name,
      password,
      role: command.role,
    });
  }
}
