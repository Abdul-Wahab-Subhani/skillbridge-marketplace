const { validationResult } = require('express-validator');

/**
 * Runs after express-validator chains; returns 400 with all
 * validation error messages if any chain failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join(', '),
      errors: errors.array(),
    });
  }
  next();
};

module.exports = validate;
