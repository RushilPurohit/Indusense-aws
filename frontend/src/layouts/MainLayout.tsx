import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import TopNavbar from '../components/common/TopNavbar';
import ErrorBanner from '../components/common/ErrorBanner';
import { useAuth } from '../context/AuthContext';
import { HERO_CASES } from '../services/mockData';
import {
  indusenseApi,
  subscribeConnectionState,
  ConnectionState,
  getConnectionState,
} from '../services/indusenseApi';
import { DiagnosisCase } from '../types';

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(() => {
    // Collapse automatically on smaller screens / tablets
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [selectedAssetId, setSelectedAssetId] = useState('CNC-M102');
  const [activeCase, setActiveCase] = useState<DiagnosisCase>(HERO_CASES[0]);
  const [connectionState, setConnectionState] = useState<ConnectionState>(getConnectionState());
  const [isRetrying, setIsRetrying] = useState(false);

  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = subscribeConnectionState((state) => {
      setConnectionState(state);
    });

    indusenseApi.checkHealth().catch(() => {});

    // Listen for screen resize to collapse sidebar on tablet
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    try {
      await indusenseApi.checkHealth();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    const matched = HERO_CASES.find((c) => c.asset_id === assetId);
    if (matched) {
      setActiveCase(matched);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Top Navbar */}
        <TopNavbar
          selectedAssetId={selectedAssetId}
          onSelectAsset={handleSelectAsset}
        />

        {/* Visible Honest-State Banner */}
        {connectionState === 'unreachable' && (
          <ErrorBanner
            mode="unreachable"
            onRetry={handleRetryConnection}
            isRetrying={isRetrying}
          />
        )}

        {connectionState === 'demo' && (
          <ErrorBanner mode="demo" />
        )}

        {/* Main Content Viewport */}
        <main
          className="flex-1 overflow-auto bg-[#F8FAFC] p-4 lg:p-6 scrollbar-thin"
          id="main-content"
          tabIndex={-1}
        >
          <Outlet context={{ activeCase, setActiveCase, selectedAssetId, setSelectedAssetId }} />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
