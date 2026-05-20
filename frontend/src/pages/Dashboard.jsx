import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import UploadModal from '../components/UploadModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiFileText, FiClock, FiCheckCircle, FiActivity } from 'react-icons/fi';

const Dashboard = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [rfps, setRfps] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [rfpRes, statsRes] = await Promise.all([
        api.get('/rfps'),
        api.get('/activity/stats')
      ]);
      
      if (rfpRes.data.success) {
        setRfps(rfpRes.data.data);
      }
      if (statsRes.data.success) {
        setStats({
          total: statsRes.data.data.totalRFPs,
          completed: statsRes.data.data.completedRFPs,
          pending: statsRes.data.data.totalRFPs - statsRes.data.data.completedRFPs
        });
      }
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      uploaded: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      analyzing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      analyzed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      generating: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.uploaded}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="flex flex-1">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-400">Welcome back! Here's an overview of your proposals.</p>
            </div>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-primary text-white font-medium hover:opacity-90 transition flex items-center gap-2 shadow-[0_0_20px_rgba(76,29,149,0.4)]"
            >
              <FiPlus size={20} />
              New Proposal
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Total RFPs', value: stats.total, icon: <FiFileText className="text-blue-400" size={24}/> },
              { label: 'Completed', value: stats.completed, icon: <FiCheckCircle className="text-green-400" size={24}/> },
              { label: 'In Progress', value: stats.pending, icon: <FiActivity className="text-purple-400" size={24}/> },
            ].map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="glass-panel p-6 rounded-2xl flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* RFP List */}
          <div>
            <h2 className="text-xl font-bold mb-6">Recent RFPs</h2>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl"></div>)}
              </div>
            ) : rfps.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                  <FiFileText size={40} />
                </div>
                <h3 className="text-xl font-medium mb-2">No RFPs yet</h3>
                <p className="text-gray-400 mb-6">Upload your first RFP to start generating proposals.</p>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
                >
                  Upload RFP
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {rfps.map((rfp, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={rfp.id}
                  >
                    <Link 
                      to={`/rfp/${rfp.id}`}
                      className="glass-panel p-5 rounded-xl flex items-center gap-6 hover:bg-white/5 transition group cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center text-white font-bold text-xl opacity-80 group-hover:opacity-100 transition">
                        {rfp.title.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{rfp.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <span className="flex items-center gap-1"><FiFileText /> {rfp.file_name}</span>
                          <span className="flex items-center gap-1"><FiClock /> {new Date(rfp.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(rfp.status)}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUploadSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
};

export default Dashboard;
