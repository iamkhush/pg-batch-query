import assert from 'assert'
import pg from 'pg'
import QueryStream from 'pg-query-stream'
import BatchQuery from '../src'

describe('pg-batch-query and pg-query-stream', function () {
  let client: pg.Client

  beforeEach(async function () {
    client = new pg.Client()
    await client.connect()
    await client.query('CREATE TEMP TABLE source_data (id INT, name TEXT)')
    await client.query('CREATE TEMP TABLE target_data (id INT, name TEXT)')
    for (let i = 0; i < 100; i++) {
      await client.query('INSERT INTO source_data (id, name) VALUES ($1, $2)', [i, `name-${i}`])
    }
  })

  afterEach(function () {
    client.end()
  })

  it('can be used together to process a stream of data', async function () {
    const queryStream = new QueryStream('SELECT * FROM source_data')
    const stream = client.query(queryStream)

    const batchSize = 10
    let values: string[][] = []
    let executionPromises: Promise<any>[] = []

    for await (const row of stream) {
      values.push([row.id.toString(), row.name])
      if (values.length === batchSize) {
        const batchQuery = new BatchQuery({
          text: 'INSERT INTO target_data (id, name) VALUES ($1, $2)',
          values: values,
        })
        executionPromises.push(client.query(batchQuery).execute())
        values = []
      }
    }

    // Insert any remaining values
    if (values.length > 0) {
      const batchQuery = new BatchQuery({
        text: 'INSERT INTO target_data (id, name) VALUES ($1, $2)',
        values: values,
      })
      executionPromises.push(client.query(batchQuery).execute())
    }

    await Promise.all(executionPromises)

    const result = await client.query('SELECT COUNT(*) FROM target_data')
    assert.strictEqual(parseInt(result.rows[0].count, 10), 100)
  })
})