/**
 * UserCreated Domain Event
 */

import { DomainEvent } from '../entities/DomainEvent';

export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly createdAt: Date
  ) {
    super();
  }

  get eventType(): string {
    return 'UserCreated';
  }
}
