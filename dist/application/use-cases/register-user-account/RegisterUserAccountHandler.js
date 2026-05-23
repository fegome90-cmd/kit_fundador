import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { Password } from '@domain/value-objects/Password';
import { UserAccountAlreadyExistsError, } from '../../ports/UserAccountRepository';
/**
 * Handler principal para el caso de uso RegisterUserAccount.
 *
 * Orquesta los value objects, consulta el repositorio y retorna una vista reducida
 * del usuario creado junto con los domain events listos para ser despachados por
 * la capa de infraestructura del consumidor.
 */
export class RegisterUserAccountHandler {
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    async execute(command) {
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
    async ensureEmailIsAvailable(rawEmail) {
        const email = Email.create(rawEmail);
        const existingUser = await this.deps.userAccountRepository.findByEmail(email);
        if (existingUser) {
            throw new UserAccountAlreadyExistsError(email.value);
        }
        return email;
    }
    async buildUserAggregate(command, email) {
        const password = await Password.create(command.password);
        return User.create({
            email,
            name: command.name,
            password,
            role: command.role,
        });
    }
}
//# sourceMappingURL=RegisterUserAccountHandler.js.map