import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiFolder, FiSettings, FiBook } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  
  const links = [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    // We can add more routes later like:
    // { to: '/knowledge', icon: <FiBook />, label: 'Knowledge Base' },
  ];

  if (user?.role === 'SUPER_ADMIN') {
    links.push({ to: '/admin/themes', icon: <FiSettings />, label: 'Theme Settings' });
  }

  return (
    <aside className="w-64 glass-panel border-t-0 border-b-0 border-l-0 min-h-[calc(100vh-73px)] p-6">
      <div className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive 
                  ? 'bg-gradient-primary text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {link.icon}
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
