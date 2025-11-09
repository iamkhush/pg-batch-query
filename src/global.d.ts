import { QueryResult, QueryResultRow, QueryConfig } from 'pg'
import BatchQuery from './index'

declare module 'pg' {
  interface Client {
    // Original query method overloads
    query(queryText: string, values?: any[]): Promise<QueryResult>
    query(queryConfig: QueryConfig): Promise<QueryResult>

    // BatchQuery specific overload
    /**
     * Execute a batch query using pg-batch-query
     * @param batchQuery - The BatchQuery instance to execute
     * @returns Promise resolving to an array of QueryResult objects
     */
    query<T extends QueryResultRow>(batchQuery: BatchQuery<T>): Promise<QueryResult<T>[]>
  }

  interface PoolClient {
    // Original query method overloads
    query(queryText: string, values?: any[]): Promise<QueryResult>
    query(queryConfig: QueryConfig): Promise<QueryResult>

    // BatchQuery specific overload
    /**
     * Execute a batch query using pg-batch-query
     * @param batchQuery - The BatchQuery instance to execute
     * @returns Promise resolving to an array of QueryResult objects
     */
    query<T extends QueryResultRow>(batchQuery: BatchQuery<T>): Promise<QueryResult<T>[]>
  }
}
