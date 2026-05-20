import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex justify-between items-center bg-opacity-80 border-b border-white/10">
      <Link to="/" className="text-2xl font-bold flex items-center gap-2">
        <motion.div 
          className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          IQ
        </motion.div>
        <span className="text-gradient">ProposalIQ</span>
      </Link>

      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</Link>
            {user.role === 'SUPER_ADMIN' && (
              <Link to="/admin/themes" className="text-gray-300 hover:text-white transition">Themes</Link>
            )}
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-300 hover:text-white transition">Log in</Link>
            <Link 
              to="/register" 
              className="px-4 py-2 rounded-lg bg-gradient-primary text-white font-medium hover:opacity-90 transition shadow-lg"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
