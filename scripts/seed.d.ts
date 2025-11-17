/**
 * Connects to the configured database, performs the minimal seed operations, and closes the connection.
 *
 * Determines the database connection URL from the environment (or a fallback), logs the target
 * database name without exposing credentials, runs required seed inserts, and ensures the
 * database client is closed; if closing fails, a warning is logged.
 */
declare function runSeed(): Promise<void>;
export { runSeed };
//# sourceMappingURL=seed.d.ts.map