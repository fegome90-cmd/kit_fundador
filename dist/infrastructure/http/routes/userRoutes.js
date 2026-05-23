/**
 * User HTTP Routes
 * Defines HTTP routes for user-related operations
 */
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { RegisterUserAccountHandler } from '../../../application/use-cases/register-user-account/RegisterUserAccountHandler';
import { InMemoryUserAccountRepository } from '../../_stubs/InMemoryUserAccountRepository';
function createUserController() {
    const repository = new InMemoryUserAccountRepository();
    const registerUserHandler = new RegisterUserAccountHandler({
        userAccountRepository: repository,
    });
    return new UserController(registerUserHandler);
}
export function createUserRoutes() {
    const router = Router();
    const userController = createUserController();
    router.post('/register', (req, res) => userController.registerUser(req, res));
    return router;
}
//# sourceMappingURL=userRoutes.js.map