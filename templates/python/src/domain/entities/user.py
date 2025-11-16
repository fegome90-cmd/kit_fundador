"""User Domain Entity.

RULES:
- No dependencies on infrastructure or application layers
- Business logic MUST be here
- Protect invariants
- Use value objects for complex values
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..value_objects.email import Email


class UserRole(str, Enum):
    """User role enumeration."""

    ADMIN = 'admin'
    USER = 'user'
    GUEST = 'guest'


@dataclass
class DomainEvent:
    """Base class for domain events."""

    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    occurred_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class UserCreatedEvent(DomainEvent):
    """Event raised when a user is created."""

    user_id: str
    email: str


class User:
    """User entity with business logic and invariant protection."""

    def __init__(
        self,
        id: str,
        email: Email,
        name: str,
        password_hash: str,
        role: UserRole,
        email_verified: bool,
        created_at: datetime,
        updated_at: datetime,
    ) -> None:
        """Initialize User entity.

        Args:
            id: Unique user identifier
            email: Email value object
            name: User name
            password_hash: Hashed password (never store plain text)
            role: User role
            email_verified: Whether email is verified
            created_at: Creation timestamp
            updated_at: Last update timestamp

        Raises:
            ValueError: If invariants are violated
        """
        self._id = id
        self._email = email
        self._name = name
        self._password_hash = password_hash
        self._role = role
        self._email_verified = email_verified
        self._created_at = created_at
        self._updated_at = updated_at
        self._domain_events: list[DomainEvent] = []

        self._validate()

    @classmethod
    def create(
        cls,
        email: Email,
        name: str,
        password_hash: str,
        role: UserRole = UserRole.USER,
    ) -> User:
        """Factory method - preferred way to create entities.

        Args:
            email: Email value object
            name: User name
            password_hash: Hashed password
            role: User role (defaults to USER)

        Returns:
            New User instance

        Raises:
            ValueError: If validation fails
        """
        now = datetime.utcnow()
        user_id = str(uuid.uuid4())

        user = cls(
            id=user_id,
            email=email,
            name=name,
            password_hash=password_hash,
            role=role,
            email_verified=False,
            created_at=now,
            updated_at=now,
        )

        # Raise domain event
        user._add_domain_event(UserCreatedEvent(user_id=user_id, email=email.value))

        return user

    @classmethod
    def from_persistence(
        cls,
        id: str,
        email: Email,
        name: str,
        password_hash: str,
        role: UserRole,
        email_verified: bool,
        created_at: datetime,
        updated_at: datetime,
    ) -> User:
        """Reconstitute from persistence.

        Args:
            id: User ID
            email: Email value object
            name: User name
            password_hash: Hashed password
            role: User role
            email_verified: Email verification status
            created_at: Creation timestamp
            updated_at: Last update timestamp

        Returns:
            User instance
        """
        return cls(
            id=id,
            email=email,
            name=name,
            password_hash=password_hash,
            role=role,
            email_verified=email_verified,
            created_at=created_at,
            updated_at=updated_at,
        )

    def _validate(self) -> None:
        """Validate entity invariants.

        Raises:
            ValueError: If invariants are violated
        """
        if not self._name or not self._name.strip():
            raise ValueError('User name cannot be empty')

        if len(self._name) > 255:
            raise ValueError('User name too long')

    # Business methods (not just getters/setters)

    def verify_email(self) -> None:
        """Verify user email.

        Raises:
            ValueError: If email is already verified
        """
        if self._email_verified:
            raise ValueError('Email already verified')

        self._email_verified = True
        self._updated_at = datetime.utcnow()

        # Raise domain event
        # self._add_domain_event(EmailVerifiedEvent(...))

    def change_name(self, new_name: str) -> None:
        """Change user name.

        Args:
            new_name: New name

        Raises:
            ValueError: If name is empty
        """
        if not new_name or not new_name.strip():
            raise ValueError('Name cannot be empty')

        self._name = new_name
        self._updated_at = datetime.utcnow()

    def change_password(self, new_password_hash: str) -> None:
        """Change user password.

        Args:
            new_password_hash: New hashed password
        """
        self._password_hash = new_password_hash
        self._updated_at = datetime.utcnow()

    def is_admin(self) -> bool:
        """Check if user is admin.

        Returns:
            True if user is admin
        """
        return self._role == UserRole.ADMIN

    # Properties (read-only access to internal state)

    @property
    def id(self) -> str:
        """Get user ID."""
        return self._id

    @property
    def email(self) -> Email:
        """Get email value object."""
        return self._email

    @property
    def name(self) -> str:
        """Get user name."""
        return self._name

    @property
    def role(self) -> UserRole:
        """Get user role."""
        return self._role

    @property
    def email_verified(self) -> bool:
        """Get email verification status."""
        return self._email_verified

    @property
    def created_at(self) -> datetime:
        """Get creation timestamp."""
        return self._created_at

    @property
    def updated_at(self) -> datetime:
        """Get last update timestamp."""
        return self._updated_at

    # Domain events management

    def _add_domain_event(self, event: DomainEvent) -> None:
        """Add domain event.

        Args:
            event: Domain event to add
        """
        self._domain_events.append(event)

    def get_domain_events(self) -> list[DomainEvent]:
        """Get copy of domain events.

        Returns:
            List of domain events
        """
        return self._domain_events.copy()

    def clear_domain_events(self) -> None:
        """Clear domain events."""
        self._domain_events.clear()

    # For persistence

    def to_dict(self) -> dict:
        """Convert to dictionary for persistence.

        Returns:
            Dictionary representation (without password)
        """
        return {
            'id': self._id,
            'email': self._email.value,
            'name': self._name,
            # NEVER expose password in dict
            'role': self._role.value,
            'email_verified': self._email_verified,
            'created_at': self._created_at.isoformat(),
            'updated_at': self._updated_at.isoformat(),
        }

    def __eq__(self, other: object) -> bool:
        """Entities are compared by ID.

        Args:
            other: Object to compare

        Returns:
            True if same entity (same ID)
        """
        if not isinstance(other, User):
            return False
        return self._id == other._id

    def __hash__(self) -> int:
        """Hash for use in collections."""
        return hash(self._id)
