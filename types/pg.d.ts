declare module 'pg' {
  interface QueryResult<T = any> {
    rows: T[];
    rowCount?: number;
  }

  interface ClientConfig {
    connectionString?: string;
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    database?: string;
    ssl?: boolean | Record<string, unknown>;
  }

  class Client {
    constructor(config?: ClientConfig);
    connect(): Promise<void>;
    query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }

  export { Client, ClientConfig, QueryResult };
}
