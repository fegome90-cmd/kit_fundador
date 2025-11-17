/**
 * DomainEventDispatcher is an optional seam for consumers of the starkit.
 *
 * Infrastructure adapters (message bus, outbox, webhooks, etc.) should
 * implement this interface and the application layer can call it after
 * obtaining events via `aggregate.getDomainEvents()`.
 */
import { DomainEvent } from '../entities/DomainEvent';

export interface DomainEventDispatcher {
  publish(events: DomainEvent[]): Promise<void> | void;
}
