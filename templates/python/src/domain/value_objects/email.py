"""Email Value Object.

Value Objects are:
- Immutable
- Compared by value, not identity
- Validate themselves
- No setters
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Final


@dataclass(frozen=True)
class Email:
    """Email value object with validation and business rules."""

    _value: str

    # Class-level constants
    MAX_LENGTH: Final[int] = 255
    BLOCKED_DOMAINS: Final[tuple[str, ...]] = ('tempmail.com', 'throwaway.email')
    EMAIL_PATTERN: Final[re.Pattern] = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')

    @classmethod
    def create(cls, email: str) -> Email:
        """Factory method to create Email instance with validation.

        Args:
            email: Email address string

        Returns:
            Email instance

        Raises:
            ValueError: If email is invalid
        """
        email_obj = cls(_value=email)
        email_obj._validate()
        return email_obj

    def _validate(self) -> None:
        """Validate email format and business rules.

        Raises:
            ValueError: If email is invalid
        """
        if not self._value:
            raise ValueError('Email cannot be empty')

        # Basic email validation
        # In production, use a proper library like email-validator
        if not self.EMAIL_PATTERN.match(self._value):
            raise ValueError(f'Invalid email format: {self._value}')

        # Additional business rules
        if len(self._value) > self.MAX_LENGTH:
            raise ValueError('Email too long')

        # Block certain domains
        domain = self._value.split('@')[1]
        if domain in self.BLOCKED_DOMAINS:
            raise ValueError(f'Email domain not allowed: {domain}')

    @property
    def value(self) -> str:
        """Get email value."""
        return self._value

    def __str__(self) -> str:
        """String representation."""
        return self._value

    def __eq__(self, other: object) -> bool:
        """Value objects are compared by value (case-insensitive for emails).

        Args:
            other: Object to compare

        Returns:
            True if emails are equal (case-insensitive)
        """
        if not isinstance(other, Email):
            return False
        return self._value.lower() == other._value.lower()

    def __hash__(self) -> int:
        """Hash for use in collections (Set, Dict)."""
        return hash(self._value.lower())
