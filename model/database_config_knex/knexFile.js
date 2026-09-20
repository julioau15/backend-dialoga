module.exports = {
    development: {
      client: 'mysql2',
      connection: {
        host: 'localhost',
        user: 'root',
        password: 'bcd127',
        database: '',
        port: 3306, 
        charset: 'utf8mb4'
      },

      migrations: {
        tableName: 'knex_migrations',
        directory: './db/migrations'
      },
      seeds: {
        directory: './db/seeds'
      }
    }
};