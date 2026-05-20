import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RfpDetail from './pages/RfpDetail';
import ThemePanel from './pages/ThemePanel';
import Navbar from './components/Navbar';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'SUPER_ADMIN') return <Navigate to="/dashboard" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen radial-texture flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rfp/:id" 
              element={
                <ProtectedRoute>
                  <RfpDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/themes" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <ThemePanel />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1E1B4B',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }}/>
      </div>
    </Router>
  );
}

export default App;
