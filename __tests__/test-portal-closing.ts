import assert from 'assert'
import BatchQuery from '../src'
import pg from 'pg'

describe('batch query portal closing', function () {
  beforeEach(async function () {
    const client = (this.client = new pg.Client())
    await client.connect()
    await client.query('CREATE TEMP TABLE foo(name TEXT, id SERIAL PRIMARY KEY)')
  })

  afterEach(function () {
    this.client.end()
  })

  it('should close all portals', async function () {
    const batch = new BatchQuery({
      text: 'INSERT INTO foo (name) VALUES ($1)',
      values: [
        ['first'],
        ['second'],
      ],
    })

    await this.client.query(batch).execute()

    // Check if any cursors are left open
    const res = await this.client.query("SELECT * FROM pg_cursors")
    assert.strictEqual(res.rowCount, 0, "All cursors should be closed")
  })
})
