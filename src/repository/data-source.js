const { DataSource } = require('typeorm');
const { constants } = require('../constants/constants');
const User = require('./User');
const MedicalCards = require('./Medical-cards');

const useUrl = Boolean(constants.DATABASE_URL);

const AppDataSource = new DataSource({
  type: 'postgres',
  ...(useUrl
    ? { url: constants.DATABASE_URL }
    : {
        host: constants.DB_HOST,
        port: Number(constants.DB_PORT || 5432),
        username: constants.DB_USER,
        password: constants.DB_PASS,
        database: constants.DB_NAME,
      }),
  // Required for Neon / most hosted Postgres when using DATABASE_URL
  extra: useUrl ? { ssl: { rejectUnauthorized: false } } : undefined,
  // Turn on in dev, OFF in prod — use migrations there
  synchronize: true,
  logging: true,
  entities: [User, MedicalCards],
  migrations: ['src/migrations/*.js'],
});

module.exports = { AppDataSource };
