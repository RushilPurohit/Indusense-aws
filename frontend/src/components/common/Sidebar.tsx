import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Layers,
  Network,
  FlaskConical,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wrench,
  ShieldCheck,
  Users,
  Shield,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();
  const role = user?.role || 'engineer';

  // Role-specific navigation items (Section 2 RBAC Matrix)
  const getNavItems = () => {
    if (role === 'technician') {
      return [
        { name: 'My Cases & Inspection', path: '/cases', icon: ClipboardList, badge: 'Plant 2' },
        { name: 'Plant Operations', path: '/operations', icon: LayoutDashboard },
        { name: 'Manuals & Library', path: '/knowledge', icon: BookOpen },
        { name: 'Technician Profile', path: '/settings', icon: Settings },
      ];
    }
    if (role === 'admin') {
      return [
        { name: 'System Overview', path: '/operations', icon: LayoutDashboard },
        { name: 'All Cases Queue', path: '/cases', icon: ClipboardList },
        { name: 'Knowledge Ingestion', path: '/knowledge', icon: Layers },
        { name: 'Cloud Router Governance', path: '/router', icon: Network },
        { name: 'Model Registry Admin', path: '/research', icon: FlaskConical },
        { name: 'User & Role Control', path: '/settings', icon: Users, badge: 'RBAC' },
      ];
    }
    // Default: Lead Reliability Engineer
    return [
      { name: 'Operations', path: '/operations', icon: LayoutDashboard },
      { name: 'Cases & Workspace', path: '/cases', icon: ClipboardList },
      { name: 'Knowledge Base', path: '/knowledge', icon: Layers },
      { name: 'Processing Paths', path: '/router', icon: Network, tooltip: 'Cloud Router (Light/Heavy)' },
      { name: 'Model Training & Research', path: '/research', icon: FlaskConical },
      { name: 'Settings', path: '/settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  // Role badge and title details
  const roleConfig = {
    technician: {
      title: 'Technician Panel',
      sub: 'Shop-Floor Triage',
      color: 'bg-emerald-600',
      tagColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
      icon: Wrench,
    },
    admin: {
      title: 'Admin Panel',
      sub: 'Full Architecture',
      color: 'bg-purple-600',
      tagColor: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
      icon: Shield,
    },
    engineer: {
      title: 'Engineer Panel',
      sub: 'Audit Authority',
      color: 'bg-[#0284C7]',
      tagColor: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
      icon: ShieldCheck,
    }
  }[role as 'technician' | 'admin' | 'engineer'] || {
    title: 'Engineer Panel',
    sub: 'Audit Authority',
    color: 'bg-[#0284C7]',
    tagColor: 'bg-sky-950/80 text-sky-300 border-sky-700/60',
    icon: ShieldCheck,
  };

  const RoleIcon = roleConfig.icon;

  return (
    <aside
      className={`h-screen bg-[#0B132B] text-slate-300 border-r border-[#1C2541] motion-safe:transition-all motion-safe:duration-200 motion-reduce:transition-none flex flex-col z-30 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      aria-label="Application Primary Navigation"
    >
      {/* Brand & Role Panel Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-[#1C2541]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className={`w-8 h-8 rounded-lg ${roleConfig.color} flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0`}
              aria-hidden="true"
            >
              <RoleIcon className="w-4 h-4" />
            </div>
            <div className="leading-tight min-w-0">
              <span className="font-bold text-white tracking-tight text-sm block truncate">
                {roleConfig.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block truncate">
                {roleConfig.sub}
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div
            className={`w-8 h-8 rounded-lg ${roleConfig.color} flex items-center justify-center font-bold text-white text-xs mx-auto shadow-sm`}
            title={roleConfig.title}
            aria-label={roleConfig.title}
          >
            <RoleIcon className="w-4 h-4" />
          </div>
        )}

        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-[#1C2541] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors ml-auto"
            aria-label="Collapse sidebar navigation"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role Pill Banner */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex items-center justify-between ${roleConfig.tagColor}`}>
            <span className="font-semibold uppercase tracking-wider">{role}</span>
            <span className="text-[10px] text-slate-400">
              {role === 'admin' ? 'All Plants' : 'Plant 2'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 min-h-[40px] rounded-lg text-xs font-medium motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 group ${
                  isActive
                    ? 'bg-[#1C2541] text-white font-semibold border-l-2 border-sky-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#1C2541]/60'
                }`
              }
              title={collapsed ? item.name : (item as any).tooltip || item.name}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className="w-4 h-4 shrink-0 text-slate-300 group-hover:text-white" aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </div>
              {!collapsed && (item as any).badge && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-sky-300 border border-slate-700 shrink-0">
                  {(item as any).badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Expand Button */}
      <div className="p-2 border-t border-[#1C2541]">
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="w-full min-h-[40px] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1C2541] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors"
            aria-label="Expand sidebar navigation"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="px-2 py-1.5 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" aria-hidden="true" />
              <span className="truncate font-mono text-[10px]">{user?.name || 'Operator'}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">RBAC Active</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
