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
        """
        Construct a User entity from explicit state and enforce domain invariants.
        
        Parameters:
            id (str): Unique user identifier.
            email (Email): Email value object for the user.
            name (str): User's display name.
            password_hash (str): Stored password hash (must not be plain text).
            role (UserRole): Assigned user role.
            email_verified (bool): Whether the user's email has been verified.
            created_at (datetime): Creation timestamp.
            updated_at (datetime): Last update timestamp.
        
        Raises:
            ValueError: If any domain invariant (e.g., name constraints) is violated.
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
        """
        Create a new User with a generated id and timestamps, and record a UserCreatedEvent.
        
        Parameters:
            email (Email): Email value object for the new user.
            name (str): User's display name.
            password_hash (str): Hashed password to store.
            role (UserRole): User role; defaults to UserRole.USER.
        
        Returns:
            User: The newly created User instance.
        
        Raises:
            ValueError: If user invariants (for example, name validation) are violated during construction.
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
        """
        Reconstructs a User from persisted data without emitting domain events.
        
        Args:
            id: User identifier.
            email: Email value object.
            name: User name.
            password_hash: Stored password hash.
            role: UserRole for the user.
            email_verified: Whether the user's email was verified.
            created_at: Timestamp when the user was created.
            updated_at: Timestamp of the last update.
        
        Returns:
            User instance reconstructed from the provided persisted fields.
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
        """
        Ensure the user's name satisfies domain invariants.
        
        Checks that the name is not empty or only whitespace and that its length does not exceed 255 characters.
        
        Raises:
            ValueError: If the name is empty or contains only whitespace, or if its length is greater than 255.
        """
        if not self._name or not self._name.strip():
            raise ValueError('User name cannot be empty')

        if len(self._name) > 255:
            raise ValueError('User name too long')

    # Business methods (not just getters/setters)

    def verify_email(self) -> None:
        """
        Mark the user's email as verified and update the updated_at timestamp.
        
        Raises:
            ValueError: If the user's email is already verified.
        """
        if self._email_verified:
            raise ValueError('Email already verified')

        self._email_verified = True
        self._updated_at = datetime.utcnow()

        # Raise domain event
        # self._add_domain_event(EmailVerifiedEvent(...))

    def change_name(self, new_name: str) -> None:
        """
        Change the user's name and update the modification timestamp.
        
        Args:
            new_name (str): The new non-empty name for the user.
        
        Raises:
            ValueError: If new_name is empty or contains only whitespace.
        
        Notes:
            This method sets the user's name and updates `updated_at` to the current UTC time.
        """
        if not new_name or not new_name.strip():
            raise ValueError('Name cannot be empty')

        self._name = new_name
        self._updated_at = datetime.utcnow()

    def change_password(self, new_password_hash: str) -> None:
        """
        Set the user's password hash and update the last-modified timestamp.
        
        Parameters:
            new_password_hash: The new password hash to store for the user.
        """
        self._password_hash = new_password_hash
        self._updated_at = datetime.utcnow()

    def is_admin(self) -> bool:
        """
        Determine whether the user's role is ADMIN.
        
        Returns:
            `true` if the user's role is `UserRole.ADMIN`, `false` otherwise.
        """
        return self._role == UserRole.ADMIN

    # Properties (read-only access to internal state)

    @property
    def id(self) -> str:
        """
        Get the user's unique identifier.
        
        Returns:
            str: The user's unique identifier.
        """
        return self._id

    @property
    def email(self) -> Email:
        """
        The user's Email value object.
        
        Returns:
            Email: The Email value object representing the user's email address.
        """
        return self._email

    @property
    def name(self) -> str:
        """
        User's display name.
        
        Returns:
            name (str): The user's name.
        """
        return self._name

    @property
    def role(self) -> UserRole:
        """
        Return the user's role within the system.
        
        Returns:
            UserRole: The user's assigned role (e.g., UserRole.ADMIN, UserRole.USER, UserRole.GUEST).
        """
        return self._role

    @property
    def email_verified(self) -> bool:
        """
        Indicates whether the user's email address has been verified.
        
        Returns:
            True if the user's email is verified, False otherwise.
        """
        return self._email_verified

    @property
    def created_at(self) -> datetime:
        """
        The timestamp when the user was created.
        
        Returns:
            The creation timestamp as a `datetime` object.
        """
        return self._created_at

    @property
    def updated_at(self) -> datetime:
        """
        Returns the timestamp when the user was last updated.
        
        Returns:
            datetime: The user's last update timestamp.
        """
        return self._updated_at

    # Domain events management

    def _add_domain_event(self, event: DomainEvent) -> None:
        """
        Add a domain event to this user's accumulated domain events.
        
        Parameters:
            event (DomainEvent): The domain event to append.
        """
        self._domain_events.append(event)

    def get_domain_events(self) -> list[DomainEvent]:
        """
        Return a shallow copy of the user's accumulated domain events.
        
        Returns:
            list[DomainEvent]: A shallow copy of the domain events list.
        """
        return self._domain_events.copy()

    def clear_domain_events(self) -> None:
        """Clear domain events."""
        self._domain_events.clear()

    # For persistence

    def to_dict(self) -> dict:
        """
        Serialize the user's persistent state to a dictionary suitable for storage.
        
        Returns:
            dict: Mapping with keys:
                - `id` (str)
                - `email` (str)
                - `name` (str)
                - `role` (str)
                - `email_verified` (bool)
                - `created_at` (str, ISO 8601)
                - `updated_at` (str, ISO 8601)
            The password is intentionally omitted.
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
        """
        Compare this User with another object by identifier.
        
        Parameters:
            other (object): The object to compare against; only User instances are considered equal.
        
        Returns:
            `true` if `other` is a `User` instance with the same id, `false` otherwise.
        """
        if not isinstance(other, User):
            return False
        return self._id == other._id

    def __hash__(self) -> int:
        """
        Return a hash value derived from the user's id for use in hashed collections.
        
        Returns:
            int: Hash of the user's id.
        """
        return hash(self._id)