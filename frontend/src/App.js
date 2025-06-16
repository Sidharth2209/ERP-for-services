// frontend/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store/store';
import { getCurrentUser } from './store/authSlice';

// Components
import AuthPage from './component/AuthPage';
import CompanyDashboard from './component/CompanyDashboard';
import AdminDashboard from './component/AdminDashboard';
import EmployeeDashboard from './component/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is already logged in on app start
    const token = localStorage.getItem('authToken');
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              user?.role === 'PARENT' ? (
                <Navigate to="/company-dashboard" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <AuthPage />
            )
          } 
        />
        
        <Route 
          path="/company-dashboard" 
          element={
            <ProtectedRoute>
              <CompanyDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              {user?.role === 'ADMIN' ? <AdminDashboard /> : <EmployeeDashboard />}
            </ProtectedRoute>
          } 
        />
        
        {/* Add more routes as needed */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;