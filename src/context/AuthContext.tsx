'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  // 'superadmin' yahan add karein
  role: 'superadmin' | 'admin' | 'doctor' | 'patient' | 'receptionist' | 'nurse' | 'lab';
  specialization?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login:  (email: string, password: string,tenantSlug: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const login = async (email: string, password: string, tenantSlug?: string) => {
  const res = await fetch('/api/auth/login', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password, tenantSlug }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message);
  }
  const data = await res.json();
  setUser(data.user);

  // Role ke hisaab se redirect
  const routes: Record<string, string> = {
    superadmin:   '/superadmin',
    admin:        '/admin',
    doctor:       '/doctor',
    patient:      '/patient',
    receptionist: '/receptionist',
    nurse:        '/nurse',
    pharmacist:   '/pharmacy',
    lab:          '/lab',
  };
  router.push(routes[data.user.role] || '/');
};

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  const register = async (data: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }
    const result = await res.json();
    setUser(result.user);
    const routes: Record<string, string> = {
      admin: '/admin', doctor: '/doctor', patient: '/patient',
    };
    router.push(routes[result.user.role] || '/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};