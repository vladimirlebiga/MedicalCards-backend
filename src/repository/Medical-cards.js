const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'MedicalCards',
  tableName: 'medical_cards',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    firstName: {
      type: String,
      nullable: false,
    },
    lastName: {
      type: String,
      nullable: false,
    },
    target: {
      type: String,
      nullable: false,
    },
    dateVisit: {
      type: Date,
      nullable: false,
    },
    description: {
      type: String,
      nullable: false,
    },
    priority: {
      type: String,
      nullable: false,
    },
    doctor: {
      type: String,
      nullable: false,
    },
    age: {
      type: Number,
      nullable: true,
    },
    pressure: {
      type: String,
      nullable: true,
    },
    index: {
      type: Number,
      nullable: true,
    },
    diagnosis: {
      type: String,
      nullable: true,
    },
    lastVisit: {
      type: Date,
      nullable: true,
    },
    userId: {
      type: Number,
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
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'userId',
        referencedColumnName: 'id',
      },
      inverseSide: 'medicalCards',
    },
  },
});