import { QueryResult, Submittable, QueryConfig } from 'pg'
import BatchQuery from './index'

declare module 'pg' {
  interface Client {
    query<T extends Submittable>(query: T): T extends BatchQuery<any> ? T : Submittable & Promise<QueryResult>
    query(query: string | QueryConfig, values?: any[]): Promise<QueryResult>
  }
}