const ActivityLog = require('../models/ActivityLog');

/**
 * Fire-and-forget activity logger. Never throws - logging failures
 * should never break the main request flow.
 */
const logActivity = async (userId, action, description = '', meta = {}) => {
  try {
    await ActivityLog.create({ user: userId, action, description, meta });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

module.exports = logActivity;
