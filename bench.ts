import pg from 'pg'
import BatchQuery from './src'

const insert = (value) => ({
  text: 'INSERT INTO foobar(name, age) VALUES ($1, $2)',
  values: ['joe' + value, value],
})

const select = (value) => ({
  text: 'SELECT FROM foobar where name = $1 and age = $2',
  values: ['joe' + value, value],
})

let counter = 0

const simpleExec = async (client, getQuery, count) => {
  const query = getQuery(count)
  await client.query({
    text: query.text,
    values: query.values,
    rowMode: 'array',
  })
}

const batchExec = async (client, getQuery, count, queryCount = 5) => {
  const query = getQuery(count)
  const values: any[][] = []
  for (let i = 0; i < queryCount; i++) {
    values.push(['joey' + i, i])
  }

  const batchQuery = new BatchQuery({
    name: 'optional' + counter++,
    text: query.text,
    values
  })
  await client.query(batchQuery).execute()
}

const bench = async (client, mainMethod, q, time, queryCount = 5) => {
  let start = Date.now()
  let count = 0
  while (true) {
    await mainMethod(client, q, count, queryCount)
    count++
    if (Date.now() - start > time) {
      return count
    }
  }
}

const run = async () => {
  const client = new pg.Client()
  await client.connect()
  console.log('start')
  await client.query('CREATE TEMP TABLE foobar(name TEXT, age NUMERIC)')
  console.log('warmup done')
  const seconds = 5

  // run benchmark tests
  for (let i = 0; i < 4; i++) {
    let queries = await bench(client, simpleExec, insert, seconds * 1000)
    console.log('')
    console.log('insert queries:', queries)
    console.log('qps', queries / seconds)
    console.log('on my laptop best so far seen 16115.4 qps')

    queries = await bench(client, batchExec, insert, seconds * 1000)
    console.log('')
    console.log('insert batch queries:', queries * 5)
    console.log('qps', queries * 5 / seconds)
    console.log('on my laptop best so far seen 42646 qps')

    queries = await bench(client, simpleExec, select, seconds * 1000)
    console.log('')
    console.log('select queries:', queries)
    console.log('qps', queries / seconds)
    console.log('on my laptop best so far seen 18579.8 qps')

    queries = await bench(client, batchExec, select, seconds * 1000)
    console.log('')
    console.log('select batch queries:', queries * 5)
    console.log('qps', queries * 5 / seconds)
    console.log('on my laptop best so far seen 44887 qps')
  }

  // find ideal 
  // for (let i = 500; i < 501; i++) {
  //   let queries = await bench(client, batchExec, select, seconds * 1000, i)
  //   console.log('')
  //   console.log('insert batch queries:', queries * i)
  //   console.log('qps for ' + i + 'queries', queries * i / seconds)
  //   // console.log('on my laptop best so far seen 42646 qps')
  // }

  await client.end()
  await client.end()
}

run().catch((e) => Boolean(console.error(e)) || process.exit(-1))
