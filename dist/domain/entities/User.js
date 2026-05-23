/**
 * Example Domain Entity
 *
 * RULES:
 * - No dependencies on infrastructure or application layers
 * - Business logic MUST be here
 * - Protect invariants
 * - Use value objects for complex values
 */
import { UserCreatedEvent } from '../domain-events/UserCreatedEvent';
export class User {
    props;
    domainEvents = [];
    constructor(props) {
        this.props = props;
        this.validate();
    }
    // Factory method - preferred way to create entities
    static create(params) {
        const { props, occurredOn } = User.buildInitialProps(params);
        const user = new User(props);
        user.addDomainEvent(new UserCreatedEvent(user.id, user.email.value, occurredOn));
        return user;
    }
    static buildInitialProps(params) {
        const now = new Date();
        const props = {
            id: crypto.randomUUID(),
            email: params.email,
            name: params.name,
            password: params.password,
            role: params.role || 'user',
            emailVerified: false,
            createdAt: now,
            updatedAt: now,
        };
        return { props, occurredOn: now };
    }
    // Reconstitute from persistence
    static fromPersistence(props) {
        return new User(props);
    }
    // Invariant validation
    validate() {
        if (!this.props.name || this.props.name.trim().length === 0) {
            throw new Error('User name cannot be empty');
        }
        if (this.props.name.length > 255) {
            throw new Error('User name too long');
        }
    }
    // Business methods (not just getters/setters)
    verifyEmail() {
        if (this.props.emailVerified) {
            throw new Error('Email already verified');
        }
        this.props.emailVerified = true;
        this.props.updatedAt = new Date();
        // Raise domain event
        // this.addDomainEvent(new EmailVerifiedEvent(...));
        // Application layer should persist and dispatch events via your own
        // DomainEventDispatcher implementation.
    }
    changeName(newName) {
        if (!newName || newName.trim().length === 0) {
            throw new Error('Name cannot be empty');
        }
        this.props.name = newName;
        this.props.updatedAt = new Date();
    }
    changePassword(newPassword) {
        this.props.password = newPassword;
        this.props.updatedAt = new Date();
    }
    isAdmin() {
        return this.props.role === 'admin';
    }
    // Getters (read-only access to internal state)
    get id() {
        return this.props.id;
    }
    get email() {
        return this.props.email;
    }
    get name() {
        return this.props.name;
    }
    get role() {
        return this.props.role;
    }
    get emailVerified() {
        return this.props.emailVerified;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    // Domain events management
    addDomainEvent(event) {
        this.domainEvents.push(event);
    }
    /**
     * Returns a copy of the accumulated events so the application layer can
     * forward them to an infrastructure adapter (outbox, message bus, etc.).
     */
    getDomainEvents() {
        return [...this.domainEvents];
    }
    clearDomainEvents() {
        this.domainEvents = [];
    }
    // For persistence
    toJSON() {
        return {
            id: this.props.id,
            email: this.props.email.value,
            name: this.props.name,
            // NEVER expose password in JSON
            role: this.props.role,
            emailVerified: this.props.emailVerified,
            createdAt: this.props.createdAt.toISOString(),
            updatedAt: this.props.updatedAt.toISOString(),
        };
    }
}
//# sourceMappingURL=User.js.map