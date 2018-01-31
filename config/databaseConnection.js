const sql = require('mssql');
const config = {  
    user: 'transfer',
    password: '!@34%^',
    server: '10.10.10.203', 
    port: '1433',
    database: 'Unique_Golf',
     pool: {
            max: 1000,
            min: 0,
            idleTimeoutMillis: 30000,
            acquire: 20000
        }
    };    
    //const pool = sql.connect(config)

    var connection = new sql.connect(config)
    //store the connection
    sql.globalConnection = connection;
    //module.exports = config;