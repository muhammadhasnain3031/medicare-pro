"use client";
import { useParams } from "next/navigation";

export default function HospitalLogin() {
  const params = useParams();
  
  // ✅ FIX: TypeScript ko batana ke slug string hai ya nahi
  const slug = params?.slug; 

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
        <h1 className="text-2xl font-bold text-white mb-4 capitalize">
          {/* ✅ Safe replace logic */}
          Login to {typeof slug === 'string' ? slug.replace(/-/g, ' ') : 'Hospital'}
        </h1>
        
        <form className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}