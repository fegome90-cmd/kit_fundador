"""Unit tests for User Entity.

Following TDD principles:
- Arrange: Setup test data
- Act: Execute the behavior
- Assert: Verify the outcome
"""

import pytest
from datetime import datetime

from src.domain.entities.user import User, UserRole
from src.domain.value_objects.email import Email


class TestUserEntity:
    """Test suite for User entity."""

    def test_create_valid_user(self):
        """Should create a valid user."""
        # Arrange
        email = Email.create('test@example.com')
        password_hash = 'hashed_password_123'  # In real app, use bcrypt/argon2

        # Act
        user = User.create(
            email=email,
            name='Test User',
            password_hash=password_hash,
            role=UserRole.USER,
        )

        # Assert
        assert user.id is not None
        assert user.email.value == 'test@example.com'
        assert user.name == 'Test User'
        assert user.role == UserRole.USER
        assert user.email_verified is False
        assert isinstance(user.created_at, datetime)

    def test_create_raises_user_created_event(self):
        """Should raise UserCreated domain event."""
        # Arrange
        email = Email.create('test@example.com')
        password_hash = 'hashed_password_123'

        # Act
        user = User.create(
            email=email,
            name='Test User',
            password_hash=password_hash,
        )

        # Assert
        events = user.get_domain_events()
        assert len(events) == 1
        assert events[0].__class__.__name__ == 'UserCreatedEvent'

    def test_create_defaults_to_user_role(self):
        """Should default to user role if not specified."""
        # Arrange
        email = Email.create('test@example.com')
        password_hash = 'hashed_password_123'

        # Act
        user = User.create(
            email=email,
            name='Test User',
            password_hash=password_hash,
        )

        # Assert
        assert user.role == UserRole.USER

    def test_verify_email_successfully(self):
        """Should verify email successfully."""
        # Arrange
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='hashed_password_123',
        )

        # Act
        user.verify_email()

        # Assert
        assert user.email_verified is True

    def test_verify_email_throws_if_already_verified(self):
        """Should throw if email already verified."""
        # Arrange
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='hashed_password_123',
        )
        user.verify_email()

        # Act & Assert
        with pytest.raises(ValueError, match='Email already verified'):
            user.verify_email()

    def test_change_name_successfully(self):
        """Should change name successfully."""
        # Arrange
        user = User.create(
            email=Email.create('test@example.com'),
            name='Old Name',
            password_hash='hashed_password_123',
        )

        # Act
        user.change_name('New Name')

        # Assert
        assert user.name == 'New Name'

    def test_change_name_throws_if_empty(self):
        """Should throw if name is empty."""
        # Arrange
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='hashed_password_123',
        )

        # Act & Assert
        with pytest.raises(ValueError, match='Name cannot be empty'):
            user.change_name('')

    def test_is_admin_returns_true_for_admin_users(self):
        """Should return true for admin users."""
        # Arrange & Act
        user = User.create(
            email=Email.create('admin@example.com'),
            name='Admin User',
            password_hash='hashed_password_123',
            role=UserRole.ADMIN,
        )

        # Assert
        assert user.is_admin() is True

    def test_is_admin_returns_false_for_regular_users(self):
        """Should return false for regular users."""
        # Arrange & Act
        user = User.create(
            email=Email.create('user@example.com'),
            name='Regular User',
            password_hash='hashed_password_123',
            role=UserRole.USER,
        )

        # Assert
        assert user.is_admin() is False

    def test_user_name_cannot_be_empty(self):
        """Should throw if user name is empty."""
        # Arrange
        email = Email.create('test@example.com')

        # Act & Assert
        with pytest.raises(ValueError, match='User name cannot be empty'):
            User.create(
                email=email,
                name='',
                password_hash='hashed_password_123',
            )

    def test_user_entities_equal_by_id(self):
        """Entities should be compared by ID."""
        # Arrange
        email = Email.create('test@example.com')
        user1 = User.create(email=email, name='User', password_hash='hash123')

        # Reconstitute same user from persistence
        user2 = User.from_persistence(
            id=user1.id,
            email=email,
            name=user1.name,
            password_hash='hash123',
            role=user1.role,
            email_verified=user1.email_verified,
            created_at=user1.created_at,
            updated_at=user1.updated_at,
        )

        # Act & Assert
        assert user1 == user2
        assert hash(user1) == hash(user2)
