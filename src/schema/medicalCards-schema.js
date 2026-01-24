// schemas.js
const yup = require('yup');

const medicalCardsSchema = yup.object({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    target: yup.string().required(),
    description: yup.string().required(),
    priority: yup.string().required(),
    doctor: yup.string().required(),
    age: yup.number().min(0).max(110).optional(),
    pressure: yup.string().matches(/^\d{2,3}\/\d{2,3}$/).optional(),
    index: yup.number().min(0).max(40).optional(),
    diagnosis: yup.string().max(1000).optional(),
    lastVisit: yup.date().max(new Date()).optional(),
})

module.exports = { medicalCardsSchema };