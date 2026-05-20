import supabase from '../config/supabase.js';

/** GET /api/activity - Get activity logs */
export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('activity_logs')
      .select('*, users(full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Non-admins only see their own logs
    if (req.user.role === 'USER') {
      query = query.eq('user_id', req.user.id);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch activity logs.' });
  }
};

/** GET /api/activity/stats - Get dashboard stats */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rfpsResult, knowledgeResult, recentActivity] = await Promise.all([
      supabase.from('rfps').select('id, status', { count: 'exact' }).eq('user_id', userId),
      supabase.from('knowledge_docs').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('activity_logs').select('action, created_at').eq('user_id', userId)
        .order('created_at', { ascending: false }).limit(10),
    ]);

    const rfps = rfpsResult.data || [];
    const stats = {
      totalRFPs: rfpsResult.count || 0,
      analyzedRFPs: rfps.filter(r => r.status === 'analyzed' || r.status === 'completed').length,
      completedRFPs: rfps.filter(r => r.status === 'completed').length,
      knowledgeDocs: knowledgeResult.count || 0,
      recentActivity: recentActivity.data || [],
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
};
