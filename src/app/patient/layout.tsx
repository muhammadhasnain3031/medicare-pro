'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'patient')) router.push('/login');
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!user || user.role !== 'patient') return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. Sidebar sirf yahan hona chahiye */}
      <Sidebar />
      
      {/* 2. Content area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* 3. Chatbot (Sidebar yahan se delete kar diya gaya hai) */}
      <ChatBot />
    </div>
  );
}