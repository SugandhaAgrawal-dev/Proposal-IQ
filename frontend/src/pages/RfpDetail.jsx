import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlay, FiDownload, FiCheck, FiX, FiInfo, FiLoader } from 'react-icons/fi';

const RfpDetail = () => {
  const { id } = useParams();
  const [rfp, setRfp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agentRunning, setAgentRunning] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');

  const fetchRfp = async () => {
    try {
      const { data } = await api.get(`/rfps/${id}`);
      if (data.success) {
        setRfp(data.data);
      }
    } catch (err) {
      toast.error('Failed to load RFP details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfp();
  }, [id]);

  const runAgent = async (endpoint, successMsg) => {
    setAgentRunning(endpoint);
    try {
      const { data } = await api.post(`/rfps/${id}/${endpoint}`);
      if (data.success) {
        toast.success(successMsg);
        fetchRfp();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to run ${endpoint}`);
    } finally {
      setAgentRunning(null);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await api.get(`/export/${id}/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ProposalIQ-${rfp.title}.${type === 'excel' ? 'xlsx' : 'docx'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error(`Failed to export ${type.toUpperCase()}`);
    }
  };

  if (loading) return <div className="flex h-screen"><Sidebar /><div className="flex-1 flex items-center justify-center">Loading...</div></div>;
  if (!rfp) return <div className="flex h-screen"><Sidebar /><div className="flex-1 flex items-center justify-center">RFP Not Found</div></div>;

  return (
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-73px)]">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/dashboard" className="w-10 h-10 glass-panel rounded-full flex items-center justify-center hover:bg-white/10 transition">
              <FiArrowLeft />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{rfp.title}</h1>
              <p className="text-gray-400">Uploaded on {new Date(rfp.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-3">
              {rfp.proposal && (
                <button onClick={() => handleExport('docx')} className="px-4 py-2 glass-panel rounded-lg flex items-center gap-2 hover:bg-white/5">
                  <FiDownload /> DOCX
                </button>
              )}
              {rfp.compliance_matrix && (
                <button onClick={() => handleExport('excel')} className="px-4 py-2 glass-panel rounded-lg flex items-center gap-2 hover:bg-white/5">
                  <FiDownload /> Excel
                </button>
              )}
            </div>
          </div>

          {/* AI Workflow Tracker */}
          <div className="glass-panel p-6 rounded-2xl mb-8">
            <h2 className="text-xl font-bold mb-6">AI Agent Workflow</h2>
            <div className="flex flex-wrap gap-4">
              <WorkflowStep 
                title="1. Analyze RFP" 
                isDone={!!rfp.analysis} 
                isActive={!rfp.analysis}
                onClick={() => runAgent('analyze', 'Analysis complete!')}
                disabled={!!agentRunning}
                isLoading={agentRunning === 'analyze'}
              />
              <WorkflowStep 
                title="2. Generate Proposal" 
                isDone={!!rfp.proposal} 
                isActive={!!rfp.analysis && !rfp.proposal}
                onClick={() => runAgent('generate', 'Proposal generated!')}
                disabled={!!agentRunning || !rfp.analysis}
                isLoading={agentRunning === 'generate'}
              />
              <WorkflowStep 
                title="3. Compliance Matrix" 
                isDone={!!rfp.compliance_matrix} 
                isActive={!!rfp.proposal && !rfp.compliance_matrix}
                onClick={() => runAgent('compliance', 'Compliance matrix created!')}
                disabled={!!agentRunning || !rfp.proposal}
                isLoading={agentRunning === 'compliance'}
              />
              <WorkflowStep 
                title="4. Review Content" 
                isDone={!!rfp.review} 
                isActive={!!rfp.proposal && !rfp.review}
                onClick={() => runAgent('review', 'Review complete!')}
                disabled={!!agentRunning || !rfp.proposal}
                isLoading={agentRunning === 'review'}
              />
            </div>
          </div>

          {/* Output Viewer */}
          <div className="glass-panel rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
            <div className="flex border-b border-white/10 bg-white/5">
              {['analysis', 'proposal', 'compliance', 'review'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium transition capitalize ${activeTab === tab ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'analysis' && (
                rfp.analysis ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Executive Summary</h3>
                      <p className="text-gray-300 leading-relaxed">{rfp.analysis.summary}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass-panel p-4 rounded-xl">
                        <h4 className="font-bold text-red-400 flex items-center gap-2 mb-3"><FiInfo/> Critical Risks</h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-300">
                          {rfp.analysis.risks?.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                      <div className="glass-panel p-4 rounded-xl">
                        <h4 className="font-bold text-green-400 flex items-center gap-2 mb-3"><FiCheck/> Requirements Summary</h4>
                        <ul className="list-disc pl-5 space-y-1 text-gray-300">
                          {rfp.analysis.requirements?.slice(0, 5).map((r, i) => <li key={i}>{r}</li>)}
                          {rfp.analysis.requirements?.length > 5 && <li>...and {rfp.analysis.requirements.length - 5} more</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : <EmptyState message="Run the Analyzer agent to see results here." />
              )}

              {activeTab === 'proposal' && (
                rfp.proposal ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-300">{rfp.proposal.content}</div>
                  </div>
                ) : <EmptyState message="Run the Proposal Generator agent to see results here." />
              )}

              {activeTab === 'compliance' && (
                rfp.compliance_matrix ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="p-3 text-gray-400 font-medium">Requirement</th>
                          <th className="p-3 text-gray-400 font-medium">Response</th>
                          <th className="p-3 text-gray-400 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rfp.compliance_matrix.items?.map((item, i) => (
                          <tr key={i} className="border-b border-white/5">
                            <td className="p-3 text-gray-300 text-sm max-w-xs">{item.requirement}</td>
                            <td className="p-3 text-gray-300 text-sm max-w-xs">{item.response}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'Compliant' ? 'bg-green-500/20 text-green-400' : item.status === 'Partial' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <EmptyState message="Run the Compliance Matrix agent to see results here." />
              )}

              {activeTab === 'review' && (
                rfp.review ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-full border-4 border-purple-500 flex items-center justify-center text-2xl font-bold">
                        {rfp.review.quality_score}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Quality Score</h3>
                        <p className="text-gray-400">{rfp.review.overall_assessment}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-bold text-lg">Suggestions for Improvement</h4>
                      {rfp.review.suggestions?.map((s, i) => (
                        <div key={i} className="glass-panel p-4 rounded-xl border-l-4 border-l-yellow-500">
                          <p className="font-medium">{s.section}</p>
                          <p className="text-sm text-gray-400 mt-1"><span className="text-red-400">Issue:</span> {s.issue}</p>
                          <p className="text-sm text-gray-300 mt-1"><span className="text-green-400">Fix:</span> {s.improvement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <EmptyState message="Run the Reviewer agent to see results here." />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const WorkflowStep = ({ title, isDone, isActive, onClick, disabled, isLoading }) => {
  return (
    <div className={`flex-1 min-w-[200px] glass-panel p-4 rounded-xl border ${isActive ? 'border-purple-500 bg-purple-500/10' : isDone ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 opacity-50'}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="font-medium">{title}</span>
        {isDone ? <FiCheck className="text-green-400"/> : <FiPlay className={isActive ? 'text-purple-400' : 'text-gray-500'}/>}
      </div>
      <button 
        onClick={onClick}
        disabled={disabled || isDone}
        className={`w-full py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${isDone ? 'bg-white/5 text-gray-400 cursor-not-allowed' : isActive ? 'bg-gradient-primary text-white shadow-lg hover:opacity-90' : 'bg-white/5 text-gray-400 cursor-not-allowed'}`}
      >
        {isLoading && <FiLoader className="animate-spin" />}
        {isDone ? 'Completed' : isLoading ? 'Running...' : 'Run Agent'}
      </button>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="h-full flex flex-col items-center justify-center text-gray-500">
    <FiInfo size={48} className="mb-4 opacity-50" />
    <p>{message}</p>
  </div>
);

export default RfpDetail;
