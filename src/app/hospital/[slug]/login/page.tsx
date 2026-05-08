"use client";
import { useParams } from "next/navigation";

export default function HospitalLogin() {
  const params = useParams();
  const slug = params.slug; // Ye URL se 'mayo' pakar lega

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
        <h1 className="text-2xl font-bold text-white mb-4 capitalize">
          Login to {slug.toString().replace('-', ' ')}
        </h1>
        
        {/* Aapka purana login form yahan aa jayega */}
        <form className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
          />
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}