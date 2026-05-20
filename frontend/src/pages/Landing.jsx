import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiZap, FiFileText, FiShield } from 'react-icons/fi';

const Landing = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = "Analyzing RFP requirements...\nFound 42 critical items.\nGenerating proposal draft...\nMapping compliance matrix...\nDone! Win probability: 85%";
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-primary rounded-full opacity-20 blur-[100px] -z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Win More Deals with <br className="hidden md:block"/>
            <span className="text-gradient">Intelligent Proposals</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade AI platform that analyzes RFPs, generates compliant proposals, and improves your win rates instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register" className="px-8 py-4 rounded-xl bg-gradient-primary text-white font-bold text-lg hover:opacity-90 transition transform hover:scale-105 shadow-[0_0_40px_rgba(76,29,149,0.4)]">
              Start Free Trial
            </Link>
            <Link to="#demo" className="px-8 py-4 rounded-xl glass-panel text-white font-bold text-lg hover:bg-white/5 transition">
              Watch Demo
            </Link>
          </div>
        </motion.div>

        {/* AI Demo Terminal */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 w-full max-w-3xl glass-panel rounded-2xl overflow-hidden text-left shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          <div className="bg-[#020617] px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-sm text-gray-500 font-mono">ProposalIQ AI Agent</span>
          </div>
          <div className="p-6 font-mono text-sm md:text-base text-gray-300 min-h-[200px] whitespace-pre-wrap">
            <span className="text-green-400">$ </span>
            {typedText}
            <span className="animate-pulse">_</span>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-[#0B1120] relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Multi-Agent AI</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Our specialized AI agents work in tandem to handle every aspect of your proposal generation.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <FiFileText className="text-blue-400" size={32}/>, title: 'RFP Analyzer', desc: 'Extracts requirements, identifies risks, and creates summaries automatically.' },
              { icon: <FiZap className="text-purple-400" size={32}/>, title: 'Proposal Generator', desc: 'Drafts comprehensive responses using your historical knowledge base.' },
              { icon: <FiCheckCircle className="text-green-400" size={32}/>, title: 'Compliance Matrix', desc: 'Maps every requirement to a specific response to ensure 100% compliance.' },
              { icon: <FiShield className="text-pink-400" size={32}/>, title: 'Content Reviewer', desc: 'Scores and improves proposal quality, tone, and readability.' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="glass-panel p-6 rounded-2xl border-t border-l border-white/10"
              >
                <div className="mb-4 bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-20 -z-10"></div>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to win more deals?</h2>
          <p className="text-xl text-gray-300 mb-10">Join forward-thinking enterprise teams using ProposalIQ to automate their RFP process.</p>
          <Link to="/register" className="px-8 py-4 rounded-xl bg-white text-gray-900 font-bold text-lg hover:bg-gray-100 transition shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
