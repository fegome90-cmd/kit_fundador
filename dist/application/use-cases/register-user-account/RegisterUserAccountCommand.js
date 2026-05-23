const ALLOWED_ROLES = ['admin', 'user', 'guest'];
/**
 * Normaliza/valida los datos de entrada y retorna un command inmutable.
 */
export function buildRegisterUserAccountCommand(props) {
    const normalizedEmail = normalizeEmail(props.email);
    const normalizedName = normalizeName(props.name);
    const normalizedPassword = normalizePassword(props.password);
    const normalizedRole = normalizeRole(props.role);
    return Object.freeze({
        email: normalizedEmail,
        name: normalizedName,
        password: normalizedPassword,
        role: normalizedRole,
    });
}
function ensureNonEmpty(value, field) {
    if (!value) {
        throw new Error(`${field} cannot be empty`);
    }
    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error(`${field} cannot be blank`);
    }
    return trimmed;
}
function normalizeEmail(email) {
    const normalized = ensureNonEmpty(email, 'email').toLowerCase();
    return normalized;
}
function normalizeName(name) {
    const normalized = ensureNonEmpty(name, 'name');
    if (normalized.length > 255) {
        throw new Error('name is too long (max 255 characters)');
    }
    return normalized;
}
function normalizePassword(password) {
    return ensureNonEmpty(password, 'password');
}
function normalizeRole(role) {
    if (!role) {
        return 'user';
    }
    if (!ALLOWED_ROLES.includes(role)) {
        throw new Error(`role must be one of: ${ALLOWED_ROLES.map((value) => `"${value}"`).join(', ')}`);
    }
    return role;
}
//# sourceMappingURL=RegisterUserAccountCommand.js.map