import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Search,
  User,
  LogOut,
  SlidersHorizontal,
  ChevronDown,
  Wifi,
  WifiOff,
  HelpCircle,
  ChevronRight,
  Wrench,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeConnectionState,
  ConnectionState,
  getConnectionState,
  indusenseApi,
} from '../../services/indusenseApi';

interface TopNavbarProps {
  selectedAssetId?: string;
  onSelectAsset?: (assetId: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  selectedAssetId = 'CNC-M102',
  onSelectAsset,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionState, setConnectionState] = useState<ConnectionState>(getConnectionState());

  useEffect(() => {
    const unsubscribe = subscribeConnectionState((state) => {
      setConnectionState(state);
    });
    // Check health once on mount
    indusenseApi.checkHealth().catch(() => {});
    return () => unsubscribe();
  }, []);

  // Compute breadcrumb trail
  const path = location.pathname;
  let breadcrumbTitle = 'Operations';
  let breadcrumbParent: { name: string; path: string } | null = null;

  if (path.startsWith('/cases/')) {
    breadcrumbParent = { name: 'Cases', path: '/cases' };
    breadcrumbTitle = path.replace('/cases/', 'Case: ');
  } else if (path === '/cases') {
    breadcrumbTitle = 'Cases';
  } else if (path === '/knowledge') {
    breadcrumbTitle = 'Knowledge Base';
  } else if (path === '/router') {
    breadcrumbTitle = 'Processing Paths';
  } else if (path === '/research') {
    breadcrumbTitle = 'Research Studio';
  } else if (path === '/settings') {
    breadcrumbTitle = 'Settings';
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    if (query.includes('cnc') || query.includes('m102')) {
      navigate('/cases/case-cnc-m102');
    } else if (query.includes('brg') || query.includes('301') || query.includes('bearing')) {
      navigate('/cases/case-bearing-b301');
    } else if (query.includes('turbo') || query.includes('tf004') || query.includes('fan')) {
      navigate('/cases/case-turbofan-tf004');
    } else {
      navigate(`/cases?q=${encodeURIComponent(searchQuery.trim())}`);
    }
    setSearchQuery('');
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-20 select-none">
      {/* Left: Breadcrumbs & Asset Switcher */}
      <div className="flex items-center gap-3 min-w-0">
        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
          <Link
            to="/operations"
            className="hover:text-slate-900 transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded"
          >
            InduSense
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />

          {breadcrumbParent && (
            <>
              <Link
                to={breadcrumbParent.path}
                className="hover:text-slate-900 transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded"
              >
                {breadcrumbParent.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            </>
          )}

          <span className="font-semibold text-slate-800 font-mono truncate">{breadcrumbTitle}</span>
        </nav>

        {/* Quick Asset Switcher on wide screens */}
        <div className="hidden xl:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs">
          <label htmlFor="quick-asset-select" className="text-slate-400 text-[11px]">
            Asset:
          </label>
          <select
            id="quick-asset-select"
            value={selectedAssetId}
            onChange={(e) => {
              const val = e.target.value;
              if (onSelectAsset) onSelectAsset(val);
              const targetCase =
                val === 'CNC-M102'
                  ? 'case-cnc-m102'
                  : val === 'BRG-301'
                  ? 'case-bearing-b301'
                  : 'case-turbofan-tf004';
              navigate(`/cases/${targetCase}`);
            }}
            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 min-h-[32px]"
          >
            <option value="CNC-M102">CNC-M102 (AI4I Spindle)</option>
            <option value="BRG-301">BRG-301 (FEMTO Bearing)</option>
            <option value="TURBO-TF004">TURBO-TF004 (C-MAPSS Turbofan)</option>
          </select>
        </div>
      </div>

      {/* Center: Global Search */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-xs mx-4">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Case or Asset ID..."
            aria-label="Search Case or Asset ID"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white min-h-[36px]"
          />
        </div>
      </form>

      {/* Right: Connection Chip & User Menu */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Active Role Panel Badge */}
        <div className="hidden sm:flex items-center gap-1.5">
          {user?.role === 'technician' && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
              <Wrench className="w-3.5 h-3.5 text-emerald-700" />
              <span>Technician Panel</span>
              <span className="text-emerald-600 font-normal">| Plant 2</span>
            </span>
          )}
          {user?.role === 'admin' && (
            <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
              <Settings className="w-3.5 h-3.5 text-purple-700" />
              <span>Admin Panel</span>
              <span className="text-purple-600 font-normal">| Global</span>
            </span>
          )}
          {(!user?.role || user?.role === 'engineer') && (
            <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
              <span>Engineer Panel</span>
              <span className="text-sky-600 font-normal">| Plant 2</span>
            </span>
          )}
        </div>

        {/* Connection State Chip */}
        {connectionState === 'connected' && (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
            role="status"
            title="FastAPI server is active and responding"
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span className="hidden sm:inline">Connected</span>
          </span>
        )}

        {connectionState === 'unreachable' && (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-rose-50 text-rose-800 border border-rose-300"
            role="status"
            title="Backend server is unreachable; running in offline observation mode"
          >
            <WifiOff className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
            <span className="hidden sm:inline">Backend unreachable</span>
          </span>
        )}

        {connectionState === 'demo' && (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300"
            role="status"
            title="Demonstration research profile active"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            <span className="hidden sm:inline">Demo data mode</span>
          </span>
        )}

        {/* User Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 hover:bg-slate-100 px-2 py-1.5 rounded-lg transition-colors min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
            aria-label="User account menu"
          >
            <div
              className="w-7 h-7 rounded-full bg-[#0284C7] flex items-center justify-center text-xs font-semibold text-white shadow-sm"
              aria-hidden="true"
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'IS'}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-semibold text-slate-800">
                {user?.name || 'Lead Reliability Engineer'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {user?.role || 'Plant Engineer'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" aria-hidden="true" />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-xs"
              role="menu"
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-900">{user?.name || 'Lead Reliability Engineer'}</div>
                <div className="text-[11px] text-slate-500 font-mono truncate">{user?.email || 'engineer@indusense.ai'}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 min-h-[36px]"
                role="menuitem"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Settings &amp; Hypotheses
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-rose-600 border-t border-slate-100 min-h-[36px]"
                role="menuitem"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
