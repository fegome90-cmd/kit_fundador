import { InMemoryUserAccountRepository } from '../../../../src/infrastructure/_stubs/InMemoryUserAccountRepository';
import { User } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';
import { Password } from '../../../../src/domain/value-objects/Password';

describe('InMemoryUserAccountRepository', () => {
  // MCQS Prevention: Test edge cases for empty constructor
  it('handles empty seed iterable correctly', () => {
    const repository = new InMemoryUserAccountRepository();
    expect(repository.list()).toHaveLength(0);
  });

  it('handles empty array seed correctly', () => {
    const repository = new InMemoryUserAccountRepository([]);
    expect(repository.list()).toHaveLength(0);
  });

  // Test core functionality
  it('saves and retrieves users correctly', async () => {
    const repository = new InMemoryUserAccountRepository();
    const email = Email.create('test@example.com');
    const password = await Password.create('secure-password-123');
    const user = User.create({
      email,
      name: 'Test User',
      password,
      role: 'user'
    });

    await repository.save(user);
    
    const retrieved = await repository.findByEmail(email);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.email.value).toBe('test@example.com');
    expect(retrieved!.name).toBe('Test User');
  });

  it('returns null for non-existent users', async () => {
    const repository = new InMemoryUserAccountRepository();
    const email = Email.create('nonexistent@example.com');
    
    const result = await repository.findByEmail(email);
    expect(result).toBeNull();
  });

  it('handles duplicate saves correctly', async () => {
    const repository = new InMemoryUserAccountRepository();
    const email = Email.create('duplicate@example.com');
    const password = await Password.create('secure-password-123');

    const user1 = User.create({
      email,
      name: 'User 1',
      password,
      role: 'user'
    });

    const user2 = User.create({
      email,
      name: 'User 2',
      password: await Password.create('another-password-123'),
      role: 'admin'
    });

    await repository.save(user1);
    await repository.save(user2); // Should overwrite
    
    const retrieved = await repository.findByEmail(email);
    expect(retrieved!.name).toBe('User 2');
    expect(retrieved!.role).toBe('admin');
  });

  it('seeds users correctly in constructor', async () => {
    const email = Email.create('seeded@example.com');
    const password = await Password.create('seeded-password-123');
    const seededUser = User.create({
      email,
      name: 'Seeded User',
      password,
      role: 'user'
    });

    const repository = new InMemoryUserAccountRepository([seededUser]);
    
    expect(repository.list()).toHaveLength(1);
    expect(repository.list()[0].name).toBe('Seeded User');
  });

  it('clears all users correctly', async () => {
    const email = Email.create('to-be-cleared@example.com');
    const password = await Password.create('password-123456');
    const user = User.create({
      email,
      name: 'To Be Cleared',
      password,
      role: 'user'
    });

    const repository = new InMemoryUserAccountRepository([user]);
    expect(repository.list()).toHaveLength(1);
    
    repository.clear();
    expect(repository.list()).toHaveLength(0);
  });

  // MCQS Prevention: Test edge cases for normalize method
  it('normalizes email correctly with whitespace', () => {
    const repository = new InMemoryUserAccountRepository() as any; // Access private method
    expect(repository.normalize('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
  });

  it('normalizes email correctly with mixed case', () => {
    const repository = new InMemoryUserAccountRepository() as any; // Access private method
    expect(repository.normalize('Test@Example.Com')).toBe('test@example.com');
  });
});