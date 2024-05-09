const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'studentdb',
    password: '79615',
    port: 5432,
});

module.exports = pool;