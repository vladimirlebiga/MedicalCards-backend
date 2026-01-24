// schemas.js
const yup = require('yup');

// Authorization header must be "Bearer <token>"
const authHeaderSchema = yup
  .object({
    authorization: yup
      .string()
      .required('Authorization header is required')
      .matches(/^Bearer\s+.+$/i, 'Authorization must be a Bearer token'),
  })
  .noUnknown(true);

const loginSchema = yup
  .object({
    email: yup.string().email().required(),
    password: yup.string().min(8).required('Password must be at least 8 characters long'),
  })
  .noUnknown(true);

  const signUpSchema = yup
  .object({
    name: yup.string().required(),
    password: yup.string().min(8).required(),
    email: yup.string().email().required(),
   
   
  })
  .noUnknown(true);

module.exports = { authHeaderSchema, loginSchema, signUpSchema  };
