export class UserAccountAlreadyExistsError extends Error {
    constructor(email) {
        super(`UserAccount with email ${email} already exists`);
        this.name = 'UserAccountAlreadyExistsError';
    }
}
//# sourceMappingURL=UserAccountRepository.js.map