"""Comprehensive unit tests for Email Value Object.

Testing Strategy:
- Happy path: valid email creation
- Edge cases: various email formats
- Failure cases: invalid formats, blocked domains, length limits
- Value object behavior: immutability, equality, serialization
"""

import pytest

from src.domain.value_objects.email import Email


class TestEmailValueObject:
    """Test suite for Email value object."""

    # Happy path tests
    def test_create_valid_email(self):
        """Should create email with valid format."""
        email = Email.create('user@example.com')
        
        assert email.value == 'user@example.com'

    def test_create_email_with_subdomain(self):
        """Should create email with subdomain."""
        email = Email.create('user@mail.example.com')
        
        assert email.value == 'user@mail.example.com'

    def test_create_email_with_numbers(self):
        """Should create email with numbers."""
        email = Email.create('user123@example.com')
        
        assert email.value == 'user123@example.com'

    def test_create_email_with_dots_in_local_part(self):
        """Should create email with dots in local part."""
        email = Email.create('first.last@example.com')
        
        assert email.value == 'first.last@example.com'

    def test_create_email_with_plus_sign(self):
        """Should create email with plus sign."""
        email = Email.create('user+tag@example.com')
        
        assert email.value == 'user+tag@example.com'

    def test_create_email_with_hyphen_in_domain(self):
        """Should create email with hyphen in domain."""
        email = Email.create('user@my-company.com')
        
        assert email.value == 'user@my-company.com'

    def test_create_email_with_numbers_in_domain(self):
        """Should create email with numbers in domain."""
        email = Email.create('user@company123.com')
        
        assert email.value == 'user@company123.com'

    # Edge cases
    def test_handle_email_at_minimum_length(self):
        """Should handle email at minimum length."""
        email = Email.create('a@b.c')
        
        assert email.value == 'a@b.c'

    def test_handle_email_with_long_local_part(self):
        """Should handle email with long local part."""
        long_local = 'a' * 60
        email = Email.create(f'{long_local}@example.com')
        
        assert email.value == f'{long_local}@example.com'

    def test_handle_email_with_long_domain(self):
        """Should handle email with long domain."""
        long_domain = 'a' * 50
        email = Email.create(f'user@{long_domain}.com')
        
        assert email.value == f'user@{long_domain}.com'

    def test_handle_email_with_multiple_subdomains(self):
        """Should handle email with multiple subdomains."""
        email = Email.create('user@mail.corp.example.com')
        
        assert email.value == 'user@mail.corp.example.com'

    def test_handle_email_with_uppercase_letters(self):
        """Should handle email with uppercase letters."""
        email = Email.create('User@Example.COM')
        
        assert email.value == 'User@Example.COM'

    def test_handle_email_near_max_length(self):
        """Should handle email near max length (255 chars)."""
        long_email = 'a' * 240 + '@example.com'
        email = Email.create(long_email)
        
        assert email.value == long_email

    # Validation failures
    def test_throw_on_empty_email(self):
        """Should throw on empty email."""
        with pytest.raises(ValueError, match='Email cannot be empty'):
            Email.create('')

    def test_throw_on_none_email(self):
        """Should throw on None email."""
        with pytest.raises(ValueError, match='Email cannot be empty'):
            Email.create(None)

    def test_throw_on_email_without_at(self):
        """Should throw on email without @."""
        with pytest.raises(ValueError, match='Invalid email format'):
            Email.create('userexample.com')

    def test_throw_on_email_without_domain(self):
        """Should throw on email without domain."""
        with pytest.raises(ValueError, match='Invalid email format'):
            Email.create('user@')

    def test_throw_on_email_without_local_part(self):
        """Should throw on email without local part."""
        with pytest.raises(ValueError, match='Invalid email format'):
            Email.create('@example.com')

    def test_throw_on_email_without_tld(self):
        """Should throw on email without TLD."""
        with pytest.raises(ValueError, match='Invalid email format'):
            Email.create('user@example')

    def test_throw_on_email_with_spaces(self):
        """Should throw on email with spaces."""
        with pytest.raises(ValueError, match='Invalid email format'):
            Email.create('user @example.com')
        
        with pytest.raises(ValueError, match='Invalid email format'):
            Email.create('user@ example.com')
        
        with pytest.raises(ValueError, match='Invalid email format'):
            Email.create('user@example .com')

    def test_throw_on_email_with_multiple_at(self):
        """Should throw on email with multiple @."""
        with pytest.raises(ValueError, match='Invalid email format'):
            Email.create('user@@example.com')
        
        with pytest.raises(ValueError, match='Invalid email format'):
            Email.create('user@name@example.com')

    def test_throw_on_email_too_long(self):
        """Should throw on email too long (> 255 chars)."""
        too_long_email = 'a' * 250 + '@example.com'
        
        with pytest.raises(ValueError, match='Email too long'):
            Email.create(too_long_email)

    def test_throw_on_blocked_domain_tempmail(self):
        """Should throw on blocked domain tempmail.com."""
        with pytest.raises(ValueError, match='Email domain not allowed: tempmail.com'):
            Email.create('user@tempmail.com')

    def test_throw_on_blocked_domain_throwaway(self):
        """Should throw on blocked domain throwaway.email."""
        with pytest.raises(ValueError, match='Email domain not allowed: throwaway.email'):
            Email.create('user@throwaway.email')

    def test_throw_on_whitespace_only(self):
        """Should throw on email with only whitespace."""
        with pytest.raises(ValueError, match='Invalid email format'):
            Email.create('   ')

    # Equality tests
    def test_equals_same_email_value(self):
        """Should return True for same email value."""
        email1 = Email.create('user@example.com')
        email2 = Email.create('user@example.com')
        
        assert email1 == email2

    def test_equals_emails_with_different_case(self):
        """Should return True for emails with different case."""
        email1 = Email.create('User@Example.com')
        email2 = Email.create('user@example.com')
        
        assert email1 == email2

    def test_not_equals_different_emails(self):
        """Should return False for different emails."""
        email1 = Email.create('user1@example.com')
        email2 = Email.create('user2@example.com')
        
        assert email1 != email2

    def test_not_equals_non_email_object(self):
        """Should return False when comparing with non-Email object."""
        email = Email.create('user@example.com')
        
        assert email != 'user@example.com'
        assert email != None
        assert email != {}

    def test_not_equals_different_domains(self):
        """Should handle inequality for emails with different domains."""
        email1 = Email.create('user@example.com')
        email2 = Email.create('user@different.com')
        
        assert email1 != email2

    # Hash tests
    def test_hash_same_for_equal_emails(self):
        """Should have same hash for equal emails."""
        email1 = Email.create('user@example.com')
        email2 = Email.create('user@example.com')
        
        assert hash(email1) == hash(email2)

    def test_hash_case_insensitive(self):
        """Should have same hash for emails differing only in case."""
        email1 = Email.create('User@Example.COM')
        email2 = Email.create('user@example.com')
        
        assert hash(email1) == hash(email2)

    def test_hash_usable_in_set(self):
        """Should be usable in sets."""
        email1 = Email.create('user@example.com')
        email2 = Email.create('USER@EXAMPLE.COM')
        email3 = Email.create('other@example.com')
        
        email_set = {email1, email2, email3}
        
        # email1 and email2 are considered equal
        assert len(email_set) == 2

    def test_hash_usable_in_dict(self):
        """Should be usable as dictionary key."""
        email = Email.create('user@example.com')
        email_dict = {email: 'value'}
        
        assert email_dict[email] == 'value'

    # Immutability tests
    def test_immutable_dataclass(self):
        """Should be immutable (frozen dataclass)."""
        email = Email.create('user@example.com')
        
        with pytest.raises(Exception):  # FrozenInstanceError
            email._value = 'modified@example.com'

    def test_value_property_returns_same_value(self):
        """Should return same value on multiple accesses."""
        email = Email.create('user@example.com')
        
        assert email.value == 'user@example.com'
        assert email.value == 'user@example.com'
        assert email.value == 'user@example.com'

    # String representation
    def test_str_returns_email_value(self):
        """Should return email string value."""
        email = Email.create('user@example.com')
        
        assert str(email) == 'user@example.com'

    def test_str_same_as_value_property(self):
        """Should return same value as .value property."""
        email = Email.create('test@example.com')
        
        assert str(email) == email.value

    # Business rules
    def test_enforce_maximum_length_constraint(self):
        """Should enforce maximum length constraint."""
        email_255 = 'a' * 240 + '@example.com'  # exactly 255
        email_256 = 'a' * 241 + '@example.com'  # 256
        
        Email.create(email_255)  # Should not raise
        
        with pytest.raises(ValueError, match='Email too long'):
            Email.create(email_256)

    def test_block_all_configured_blocked_domains(self):
        """Should block all configured blocked domains."""
        blocked_domains = ['tempmail.com', 'throwaway.email']
        
        for domain in blocked_domains:
            with pytest.raises(ValueError, match=f'Email domain not allowed: {domain}'):
                Email.create(f'user@{domain}')

    def test_allow_legitimate_domains(self):
        """Should allow legitimate domains."""
        legitimate_domains = [
            'gmail.com',
            'yahoo.com',
            'outlook.com',
            'company.com',
            'my-company.co.uk',
            'university.edu',
        ]
        
        for domain in legitimate_domains:
            email = Email.create(f'user@{domain}')
            assert email.value == f'user@{domain}'

    # Real-world email formats
    def test_accept_common_email_providers(self):
        """Should accept common email providers."""
        valid_emails = [
            'user@gmail.com',
            'user@yahoo.com',
            'user@outlook.com',
            'user@hotmail.com',
            'user@protonmail.com',
        ]
        
        for email_str in valid_emails:
            email = Email.create(email_str)
            assert email.value == email_str

    def test_accept_corporate_email_formats(self):
        """Should accept corporate email formats."""
        corporate_emails = [
            'john.doe@company.com',
            'j.doe@my-company.co.uk',
            'admin@startup.io',
            'support@service.tech',
        ]
        
        for email_str in corporate_emails:
            email = Email.create(email_str)
            assert email.value == email_str

    def test_accept_email_aliases_with_plus_addressing(self):
        """Should accept email aliases with plus addressing."""
        alias_emails = [
            'user+tag@gmail.com',
            'user+newsletter@example.com',
            'john+work@company.com',
        ]
        
        for email_str in alias_emails:
            email = Email.create(email_str)
            assert email.value == email_str

    # Value object characteristics
    def test_created_through_factory_method(self):
        """Should be created through factory method."""
        email = Email.create('user@example.com')
        
        assert isinstance(email, Email)

    def test_validate_on_creation(self):
        """Should validate on creation."""
        with pytest.raises(ValueError):
            Email.create('invalid')

    def test_maintain_identity_through_value_equality(self):
        """Should maintain identity through value equality."""
        email1 = Email.create('user@example.com')
        email2 = Email.create('user@example.com')
        
        # Not the same object reference
        assert email1 is not email2
        
        # But equal by value
        assert email1 == email2