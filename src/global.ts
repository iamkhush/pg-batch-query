// This file is used to augment the pg Client and PoolClient interfaces
// It gets loaded by index.ts to ensure augmentations are applied project-wide

import { QueryResult, QueryResultRow, QueryConfig, Submittable } from 'pg'
import BatchQuery from './index'

declare module 'pg' {
  interface Client {
    // Original query method overloads
    query(queryText: string, values?: any[]): Promise<QueryResult>
    query(queryConfig: QueryConfig): Promise<QueryResult>

    // Submittable overload for BatchQuery , QueryStream, etc.
    query<T extends Submittable>(submittable: T): T

    // BatchQuery specific overload ( returns BatchQuery instance for chaining )
    /**
     * Execute a batch query using pg-batch-query
     * @param batchQuery - The BatchQuery instance to execute
     * @returns BatchQuery instance for further chaining ( call .execute() to get Promise )
     */
    query<T extends QueryResultRow, V extends any[]>(batchQuery: BatchQuery<T, V>): BatchQuery<T, V>
  }

  interface PoolClient {
    // Original query method overloads
    query(queryText: string, values?: any[]): Promise<QueryResult>
    query(queryConfig: QueryConfig): Promise<QueryResult>

    // Submittable overload for BatchQuery , QueryStream, etc.
    query<T extends Submittable>(submittable: T): T

    // BatchQuery specific overload ( returns BatchQuery instance for chaining )
    /**
     * Execute a batch query using pg-batch-query
     * @param batchQuery - The BatchQuery instance to execute
     * @returns BatchQuery instance for further chaining ( call .execute() to get Promise )
     */
    query<T extends QueryResultRow, V extends any[]>(batchQuery: BatchQuery<T, V>): BatchQuery<T, V>
  }
}
