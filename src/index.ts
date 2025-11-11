import './global'
import { Submittable, Connection, QueryResult, QueryResultRow } from 'pg'
const Result = require('pg/lib/result.js')
const utils = require('pg/lib/utils.js')
let nextUniqueID = 1 // concept borrowed from org.postgresql.core.v3.QueryExecutorImpl

interface BatchQueryConfig<V extends any[] = any[]> {
  name?: string
  text: string
  values: V[]
}

class BatchQuery<T extends QueryResultRow = any, V extends any[] = any[]> implements Submittable {
  name: string | null
  text: string
  values: V[]
  connection: Connection | null
  _portal: string | null
  _result: typeof Result | null
  _results: typeof Result[]
  callback: null | ((err: Error | null, rows: QueryResult<T>[] | null) => void)

  constructor(batchQuery: BatchQueryConfig<V>) {
    const { name, values, text } = batchQuery

    this.name = name ?? null
    this.values = values
    this.text = text
    this.connection = null
    this._portal = null
    this._result = new Result()
    this._results = []
    this.callback = null

    for (const valueSet of values) {
      if (!Array.isArray(valueSet)) {
        throw new Error(
          'Batch commands require each set of values to be an array. e.g. values: any[][]'
        )
      }
    }
  }

  public submit(connection: Connection): void {
    this.connection = connection

    // creates a named prepared statement
    connection.parse(
      {
        text: this.text,
        name: this.name ?? '',
        types: [],
      },
      true
    )

    this.values.map((val) => {
      this._portal = 'C_' + nextUniqueID++
      connection.bind(
        {
          statement: this.name ?? '',
          values: val,
          portal: this._portal,
          valueMapper: utils.prepareValue,
        },
        true
      )

      // maybe we could avoid this for non-select queries
      connection.describe(
        {
          type: 'P',
          name: this._portal,
        },
        true
      )

      connection.execute({ portal: this._portal }, true)
    })

    this.connection.sync()
  }

  public execute(): Promise<QueryResult<T>[]> {
    return new Promise((resolve, reject) => {
      this.callback = (err: Error | null, rows: QueryResult<T>[] | null = null) =>
        err ? reject(err) : rows ? resolve(rows) : []
    })
  }

  handleError(err: Error) {
    this.connection?.flush()
    if (this.callback) {
      this.callback(err, null)
    }
  }

  handleReadyForQuery() {
    if (this.callback) {
      // eslint-disable-next-line no-useless-catch
      try {
        this.callback(null, this._results)
      } catch (err) {
        throw err
      }
    }
  }

  handleRowDescription(msg: any) {
    this._result?.addFields(msg.fields)
  }

  handleDataRow(msg: any) {
    const row = this._result.parseRow(msg.fields)
    this._result.addRow(row)
  }

  handleCommandComplete(msg: any) {
    this._result.addCommandComplete(msg)
    this._results.push(this._result)
    this._result = new Result()
    this.connection?.close({ type: 'P', name: this._portal ?? '' }, true)
  }

  handleEmptyQuery() {
    this.connection?.sync()
  }
}

export default BatchQuery
