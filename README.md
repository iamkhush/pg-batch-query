# pg-batch-query ![](https://github.com/iamkhush/pg-batch-query/actions/workflows/ci.yml/badge.svg)

Batches queries by using the [Extended query protocol](https://www.postgresql.org/docs/current/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY).
Essentially we do the following
- send a single PARSE command to create a named statement.
- send a pair of BIND and EXECUTE commands
- Finally send a SYNC to close the current transaction.

As [per benchmark tests](./bench.ts), number of queries per seconds gets tripled using batched queries.

## installation

```bash
$ yarn add pg
$ yarn add pg-batch-query
```

## Usage

### Javacript (CommonJs)

```javascript
const pg = require('pg')
const BatchQuery = require('pg-batch-query')

const pool = new pg.Pool()

async function query() {
  const client = await pool.connect()
  try {
    const batch = new BatchQuery({
      name: 'optional',
      text: 'SELECT * from foo where bar = $1',
      values: [
        ['first'],
        ['second']
      ]
    })

    const result = await client.query(batch).execute()
    for (const res of result) {
      for (const row of res.rows) {
        console.log(row)
      }
    }
  } finally {
    client.release()
  }
}

query().catch(console.error)
```
### TypeScript (ES Modules)

```typescript
import pg from 'pg'
import BatchQuery from 'pg-batch-query'

const pool = new pg.Pool()

// Define row type
interface User {
  id: number
  name: string
  created_at: Date
}

async function query() {
  const client = await pool.connect()
  try {
    const batch = new BatchQuery<User>({
      name: 'fetch_users',
      text: 'SELECT * from users where name = $1 and created_at = $2',
      values: [
        ['first', new Date()],
        ['second', new Date()]
      ]
    })

    const results = await client.query(batch).execute()

    for ( const result of results ) {
      for ( const row of result.rows ) {
        console.log(`User: ${row.name}`, row)
      }
    }
  } finally {
    client.release()
  }
}

query().catch(console.error)
```

### Supported Value types

Batch Query accepts any javascript type that PostgreSQL supports, just like a regular pg query

**Important**: `BatchQuery` instances are stateful and designed for single use. You must create a new instance for every execution. Calling `.execute()` more than once on the same instance will throw an error.


## Testing

To run the tests, you will need to create a `.env` file in the root of the project and add the following environment variables:

```
PGUSER=your_postgres_user
PGHOST=your_postgres_host
PGDATABASE=your_postgres_database
PGPASSWORD=your_postgres_password
PGPORT=your_postgres_port
```

Then, you can run the tests using the following command:

```bash
yarn test
```

## contribution

I'm very open to contribution! Open a pull request with your code or idea and we'll talk about it. If it's not way insane we'll merge it in too: isn't open source awesome?

## license

MIT

Copyright (c) 2023 Ankush Chadda

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
