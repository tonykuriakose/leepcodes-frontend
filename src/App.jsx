import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/index.js'
import { useAppDispatch, useAuth } from './store/hooks.js'
import { getProfile, setLoginAttempted } from './store/slices/authSlice.js'
import { authService } from './services/index.js'

// Import pages
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LoadingSpinner from './components/LoadingSpinner.jsx'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loginAttempted } = useAuth();

  // Show loading while checking authentication
  if (!loginAttempted) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Public Route Component (redirect to dashboard if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loginAttempted } = useAuth();

  // Show loading while checking authentication
  if (!loginAttempted) {
    return <LoadingSpinner />;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// App Content with Routes
function AppContent() {
  const dispatch = useAppDispatch();
  const { loginAttempted } = useAuth();

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      // Check if user has a valid token and get profile
      if (authService.isAuthenticated() && !authService.isTokenExpired()) {
        try {
          await dispatch(getProfile()).unwrap();
        } catch (error) {
          console.error('Failed to get profile:', error);
          // Token might be invalid, clear it
          authService.clearAuth();
          dispatch(setLoginAttempted());
        }
      } else {
        // No valid token or token expired
        if (authService.isAuthenticated()) {
          authService.clearAuth(); // Clear expired token
        }
        dispatch(setLoginAttempted()); // Stop loading spinner
      }
    };

    initializeApp();
  }, [dispatch]);

  // Show loading spinner while initializing
  if (!loginAttempted) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

// Main App Component with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App