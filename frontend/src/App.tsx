import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Operations from './pages/Operations';
import Cases from './pages/Cases';
import CaseWorkspace from './pages/CaseWorkspace';
import KnowledgeBase from './pages/KnowledgeBase';
import CloudRouter from './pages/CloudRouter';
import Research from './pages/Research';
import Settings from './pages/Settings';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Authentication Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth" element={<Navigate to="/login" replace />} />
          </Route>

          {/* Protected Application Workspace */}
          <Route element={<MainLayout />}>
            <Route path="/operations" element={<Operations />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CaseWorkspace />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
            <Route path="/router" element={<CloudRouter />} />
            <Route path="/research" element={<Research />} />
            <Route path="/settings" element={<Settings />} />

            {/* Backwards-compatibility redirects for older paths */}
            <Route path="/dashboard" element={<Navigate to="/operations" replace />} />
            <Route path="/documents" element={<Navigate to="/knowledge" replace />} />
            <Route path="/library" element={<Navigate to="/knowledge" replace />} />
            <Route path="/knowledge-graph" element={<Navigate to="/knowledge" replace />} />
            <Route path="/assistant" element={<Navigate to="/cases/case-cnc-m102" replace />} />
            <Route path="/evidence" element={<Navigate to="/cases/case-cnc-m102" replace />} />
            <Route path="/machine-health" element={<Navigate to="/operations" replace />} />
            <Route path="/models" element={<Navigate to="/research" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/operations" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
