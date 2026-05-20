import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState(null);

  const loadTheme = async () => {
    try {
      const { data } = await api.get('/themes/active');
      if (data.success && data.data) {
        applyTheme(data.data);
      }
    } catch (error) {
      console.error('Failed to load active theme', error);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const applyTheme = (themeData) => {
    setActiveTheme(themeData);
    const root = document.documentElement;

    if (themeData.colors) {
      if (themeData.colors.primary) root.style.setProperty('--color-primary', themeData.colors.primary);
      if (themeData.colors.secondary) root.style.setProperty('--color-secondary', themeData.colors.secondary);
      if (themeData.colors.bgDarkBase) root.style.setProperty('--bg-dark-base', themeData.colors.bgDarkBase);
      if (themeData.colors.bgSurface) root.style.setProperty('--bg-surface', themeData.colors.bgSurface);
    }

    if (themeData.gradients) {
      if (themeData.gradients.primary) root.style.setProperty('--gradient-primary', themeData.gradients.primary);
      if (themeData.gradients.accent) root.style.setProperty('--gradient-accent', themeData.gradients.accent);
    }

    if (themeData.effects) {
      if (themeData.effects.blur) root.style.setProperty('--glass-blur', themeData.effects.blur);
      if (themeData.effects.opacity) root.style.setProperty('--glass-opacity', themeData.effects.opacity);
      if (themeData.effects.border) root.style.setProperty('--glass-border', themeData.effects.border);
    }
  };

  const previewTheme = (themeData) => {
    applyTheme(themeData);
  };

  const resetTheme = () => {
    if (activeTheme) {
      applyTheme(activeTheme);
    } else {
      // Refresh to drop inline styles if no active theme was initially loaded
      window.location.reload();
    }
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, loadTheme, previewTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
