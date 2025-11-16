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
        """
        Create and validate an Email value object from a raw email string.
        
        Parameters:
            email (str): The email address to encapsulate and validate.
        
        Returns:
            Email: A validated Email instance.
        
        Raises:
            ValueError: If the provided email fails validation.
        """
        email_obj = cls(_value=email)
        email_obj._validate()
        return email_obj

    def _validate(self) -> None:
        """
        Validate the stored email value against format and business rules.
        
        Raises:
            ValueError: If the email is empty.
            ValueError: If the email does not match the required format.
            ValueError: If the email length exceeds MAX_LENGTH.
            ValueError: If the email's domain is in BLOCKED_DOMAINS.
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
        """
        Retrieve the underlying email address.
        
        Returns:
            The stored email address string.
        """
        return self._value

    def __str__(self) -> str:
        """
        Return the email's string value.
        
        Returns:
            The underlying email string.
        """
        return self._value

    def __eq__(self, other: object) -> bool:
        """
        Compare this Email with another object for value equality using a case-insensitive comparison.
        
        If the other object is not an Email, the comparison yields `false`.
        
        Parameters:
            other: Object to compare against this Email.
        
        Returns:
            `true` if the other object is an Email with the same address ignoring case, `false` otherwise.
        """
        if not isinstance(other, Email):
            return False
        return self._value.lower() == other._value.lower()

    def __hash__(self) -> int:
        """
        Return a hash suitable for use in hash-based collections that matches case-insensitive equality.
        
        Returns:
            int: Hash of the email value converted to lowercase.
        """
        return hash(self._value.lower())