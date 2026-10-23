// Prevent accidental migration or enqueue against anything other than the
// fixed, ephemeral GitHub Actions services of the synthetic Full B laboratory.
// This is a CI misuse guard, not an authentication mechanism.
const expectedPG = Object.freeze({
  PG_ADMIN_URL: 'postgres',
  MIGRATION_DATABASE_URL: 'postgres',
  AUTH_MIGRATION_DATABASE_URL: 'postgres',
  FULLB_DB_URL: 'lego_fullb_app',
  FULLB_AUTH_URL: 'lego_fullb_auth',
});
function denied(name) { throw new Error('Full B laboratory endpoint denied: ' + name); }
export function assertFullBLaboratoryEndpoints(env) {
  if (env?.GITHUB_ACTIONS !== 'true') denied('GITHUB_ACTIONS');
  for (const [name, user] of Object.entries(expectedPG)) {
    let uri;
    try { uri = new URL(env?.[name]); } catch { denied(name); }
    if (uri.protocol !== 'postgresql:' ||
        uri.hostname !== '127.0.0.1' || uri.port !== '5432' ||
        uri.pathname !== '/lego_fullb_ci' || uri.username !== user ||
        !uri.password || uri.search || uri.hash) denied(name);
  }
  let valkey;
  try { valkey = new URL(env?.VALKEY_URL); } catch { denied('VALKEY_URL'); }
  if (valkey.protocol !== 'redis:' || valkey.hostname !== '127.0.0.1' ||
      valkey.port !== '6379' || valkey.username || valkey.password ||
      !['', '/', '/0'].includes(valkey.pathname) ||
      valkey.search || valkey.hash) denied('VALKEY_URL');
}
