const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
      nullable: false,
    },
    password: {
      type: String,
      nullable: false,
    },
    email: {
      type: String,
      unique: true,
      nullable: false,
    },
    createdAt: {
      type: 'timestamp with time zone',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp with time zone',
      updateDate: true,
    },
    resetTokenHash: {
      type: String,
      nullable: true,
      default: null,
    },
    resetTokenExpires: {
      type: Date,
      nullable: true,
      default: null,
    }
  },
  relations: {
    medicalCards: {
      type: 'one-to-many',
      target: 'MedicalCards',
      inverseSide: 'user',
    },
  },
});
