'use client';
// 1. Yahan 'useState' add kar diya hai
import { useEffect, useState } from 'react'; 
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // 2. State definition (Ab ye define hai)
  const [mob, setMob] = useState(false);

  // Body scroll lock logic
  useEffect(() => {
    document.body.style.overflow = mob ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mob]);

  // Auth Protection logic
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Note: Agar aapka Sidebar mobile par open/close hota hai, 
         to aapko 'mob' aur 'setMob' usay pass karne chahiye 
      */}
      <Sidebar />

      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>

      <ChatBot />
    </div>
  );
}