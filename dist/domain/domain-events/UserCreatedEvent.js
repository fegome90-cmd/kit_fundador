/**
 * UserCreated Domain Event
 */
import { DomainEvent } from '../entities/DomainEvent';
export class UserCreatedEvent extends DomainEvent {
    userId;
    email;
    createdAt;
    constructor(userId, email, createdAt) {
        super();
        this.userId = userId;
        this.email = email;
        this.createdAt = createdAt;
    }
    get eventType() {
        return 'UserCreated';
    }
}
//# sourceMappingURL=UserCreatedEvent.js.map