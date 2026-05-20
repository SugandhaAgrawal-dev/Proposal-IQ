import supabase from '../config/supabase.js';

/**
 * Activity logging middleware
 * Logs user actions to the activity_logs table
 */
export const logActivity = (action, resourceType = null) => {
  return async (req, res, next) => {
    // Store original json method to intercept response
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Log after response is sent (non-blocking)
      if (req.user) {
        const resourceId = req.params.id || body?.data?.id || null;

        supabase
          .from('activity_logs')
          .insert({
            user_id: req.user.id,
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            metadata: {
              method: req.method,
              path: req.originalUrl,
              status: res.statusCode,
              userAgent: req.headers['user-agent'],
            },
            ip_address: req.ip || req.connection?.remoteAddress,
          })
          .then(() => {})
          .catch((err) => {
            console.error('Activity log error:', err.message);
          });
      }

      return originalJson(body);
    };

    next();
  };
};

/**
 * Direct activity logger (for use in controllers)
 */
export const logAction = async (userId, action, resourceType, resourceId, metadata = {}) => {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

export default { logActivity, logAction };
