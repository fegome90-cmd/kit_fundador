const value = process.env.AUTH_MIGRATION_DATABASE_URL;
if (typeof value !== 'string' || !/^postgres(?:ql)?:\/\//.test(value)) {
  process.stderr.write('AUTH_MIGRATION_DATABASE_URL is required to migrate auth schema.\n');
  process.exit(1);
}
// The migration role and URL are never required at runtime and never printed.
