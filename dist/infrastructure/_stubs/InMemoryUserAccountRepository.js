/**
 * Repositorio en memoria pensado para pruebas de integración y documentación.
 * Mantiene las entidades en un Map usando el email normalizado como clave.
 */
export class InMemoryUserAccountRepository {
    store = new Map();
    usersById = new Map();
    constructor(seed = []) {
        for (const user of seed) {
            this.seed(user);
        }
    }
    async findByEmail(email) {
        return this.store.get(this.normalize(email.value)) ?? null;
    }
    async save(user) {
        this.store.set(this.normalize(user.email.value), user);
        this.usersById.set(user.id, user);
    }
    // ✅ NEW: Find user by ID for E2E testing
    async findById(userId) {
        return this.usersById.get(userId) ?? null;
    }
    // ✅ NEW: Find all users for E2E testing
    async findAll() {
        return [...this.usersById.values()];
    }
    seed(user) {
        this.store.set(this.normalize(user.email.value), user);
        this.usersById.set(user.id, user);
    }
    list() {
        return [...this.store.values()];
    }
    clear() {
        this.store.clear();
        this.usersById.clear();
    }
    normalize(value) {
        return value.trim().toLowerCase();
    }
}
//# sourceMappingURL=InMemoryUserAccountRepository.js.map