// TypeScript declarations for bcrypt module
// Resolves TS7016: Could not find a declaration file for module 'bcrypt'

declare module 'bcrypt' {
  /**
   * Hash data with a salt or rounds.
   * @param data - The data to hash
   * @param saltOrRounds - The salt or number of rounds
   * @returns Promise resolving to hashed string
   */
  export function hash(data: string | Buffer, saltOrRounds: string | number): Promise<string>;

  /**
   * Compare data with an encrypted hash.
   * @param data - The data to compare
   * @param encrypted - The encrypted hash to compare against
   * @returns Promise resolving to boolean indicating match
   */
  export function compare(data: string | Buffer, encrypted: string): Promise<boolean>;

  /**
   * Generate a salt.
   * @param rounds - Number of rounds for salt generation
   * @returns Promise resolving to generated salt
   */
  export function genSalt(rounds?: number): Promise<string>;

  /**
   * Get number of rounds used to hash given hash.
   * @param hash - The hash to examine
   * @returns Number of rounds used
   */
  export function getRounds(hash: string): number;
}
