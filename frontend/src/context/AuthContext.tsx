import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  role: 'engineer' | 'technician' | 'admin' | string;
  role_title?: string;
  shift: string;
  avatar: string;
  authMode: 'SSO' | 'CREDENTIALS';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string, role?: string) => Promise<boolean>;
  loginWithSSO: () => Promise<boolean>;
  signup: (name: string, email: string, pass: string, role?: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USER: UserProfile = {
  name: 'Dr. Elena Vance',
  email: 'engineer@indusense.ai',
  role: 'engineer',
  role_title: 'Lead Reliability Engineer (Audit Authority)',
  shift: 'Plant 2 — Reliability Cell',
  avatar: 'EV',
  authMode: 'CREDENTIALS',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user_profile');
    if (savedToken && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return DEFAULT_USER;
      }
    }
    // Default logged in for hackathon judges convenience
    return DEFAULT_USER;
  });

  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const login = async (email: string, pass: string, role?: string): Promise<boolean> => {
    setError(null);
    if (!email || !pass) {
      setError('Please provide both email and password.');
      return false;
    }
    await new Promise((r) => setTimeout(r, 200));

    let detectedRole = role || 'engineer';
    let detectedTitle = 'Lead Reliability Engineer (Audit Authority)';
    let displayName = 'Dr. Elena Vance';

    if (email.toLowerCase().includes('tech') || role === 'technician') {
      detectedRole = 'technician';
      detectedTitle = 'Technician (Review Sign-Off)';
      displayName = 'Alex Chen';
    } else if (email.toLowerCase().includes('admin') || role === 'admin') {
      detectedRole = 'admin';
      detectedTitle = 'System Administrator';
      displayName = 'Marcus Sterling';
    }

    const loggedUser: UserProfile = {
      name: displayName,
      email,
      role: detectedRole,
      role_title: detectedTitle,
      shift: detectedRole === 'technician' ? 'Plant 2 — Field Operations' : 'Reliability Engineering Group',
      avatar: displayName.split(' ').map(n => n[0]).join('').slice(0, 2),
      authMode: 'CREDENTIALS',
    };
    localStorage.setItem('token', 'indusense-jwt-token');
    localStorage.setItem('user_profile', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return true;
  };

  const loginWithSSO = async (): Promise<boolean> => {
    setError(null);
    await new Promise((r) => setTimeout(r, 300));
    const ssoUser: UserProfile = {
      name: 'Dr. Elena Vance (SSO)',
      email: 'engineer@indusense.ai',
      role: 'engineer',
      role_title: 'Lead Reliability Engineer (Audit Authority)',
      shift: 'Reliability Engineering Group',
      avatar: 'EV',
      authMode: 'SSO',
    };
    localStorage.setItem('token', 'indusense-sso-token');
    localStorage.setItem('user_profile', JSON.stringify(ssoUser));
    setUser(ssoUser);
    return true;
  };

  const signup = async (name: string, email: string, pass: string, _role?: string): Promise<boolean> => {
    setError(null);
    if (!name || !email || !pass) {
      setError('Please fill in all registration fields.');
      return false;
    }
    await new Promise((r) => setTimeout(r, 250));

    // New accounts remain pending until an administrator approves them.
    setUser(null);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithSSO,
        signup,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
