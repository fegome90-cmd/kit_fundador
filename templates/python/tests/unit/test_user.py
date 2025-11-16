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
        """
        Default to the USER role when a User is created without an explicit role.
        """
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
        """
        Raise ValueError when attempting to verify an already-verified email.
        
        Asserts that calling `verify_email` on a user whose email is already verified raises a `ValueError` with message 'Email already verified'.
        """
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
        """
        Verify that is_admin() identifies users with the admin role.
        """
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
        """
        Verify that is_admin() reports non-admin for a user assigned the USER role.
        """
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

    def test_user_name_too_long(self):
        """Should throw if user name is too long."""
        email = Email.create('test@example.com')
        long_name = 'A' * 256

        with pytest.raises(ValueError, match='User name too long'):
            User.create(
                email=email,
                name=long_name,
                password_hash='hashed_password_123',
            )

    def test_user_name_at_maximum_length(self):
        """Should accept user name at exactly 255 characters."""
        email = Email.create('test@example.com')
        max_name = 'A' * 255

        user = User.create(
            email=email,
            name=max_name,
            password_hash='hashed_password_123',
        )

        assert user.name == max_name
        assert len(user.name) == 255

    def test_change_name_with_whitespace_only(self):
        """Should throw on whitespace-only name."""
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='hashed_password_123',
        )

        with pytest.raises(ValueError, match='Name cannot be empty'):
            user.change_name('   ')

    def test_change_name_with_special_characters(self):
        """Should accept name with special characters."""
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='hashed_password_123',
        )

        special_name = "O'Brien-Smith Jr."
        user.change_name(special_name)

        assert user.name == special_name

    def test_change_name_updates_timestamp(self):
        """Should update updatedAt when changing name."""
        user = User.create(
            email=Email.create('test@example.com'),
            name='Old Name',
            password_hash='hashed_password_123',
        )

        original_updated_at = user.updated_at
        user.change_name('New Name')

        assert user.updated_at > original_updated_at

    def test_change_password_successfully(self):
        """Should change password successfully."""
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='old_hash',
        )

        user.change_password('new_hash')

        # Can't directly access password_hash, but verify timestamp updated
        assert user.updated_at is not None

    def test_change_password_updates_timestamp(self):
        """Should update updatedAt when changing password."""
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='old_hash',
        )

        original_updated_at = user.updated_at
        user.change_password('new_hash')

        assert user.updated_at > original_updated_at

    def test_verify_email_updates_timestamp(self):
        """Should update updatedAt when verifying email."""
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='hashed_password_123',
        )

        original_updated_at = user.updated_at
        user.verify_email()

        assert user.updated_at > original_updated_at

    def test_verify_email_does_not_change_other_properties(self):
        """Should not change other properties when verifying email."""
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='hashed_password_123',
        )

        original_id = user.id
        original_name = user.name
        original_email = user.email
        original_role = user.role

        user.verify_email()

        assert user.id == original_id
        assert user.name == original_name
        assert user.email == original_email
        assert user.role == original_role

    def test_is_admin_for_guest_role(self):
        """Should return False for guest users."""
        user = User.create(
            email=Email.create('guest@example.com'),
            name='Guest User',
            password_hash='hashed_password_123',
            role=UserRole.GUEST,
        )

        assert user.is_admin() is False

    def test_domain_events_return_copy(self):
        """Should return copy of domain events, not reference."""
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='hashed_password_123',
        )

        events1 = user.get_domain_events()
        events2 = user.get_domain_events()

        assert events1 is not events2
        assert events1 == events2

    def test_clear_domain_events(self):
        """Should clear all domain events."""
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='hashed_password_123',
        )

        assert len(user.get_domain_events()) > 0

        user.clear_domain_events()

        assert len(user.get_domain_events()) == 0

    def test_domain_event_structure(self):
        """Should have proper event structure."""
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='hashed_password_123',
        )

        events = user.get_domain_events()
        event = events[0]

        assert hasattr(event, 'user_id')
        assert hasattr(event, 'email')
        assert hasattr(event, 'occurred_at')
        assert hasattr(event, 'event_id')

    def test_to_dict_without_password(self):
        """Should not expose password in dict."""
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='hashed_password_123',
        )

        user_dict = user.to_dict()

        assert 'password' not in user_dict
        assert 'password_hash' not in user_dict

    def test_to_dict_serializes_dates(self):
        """Should serialize dates as ISO strings."""
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='hashed_password_123',
        )

        user_dict = user.to_dict()

        assert isinstance(user_dict['created_at'], str)
        assert isinstance(user_dict['updated_at'], str)
        # Verify they are valid ISO format
        from datetime import datetime
        datetime.fromisoformat(user_dict['created_at'])
        datetime.fromisoformat(user_dict['updated_at'])

    def test_to_dict_contains_all_public_fields(self):
        """Should contain all public fields."""
        user = User.create(
            email=Email.create('dict@example.com'),
            name='Dict User',
            password_hash='hashed_password_123',
            role=UserRole.ADMIN,
        )

        user_dict = user.to_dict()

        assert 'id' in user_dict
        assert user_dict['email'] == 'dict@example.com'
        assert user_dict['name'] == 'Dict User'
        assert user_dict['role'] == 'admin'
        assert user_dict['email_verified'] is False

    def test_from_persistence_no_domain_events(self):
        """Should not raise domain events when reconstituting."""
        email = Email.create('persisted@example.com')

        user = User.from_persistence(
            id='test-id',
            email=email,
            name='Persisted User',
            password_hash='hashed_password_123',
            role=UserRole.USER,
            email_verified=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        assert len(user.get_domain_events()) == 0

    def test_from_persistence_validates_invariants(self):
        """Should validate invariants on reconstitution."""
        email = Email.create('test@example.com')

        with pytest.raises(ValueError, match='User name cannot be empty'):
            User.from_persistence(
                id='test-id',
                email=email,
                name='',
                password_hash='hashed_password_123',
                role=UserRole.USER,
                email_verified=False,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )

    def test_unique_ids_for_different_users(self):
        """Should generate unique IDs for different users."""
        email = Email.create('test@example.com')
        
        user1 = User.create(
            email=email,
            name='User 1',
            password_hash='hash1',
        )
        
        user2 = User.create(
            email=email,
            name='User 2',
            password_hash='hash2',
        )

        assert user1.id != user2.id

    def test_timestamps_set_on_creation(self):
        """Should set createdAt and updatedAt on creation."""
        before = datetime.utcnow()
        
        user = User.create(
            email=Email.create('test@example.com'),
            name='Test User',
            password_hash='hashed_password_123',
        )
        
        after = datetime.utcnow()

        assert before <= user.created_at <= after
        assert user.updated_at == user.created_at

    def test_user_lifecycle_integration(self):
        """Should handle complete user lifecycle."""
        # Create user
        user = User.create(
            email=Email.create('lifecycle@example.com'),
            name='Lifecycle User',
            password_hash='initial_hash',
            role=UserRole.USER,
        )

        assert user.email_verified is False
        assert user.role == UserRole.USER

        # Verify email
        user.verify_email()
        assert user.email_verified is True

        # Change name
        user.change_name('Updated Name')
        assert user.name == 'Updated Name'

        # Change password
        user.change_password('new_hash')

        # Verify final state
        assert user.id is not None
        assert user.email.value == 'lifecycle@example.com'
        assert user.email_verified is True
        assert user.name == 'Updated Name'

    def test_persistence_roundtrip(self):
        """Should handle persistence roundtrip correctly."""
        # Create and modify user
        original_user = User.create(
            email=Email.create('roundtrip@example.com'),
            name='Original Name',
            password_hash='original_hash',
        )
        original_user.verify_email()
        original_user.change_name('Modified Name')
        original_user.clear_domain_events()

        # Simulate persistence
        user_from_db = User.from_persistence(
            id=original_user.id,
            email=original_user.email,
            name=original_user.name,
            password_hash='original_hash',
            role=original_user.role,
            email_verified=original_user.email_verified,
            created_at=original_user.created_at,
            updated_at=original_user.updated_at,
        )

        # Verify reconstituted user
        assert user_from_db.id == original_user.id
        assert user_from_db.email.value == original_user.email.value
        assert user_from_db.name == original_user.name
        assert user_from_db.email_verified is True
        assert user_from_db == original_user

    def test_change_name_multiple_times(self):
        """Should allow changing name multiple times."""
        user = User.create(
            email=Email.create('test@example.com'),
            name='Name 1',
            password_hash='hash',
        )
        
        user.change_name('Name 2')
        assert user.name == 'Name 2'
        
        user.change_name('Name 3')
        assert user.name == 'Name 3'
