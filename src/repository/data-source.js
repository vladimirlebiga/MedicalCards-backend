const { DataSource } = require('typeorm');
const { constants } = require('../constants/constants');
const User = require('./User');
const MedicalCards = require('./Medical-cards');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: constants.DB_HOST,
  port: Number(constants.DB_PORT || 5432),
  username: constants.DB_USER,
  password: constants.DB_PASS,
  database: constants.DB_NAME,
  // Turn on in dev, OFF in prod — use migrations there
  synchronize: true,
  logging: true,
  entities: [User, MedicalCards], 
  migrations: ['src/migrations/*.js'],
});

module.exports = { AppDataSource };
