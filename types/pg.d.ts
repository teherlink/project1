declare module 'pg' {
  import { EventEmitter } from 'events';
  import { ConnectionConfig } from 'tls';

  export interface QueryResultBase {
    command: string;
    rowCount: number;
    oid: number;
  }

  export interface QueryResultRow {
    [column: string]: any;
  }

  export interface QueryResult<R extends QueryResultRow = QueryResultRow> extends QueryResultBase {
    rows: R[];
  }

  export interface PoolConfig extends ConnectionConfig {
    connectionString?: string;
  }

  export class Pool extends EventEmitter {
    constructor(config?: PoolConfig);
    connect(): Promise<PoolClient>;
    query<R extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<R>>;
    end(): Promise<void>;
  }

  export interface PoolClient extends Pool {
    release(): void;
  }
}
