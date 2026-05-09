'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ChatBot from '@/components/ChatBot';

const NAV = [
  { href: '/billing',           icon: '📊', label: 'Dashboard'    },
  { href: '/billing/create',    icon: '➕', label: 'New Invoice'  },
  { href: '/billing/invoices',  icon: '📋', label: 'All Invoices' },
  { href: '/billing/dues',      icon: '⚠️', label: 'Dues & Overdue'},
  { href: '/billing/reports',   icon: '📈', label: 'Reports'      },
];

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mob, setMob] = useState(false);

useEffect(() => {
  document.body.style.overflow = mob ? 'hidden' : 'unset';
  return () => { document.body.style.overflow = 'unset'; };
}, [mob]);
  useEffect(() => {
    if (!loading && (!user || !['admin','receptionist','superadmin'].includes(user.role)))
      router.push('/login');
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <button onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-md text-gray-600">
        ☰
      </button>

      <aside className={`fixed md:sticky top-0 left-0 h-screen w-60 bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-xl">💰</div>
              <div>
                <p className="text-white font-bold text-sm">Billing Suite</p>
                <p className="text-white/70 text-xs">Invoice Management</p>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-white/70 hover:text-white text-lg">✕</button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full py-2 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
      <ChatBot />
    </div>
  );
}