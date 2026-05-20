import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { FiCheck, FiPlus, FiTrash2, FiPlay } from 'react-icons/fi';

const ThemePanel = () => {
  const { loadTheme, previewTheme, resetTheme, activeTheme } = useTheme();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Editor state
  const [editingTheme, setEditingTheme] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    colors: { primary: '#4C1D95', secondary: '#EC4899', bgDarkBase: '#020617', bgSurface: '#0B1120' },
    gradients: { primary: 'linear-gradient(135deg, #0F172A, #1E1B4B, #4C1D95)', accent: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)' },
    effects: { blur: '20px', opacity: '0.05', border: 'rgba(255, 255, 255, 0.1)' }
  });

  const fetchThemes = async () => {
    try {
      const { data } = await api.get('/themes');
      if (data.success) {
        setThemes(data.data);
      }
    } catch (err) {
      toast.error('Failed to load themes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handlePreview = () => {
    previewTheme(formData);
  };

  const handleSave = async () => {
    try {
      if (editingTheme) {
        await api.put(`/themes/${editingTheme.id}`, formData);
        toast.success('Theme updated successfully');
      } else {
        await api.post('/themes', formData);
        toast.success('Theme created successfully');
      }
      fetchThemes();
      setEditingTheme(null);
      resetTheme();
    } catch (err) {
      toast.error('Failed to save theme');
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.post(`/themes/${id}/activate`);
      toast.success('Theme activated globally');
      fetchThemes();
      loadTheme();
    } catch (err) {
      toast.error('Failed to activate theme');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/themes/${id}`);
      toast.success('Theme deleted');
      fetchThemes();
    } catch (err) {
      toast.error('Failed to delete theme');
    }
  };

  const openEditor = (theme = null) => {
    if (theme) {
      setEditingTheme(theme);
      setFormData({
        name: theme.name,
        colors: theme.colors || {},
        gradients: theme.gradients || {},
        effects: theme.effects || {}
      });
    } else {
      setEditingTheme(null);
      setFormData({
        name: 'New Theme',
        colors: { primary: '#4C1D95', secondary: '#EC4899', bgDarkBase: '#020617', bgSurface: '#0B1120' },
        gradients: { primary: 'linear-gradient(135deg, #0F172A, #1E1B4B, #4C1D95)', accent: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)' },
        effects: { blur: '20px', opacity: '0.05', border: 'rgba(255, 255, 255, 0.1)' }
      });
    }
  };

  const updateColor = (key, value) => setFormData(p => ({ ...p, colors: { ...p.colors, [key]: value } }));
  const updateGradient = (key, value) => setFormData(p => ({ ...p, gradients: { ...p.gradients, [key]: value } }));
  const updateEffect = (key, value) => setFormData(p => ({ ...p, effects: { ...p.effects, [key]: value } }));

  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-73px)]">
        <div className="max-w-6xl mx-auto flex gap-8">
          
          {/* Theme List */}
          <div className="w-1/3">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Theme Engine</h1>
              <button onClick={() => openEditor()} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                <FiPlus />
              </button>
            </div>

            <div className="space-y-4">
              {themes.map(theme => (
                <div key={theme.id} className={`glass-panel p-4 rounded-xl border-l-4 ${theme.is_active ? 'border-l-green-500' : 'border-l-transparent'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">{theme.name}</h3>
                    {theme.is_active && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Active</span>}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleActivate(theme.id)} disabled={theme.is_active} className="flex-1 py-1 bg-white/5 rounded text-sm hover:bg-white/10 disabled:opacity-30">
                      Activate
                    </button>
                    <button onClick={() => openEditor(theme)} className="flex-1 py-1 bg-white/5 rounded text-sm hover:bg-white/10">
                      Edit
                    </button>
                    {!theme.is_active && (
                      <button onClick={() => handleDelete(theme.id)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30">
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Editor */}
          <div className="w-2/3 glass-panel p-6 rounded-2xl h-fit">
            <h2 className="text-xl font-bold mb-6">{editingTheme ? 'Edit Theme' : 'Create Theme'}</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Theme Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium border-b border-white/10 pb-2 mb-4">Colors</h3>
                  <div className="space-y-3">
                    {Object.entries(formData.colors).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{k}</span>
                        <div className="flex items-center gap-2">
                          <input type="color" value={v} onChange={e => updateColor(k, e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                          <input type="text" value={v} onChange={e => updateColor(k, e.target.value)} className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium border-b border-white/10 pb-2 mb-4">Effects (Glass)</h3>
                  <div className="space-y-3">
                    {Object.entries(formData.effects).map(([k, v]) => (
                      <div key={k} className="flex flex-col">
                        <span className="text-sm text-gray-300 mb-1">{k}</span>
                        <input type="text" value={v} onChange={e => updateEffect(k, e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium border-b border-white/10 pb-2 mb-4">Gradients</h3>
                <div className="space-y-3">
                  {Object.entries(formData.gradients).map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <span className="text-sm text-gray-300 mb-1">{k}</span>
                      <input type="text" value={v} onChange={e => updateGradient(k, e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm font-mono" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button onClick={handlePreview} className="px-6 py-2 bg-white/10 rounded-lg flex items-center gap-2 hover:bg-white/20 transition">
                  <FiPlay /> Live Preview
                </button>
                <button onClick={resetTheme} className="px-6 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition">
                  Revert
                </button>
                <div className="flex-1"></div>
                <button onClick={handleSave} className="px-8 py-2 bg-gradient-primary rounded-lg font-medium hover:opacity-90 transition shadow-lg">
                  Save Theme
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ThemePanel;
