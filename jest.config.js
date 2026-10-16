module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@domain/(.*)$': '<rootDir>/examples/identity-access/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/examples/identity-access/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/examples/identity-access/src/infrastructure/$1'
  }
};
: ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }] },
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@domain/(.*)$': '<rootDir>/examples/identity-access/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/examples/identity-access/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/examples/identity-access/src/infrastructure/$1'
  }
};
