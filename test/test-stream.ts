import assert from 'assert'
import BatchQuery from '../src'
import pg from 'pg'

describe('batch pool query', function () {
  beforeEach(async function () {
    this.pool = new pg.Pool({ max: 2 })
    await this.pool.query('CREATE TEMP TABLE foo(name TEXT, id SERIAL PRIMARY KEY)')
  })

  afterEach(function () {
    this.pool.end()
  })

  it('batch insert works', async function () {
    await this.pool.query(new BatchQuery({
        text: 'INSERT INTO foo (name) VALUES ($1)',
        values: [
            ['first'],
            ['second']
        ]
    })).execute()
    const resp = await this.pool.query('SELECT COUNT(*) from foo')
    assert.strictEqual(resp.rows[0]['count'], '2')
  })

  it('batch select works', async function () {
    await this.pool.query('INSERT INTO foo (name) VALUES ($1)', ['first'])
    await this.pool.query('INSERT INTO foo (name) VALUES ($1)', ['second'])
    const responses = await this.pool.query(new BatchQuery({
        text: 'SELECT * from foo where name = $1',
        values: [
            ['first'],
            ['second']
        ],
        name: 'optional'
    })).execute()
    for ( const response of responses) {
      assert.strictEqual(response.rowCount, 1)
    }
  })
})
