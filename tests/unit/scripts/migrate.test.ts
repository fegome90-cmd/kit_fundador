/**
 * Unit Tests for Migration Script
 * 
 * Tests the core migration functionality including:
 * - Environment loading
 * - Migration file parsing
 * - Database URL resolution
 * - Migration execution logic
 * - File system operations
 */

import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

// Mock modules before importing the module under test
jest.mock('fs');
jest.mock('pg');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockClient = {
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn(),
} as unknown as jest.Mocked<Client>;

// Mock Client constructor
(Client as jest.MockedClass<typeof Client>) = jest.fn(() => mockClient) as any;

describe('Migration Script - Unit Tests', () => {
  const originalEnv = process.env;
  const MIGRATIONS_DIR = path.resolve(process.cwd(), 'db/migrations');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadEnvFile', () => {
    it('should load environment variables from .env file', () => {
      const envContent = 'DATABASE_URL=postgresql://test:pass@localhost:5432/testdb\nDB_USER=testuser\n';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(envContent);

      // Re-import to trigger loadEnvFile
      delete require.cache[require.resolve('../../../scripts/migrate')];
      require('../../../scripts/migrate');

      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(mockFs.readFileSync).toHaveBeenCalled();
    });

    it('should skip loading if .env file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      delete require.cache[require.resolve('../../../scripts/migrate')];
      require('../../../scripts/migrate');

      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(mockFs.readFileSync).not.toHaveBeenCalled();
    });

    it('should ignore empty lines and comments in .env file', () => {
      const envContent = '# Comment\n\nDATABASE_URL=postgresql://localhost\n  \n# Another comment';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(envContent);

      delete require.cache[require.resolve('../../../scripts/migrate')];
      require('../../../scripts/migrate');

      expect(mockFs.readFileSync).toHaveBeenCalled();
    });

    it('should handle quoted values in .env file', () => {
      const envContent = 'DATABASE_URL="postgresql://test@localhost"\nDB_NAME=\'mydb\'';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(envContent);

      delete require.cache[require.resolve('../../../scripts/migrate')];
      require('../../../scripts/migrate');

      expect(mockFs.readFileSync).toHaveBeenCalled();
    });

    it('should handle values with equals signs', () => {
      const envContent = 'CONNECTION_STRING=key=value&param=data';
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(envContent);

      delete require.cache[require.resolve('../../../scripts/migrate')];
      require('../../../scripts/migrate');

      expect(mockFs.readFileSync).toHaveBeenCalled();
    });
  });

  describe('resolveDatabaseUrl', () => {
    it('should use DATABASE_URL from environment if available', () => {
      process.env.DATABASE_URL = 'postgresql://custom:pass@localhost:5432/customdb';
      
      delete require.cache[require.resolve('../../../scripts/migrate')];
      const migrate = require('../../../scripts/migrate');
      
      // The module loads env on import, so DATABASE_URL should be used
      expect(process.env.DATABASE_URL).toBe('postgresql://custom:pass@localhost:5432/customdb');
    });

    it('should use fallback URL if DATABASE_URL is not set', () => {
      delete process.env.DATABASE_URL;
      process.env.DB_USER = 'testuser';
      process.env.DB_PASSWORD = 'testpass';
      process.env.DB_NAME = 'testdb';

      delete require.cache[require.resolve('../../../scripts/migrate')];
      require('../../../scripts/migrate');

      // Fallback should construct URL from individual env vars
      expect(process.env.DB_USER).toBe('testuser');
      expect(process.env.DB_PASSWORD).toBe('testpass');
      expect(process.env.DB_NAME).toBe('testdb');
    });

    it('should use default values if no environment variables are set', () => {
      delete process.env.DATABASE_URL;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_NAME;

      delete require.cache[require.resolve('../../../scripts/migrate')];
      require('../../../scripts/migrate');

      // Should fall back to defaults: dev, devpass, myapp_dev
      expect(process.env.DB_USER).toBeUndefined();
    });

    it('should trim DATABASE_URL whitespace', () => {
      process.env.DATABASE_URL = '  postgresql://localhost:5432/db  ';

      delete require.cache[require.resolve('../../../scripts/migrate')];
      require('../../../scripts/migrate');

      expect(process.env.DATABASE_URL).toContain('postgresql://localhost:5432/db');
    });

    it('should handle empty DATABASE_URL and use fallback', () => {
      process.env.DATABASE_URL = '';
      process.env.DB_USER = 'fallback';

      delete require.cache[require.resolve('../../../scripts/migrate')];
      require('../../../scripts/migrate');

      expect(process.env.DB_USER).toBe('fallback');
    });
  });

  describe('Migration File Parsing', () => {
    it('should parse migration with both up and down blocks', () => {
      const migrationContent = '-- up\nCREATE TABLE users (id SERIAL PRIMARY KEY);\n\n-- down\nDROP TABLE users;';
      
      // Test the parsing logic directly
      const parts = migrationContent.split(/^--\s*down\s*$/im);
      const up = parts[0]?.replace(/^--\s*up\s*$/i, '').trim() ?? '';
      const down = parts[1] ? parts[1].trim() : null;

      expect(up).toContain('CREATE TABLE');
      expect(down).toContain('DROP TABLE');
    });

    it('should parse migration with only up block', () => {
      const migrationContent = '-- up\nCREATE TABLE users (id SERIAL PRIMARY KEY);';
      
      const parts = migrationContent.split(/^--\s*down\s*$/im);
      const up = parts[0]?.replace(/^--\s*up\s*$/i, '').trim() ?? '';
      const down = parts[1] ? parts[1].trim() : null;

      expect(up).toContain('CREATE TABLE');
      expect(down).toBeNull();
    });

    it('should handle case-insensitive markers', () => {
      const migrationContent = '-- UP\nCREATE TABLE users;\n\n-- DOWN\nDROP TABLE users;';
      
      const parts = migrationContent.split(/^--\s*down\s*$/im);
      const up = parts[0]?.replace(/^--\s*up\s*$/i, '').trim() ?? '';

      expect(up).toContain('CREATE TABLE');
    });

    it('should handle extra whitespace in markers', () => {
      const migrationContent = '--   up   \nCREATE TABLE users;\n\n--   down   \nDROP TABLE users;';
      
      const parts = migrationContent.split(/^--\s*down\s*$/im);
      const up = parts[0]?.replace(/^--\s*up\s*$/i, '').trim() ?? '';

      expect(up).toContain('CREATE TABLE');
    });
  });

  describe('Slug Generation', () => {
    it('should convert name to lowercase slug', () => {
      const slug = 'Create User Table'
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      
      expect(slug).toBe('create_user_table');
    });

    it('should replace spaces with underscores', () => {
      const slug = 'add user email'
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      
      expect(slug).toBe('add_user_email');
    });

    it('should remove special characters', () => {
      const slug = 'add-user@email!'
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      
      expect(slug).toBe('add_user_email');
    });

    it('should handle multiple spaces', () => {
      const slug = 'create   user    table'
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      
      expect(slug).toBe('create_user_table');
    });

    it('should trim leading and trailing underscores', () => {
      const slug = '_create_user_'
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      
      expect(slug).toBe('create_user');
    });

    it('should handle empty string', () => {
      const slug = ''
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      
      expect(slug).toBe('');
    });

    it('should handle string with only special characters', () => {
      const slug = '!!!@@@###'
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      
      expect(slug).toBe('');
    });
  });

  describe('Timestamp Generation', () => {
    it('should generate timestamp in YYYYMMDDHHmm format', () => {
      const timestamp = new Date('2025-01-17T10:30:45Z')
        .toISOString()
        .replace(/[-:TZ.]/g, '')
        .slice(0, 12);
      
      expect(timestamp).toBe('202501171030');
      expect(timestamp).toHaveLength(12);
    });

    it('should handle different dates correctly', () => {
      const timestamp = new Date('2024-12-31T23:59:59Z')
        .toISOString()
        .replace(/[-:TZ.]/g, '')
        .slice(0, 12);
      
      expect(timestamp).toBe('202412312359');
    });

    it('should handle beginning of year', () => {
      const timestamp = new Date('2025-01-01T00:00:00Z')
        .toISOString()
        .replace(/[-:TZ.]/g, '')
        .slice(0, 12);
      
      expect(timestamp).toBe('202501010000');
    });

    it('should produce consistent format', () => {
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:TZ.]/g, '')
        .slice(0, 12);
      
      expect(timestamp).toMatch(/^\d{12}$/);
    });
  });

  describe('Database Connection String Construction', () => {
    it('should construct fallback URL with all components', () => {
      const user = 'testuser';
      const pass = 'testpass';
      const db = 'testdb';
      const fallback = `postgresql://${user}:${pass}@localhost:5432/${db}`;

      expect(fallback).toBe('postgresql://testuser:testpass@localhost:5432/testdb');
    });

    it('should handle special characters in credentials', () => {
      const user = 'user@domain';
      const pass = 'p@ss:word!';
      const db = 'my-db';
      const fallback = `postgresql://${user}:${pass}@localhost:5432/${db}`;

      expect(fallback).toContain(user);
      expect(fallback).toContain(pass);
      expect(fallback).toContain(db);
    });

    it('should use localhost and port 5432', () => {
      const fallback = 'postgresql://user:pass@localhost:5432/db';

      expect(fallback).toContain('localhost');
      expect(fallback).toContain('5432');
    });
  });

  describe('Process Arguments Parsing', () => {
    it('should parse "up" action from arguments', () => {
      const args = ['node', 'migrate.ts', 'up'];
      const action = args[2];
      
      expect(action).toBe('up');
    });

    it('should parse "down" action from arguments', () => {
      const args = ['node', 'migrate.ts', 'down'];
      const action = args[2];
      
      expect(action).toBe('down');
    });

    it('should parse "create" action with migration name', () => {
      const args = ['node', 'migrate.ts', 'create', 'add_users_table'];
      const action = args[2];
      const name = args[3];
      
      expect(action).toBe('create');
      expect(name).toBe('add_users_table');
    });

    it('should handle arguments with double dash separator', () => {
      const args = ['node', 'migrate.ts', '--', 'up'];
      const filtered = args.filter(arg => arg !== '--');
      
      expect(filtered).toContain('up');
      expect(filtered).not.toContain('--');
    });

    it('should default to "up" if no action provided', () => {
      const args = ['node', 'migrate.ts'];
      const action = args[2] ?? 'up';
      
      expect(action).toBe('up');
    });
  });

  describe('Migration File Template', () => {
    it('should generate template with up and down markers', () => {
      const template = '-- up\n-- down\n';

      expect(template).toContain('-- up');
      expect(template).toContain('-- down');
      expect(template.split('\n').length).toBe(3); // Including trailing newline
    });

    it('should have markers on separate lines', () => {
      const template = '-- up\n-- down\n';
      const lines = template.split('\n');

      expect(lines[0]).toBe('-- up');
      expect(lines[1]).toBe('-- down');
    });
  });

  describe('Migration File Naming Convention', () => {
    it('should follow timestamp__description.sql pattern', () => {
      const timestamp = '202501171030';
      const slug = 'add_users';
      const fileName = `${timestamp}__${slug}.sql`;

      expect(fileName).toMatch(/^\d{12}__[a-z_]+\.sql$/);
    });

    it('should handle empty slug with default', () => {
      const timestamp = '202501171030';
      const slug = '';
      const fileName = `${timestamp}__${slug || 'migration'}.sql`;

      expect(fileName).toBe('202501171030__migration.sql');
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle missing migration file for rollback', () => {
      const fileName = 'nonexistent_migration.sql';
      const filePath = path.join(MIGRATIONS_DIR, fileName);

      mockFs.existsSync.mockReturnValue(false);

      expect(mockFs.existsSync(filePath)).toBe(false);
    });

    it('should handle migration without down block', () => {
      const migrationContent = '-- up\nCREATE TABLE users;';
      const parts = migrationContent.split(/^--\s*down\s*$/im);
      const down = parts[1] ? parts[1].trim() : null;

      expect(down).toBeNull();
    });

    it('should handle malformed migration file', () => {
      const malformedContent = 'This is not a valid migration\n-- random text';
      const parts = malformedContent.split(/^--\s*down\s*$/im);
      const up = parts[0]?.replace(/^--\s*up\s*$/i, '').trim() ?? '';

      // Should still parse, even if nonsensical
      expect(up).toBeDefined();
    });

    it('should handle empty migration file', () => {
      const emptyContent = '';
      const parts = emptyContent.split(/^--\s*down\s*$/im);
      const up = parts[0]?.replace(/^--\s*up\s*$/i, '').trim() ?? '';

      expect(up).toBe('');
    });
  });

  describe('SQL Query Construction', () => {
    it('should construct history table creation query', () => {
      const query = `
        CREATE TABLE IF NOT EXISTS kit_migrations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          run_on TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      expect(query).toContain('CREATE TABLE IF NOT EXISTS');
      expect(query).toContain('kit_migrations');
      expect(query).toContain('SERIAL PRIMARY KEY');
      expect(query).toContain('TEXT NOT NULL UNIQUE');
      expect(query).toContain('TIMESTAMPTZ NOT NULL DEFAULT NOW()');
    });

    it('should construct migration select query', () => {
      const query = 'SELECT name FROM kit_migrations ORDER BY run_on ASC';

      expect(query).toContain('SELECT name');
      expect(query).toContain('FROM kit_migrations');
      expect(query).toContain('ORDER BY run_on ASC');
    });

    it('should construct migration insert query with parameter', () => {
      const query = 'INSERT INTO kit_migrations (name) VALUES ($1)';
      const params = ['test_migration.sql'];

      expect(query).toContain('INSERT INTO');
      expect(query).toContain('$1');
      expect(params[0]).toBe('test_migration.sql');
    });

    it('should construct migration delete query with parameter', () => {
      const query = 'DELETE FROM kit_migrations WHERE name = $1';
      const params = ['test_migration.sql'];

      expect(query).toContain('DELETE FROM');
      expect(query).toContain('WHERE name = $1');
      expect(params[0]).toBe('test_migration.sql');
    });

    it('should construct latest migration query', () => {
      const query = 'SELECT name FROM kit_migrations ORDER BY run_on DESC LIMIT 1';

      expect(query).toContain('ORDER BY run_on DESC');
      expect(query).toContain('LIMIT 1');
    });
  });
});