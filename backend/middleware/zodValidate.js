const zodValidate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err.errors || err.issues) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: (err.errors || err.issues).map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      });
    }
    return res.status(400).json({ message: 'Invalid request data' });
  }
};

module.exports = zodValidate;