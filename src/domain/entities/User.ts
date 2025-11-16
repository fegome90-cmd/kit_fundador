/**
 * Example Domain Entity
 * 
 * RULES:
 * - No dependencies on infrastructure or application layers
 * - Business logic MUST be here
 * - Protect invariants
 * - Use value objects for complex values
 */

import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';
import { DomainEvent } from './DomainEvent';
import { UserCreatedEvent } from '../domain-events/UserCreatedEvent';

export type UserId = string;

export type UserRole = 'admin' | 'user' | 'guest';

interface UserProps {
  id: UserId;
  email: Email;
  name: string;
  password: Password;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;
  private domainEvents: DomainEvent[] = [];

  private constructor(props: UserProps) {
    this.props = props;
    this.validate();
  }

  // Factory method - preferred way to create entities
  static create(params: {
    email: Email;
    name: string;
    password: Password;
    role?: UserRole;
  }): User {
    const now = new Date();
    const props = User.buildUserProps(params, now);
    const user = new User(props);

    user.addDomainEvent(
      new UserCreatedEvent(user.id, user.email.value, now)
    );

    return user;
  }

  private static buildUserProps(
    params: { email: Email; name: string; password: Password; role?: UserRole },
    now: Date
  ): UserProps {
    return {
      id: crypto.randomUUID(),
      email: params.email,
      name: params.name,
      password: params.password,
      role: params.role || 'user',
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Reconstitute from persistence
  static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  // Invariant validation
  private validate(): void {
    if (!this.props.name || this.props.name.trim().length === 0) {
      throw new Error('User name cannot be empty');
    }

    if (this.props.name.length > 255) {
      throw new Error('User name too long');
    }
  }

  // Business methods (not just getters/setters)
  verifyEmail(): void {
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

  changeName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    this.props.name = newName;
    this.props.updatedAt = new Date();
  }

  changePassword(newPassword: Password): void {
    this.props.password = newPassword;
    this.props.updatedAt = new Date();
  }

  isAdmin(): boolean {
    return this.props.role === 'admin';
  }

  // Getters (read-only access to internal state)
  get id(): UserId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Domain events management
  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  /**
   * Returns a copy of the accumulated events so the application layer can
   * forward them to an infrastructure adapter (outbox, message bus, etc.).
   */
  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
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
