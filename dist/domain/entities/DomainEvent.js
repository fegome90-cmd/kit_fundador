/**
 * Base class for Domain Events
 */
export class DomainEvent {
    occurredAt;
    eventId;
    constructor() {
        this.occurredAt = new Date();
        this.eventId = crypto.randomUUID();
    }
}
//# sourceMappingURL=DomainEvent.js.map