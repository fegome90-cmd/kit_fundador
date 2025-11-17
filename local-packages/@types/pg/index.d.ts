// Minimal subset of the official @types/pg declarations required by Kit Fundador CLI scripts.
declare module 'pg' {
  interface QueryResultRow {
    [column: string]: any;
  }

  interface QueryResult<T extends QueryResultRow = QueryResultRow> {
    rows: T[];
    rowCount: number;
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
    query<T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }

  export { Client, ClientConfig, QueryResult, QueryResultRow };
}
