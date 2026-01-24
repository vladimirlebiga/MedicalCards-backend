// validation.js
const { ValidationError } = require('yup');

/**
 * Make a validator middleware for body/query/params/headers using a Yup schema.
 * @param {import('yup').AnySchema} schema
 * @param {'body'|'query'|'params'|'headers'} [source='body']
 */

function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      // Validate and return all errors (abortEarly: false).
      const value = await schema.validate(req[source], {
        abortEarly: false,
        // If you want to disallow unknown keys, call .noUnknown() in the schema itself.
        // strict: false // (coercions allowed if you added transforms in schema)
      });
      // Replace with the validated value (ensures defaults/transforms apply)
      req[source] = value;
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: err.inner?.length
            ? err.inner.map(e => ({ path: e.path, message: e.message }))
            : [{ path: err.path, message: err.message }],
        });
      }
      next(err);
    }
  };
}

module.exports = { validate };
