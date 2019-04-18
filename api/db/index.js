const { Pool } = require('pg');
const pool = new Pool();

pool.connect((err, client, release) => {
  if(err)
    return console.error('Error acquiring client', err)
    
  client.query('SELECT NOW()', (err, result) => {
    release()
    if(err)
      return console.error('Error executing query', err.stack)
    console.log('Database connected')
  })
})

module.exports = pool;