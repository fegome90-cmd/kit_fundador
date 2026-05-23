import { UserRole } from '../../../domain/entities/User';
/**
 * DTO que encapsula los datos de entrada para el use case RegisterUserAccount.
 * Mantiene la capa de aplicación aislada de detalles HTTP o de persistencia.
 */
export interface RegisterUserAccountCommand {
    email: string;
    name: string;
    password: string;
    role: UserRole;
}
export interface RegisterUserAccountCommandProps {
    email: string;
    name: string;
    password: string;
    role?: UserRole;
}
/**
 * Normaliza/valida los datos de entrada y retorna un command inmutable.
 */
export declare function buildRegisterUserAccountCommand(props: RegisterUserAccountCommandProps): RegisterUserAccountCommand;
//# sourceMappingURL=RegisterUserAccountCommand.d.ts.map