import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiX, FiFile, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
      if (!title) {
        setTitle(acceptedFiles[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024 // 20MB
  });

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file');

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    try {
      const { data } = await api.post('/rfps/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        toast.success('RFP Uploaded Successfully!');
        onUploadSuccess(data.data);
        handleClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg glass-panel bg-[#0B1120] rounded-2xl p-6 relative shadow-2xl"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <FiX size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6">Upload New RFP</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Project Phoenix"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>

              {!file ? (
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                    isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 text-purple-400">
                    <FiUploadCloud size={32} />
                  </div>
                  <p className="text-lg font-medium mb-1">Drag & drop your RFP here</p>
                  <p className="text-sm text-gray-400">Supports PDF, DOCX (Max 20MB)</p>
                </div>
              ) : (
                <div className="border border-white/20 rounded-xl p-4 flex items-center gap-4 bg-white/5">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white">
                    <FiFile size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    onClick={() => setFile(null)}
                    className="text-gray-400 hover:text-red-400 transition"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button 
                  onClick={handleClose}
                  className="px-6 py-2 rounded-lg text-gray-300 hover:text-white transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="px-6 py-2 rounded-lg bg-gradient-primary text-white font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg min-w-[140px]"
                >
                  {isUploading && <FiLoader className="animate-spin" />}
                  {isUploading ? 'Uploading...' : 'Upload & Parse'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
