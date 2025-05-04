import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProgramList from './pages/ProgramList';
import BudgetCodes from './pages/BudgetCodes';
import DetailEntry from './pages/DetailEntry';
import Login from './pages/Login';
import { AppProvider } from './context/AppContext';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './hooks/useAuth';

// RouteTracker component to handle route persistence
const RouteTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't store modal states in lastPath
    if (!location.pathname.includes('modal')) {
      localStorage.setItem('lastPath', location.pathname);
    }
  }, [location]);

  return null;
};

// InitialRedirect component to handle initial routing
const InitialRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const lastPath = localStorage.getItem('lastPath');
      // Only redirect if we're at the root path and there's a saved path
      if (location.pathname === '/' && lastPath && lastPath !== '/login') {
        navigate(lastPath);
      }
    }
  }, [isAuthenticated, navigate, location.pathname]);

  return null;
};

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AppProvider>
      <Router>
        <RouteTracker />
        <InitialRedirect />
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } />
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="programs" element={<ProgramList />} />
            <Route path="budget-codes" element={<BudgetCodes />} />
            <Route path="detail-entry/:id" element={<DetailEntry />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;