import supabase from '../config/supabase.js';

export const getThemes = async (req, res) => {
  try {
    const { data, error } = await supabase.from('themes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch themes.' });
  }
};

export const getActiveTheme = async (req, res) => {
  try {
    const { data, error } = await supabase.from('themes').select('*').eq('is_active', true).single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json({ success: true, data: data || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch active theme.' });
  }
};

export const createTheme = async (req, res) => {
  try {
    const { name, colors, gradients, effects, isActive } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Theme name is required.' });
    if (isActive) await supabase.from('themes').update({ is_active: false }).eq('is_active', true);
    const { data, error } = await supabase.from('themes').insert({
      name, colors: colors || {}, gradients: gradients || {}, effects: effects || {},
      is_active: isActive || false, created_by: req.user.id,
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create theme.' });
  }
};

export const updateTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, colors, gradients, effects, isActive } = req.body;
    if (isActive) await supabase.from('themes').update({ is_active: false }).eq('is_active', true);
    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (colors !== undefined) updates.colors = colors;
    if (gradients !== undefined) updates.gradients = gradients;
    if (effects !== undefined) updates.effects = effects;
    if (isActive !== undefined) updates.is_active = isActive;
    const { data, error } = await supabase.from('themes').update(updates).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update theme.' });
  }
};

export const deleteTheme = async (req, res) => {
  try {
    const { error } = await supabase.from('themes').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Theme deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete theme.' });
  }
};

export const activateTheme = async (req, res) => {
  try {
    await supabase.from('themes').update({ is_active: false }).eq('is_active', true);
    const { data, error } = await supabase.from('themes').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data, message: 'Theme activated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to activate theme.' });
  }
};
