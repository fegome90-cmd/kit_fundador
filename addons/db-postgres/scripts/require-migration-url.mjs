const url = process.env.MIGRATION_DATABASE_URL;
if (typeof url !== 'string' || !/^postgres(?:ql)?:\/\//.test(url)) {
  process.stderr.write('MIGRATION_DATABASE_URL is required to apply migrations.\n');
  process.exit(1);
}
// Never echo the URL or pass it as a CLI argument; credentials stay in env.
