'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';

export default function NurseLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'nurse')) router.push('/login');
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Nurse ke liye teal color ka spinner perfect hai */}
      <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!user || user.role !== 'nurse') return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. Sidebar sirf aik baar yahan aayega */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>

      {/* 3. Floating ChatBot */}
      <ChatBot />
    </div>
  );
}