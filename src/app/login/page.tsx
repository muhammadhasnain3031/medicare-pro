'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [tenantSlug, setTenantSlug] = useState('');


  // Demo credentials
  const demos = [
     {
  role: 'Super Admin',
  email: 'superadmin@medicare.com',
  password: 'super123',
  color: 'bg-red-50 border-red-200 text-red-700'
},
  { role: 'Admin',        email: 'admin@medicare.com',        password: 'admin123',   color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { role: 'Doctor',       email: 'doctor@medicare.com',       password: 'doctor123',  color: 'bg-blue-50 border-blue-200 text-blue-700'       },
  { role: 'Patient',      email: 'patient@medicare.com',      password: 'patient123', color: 'bg-green-50 border-green-200 text-green-700'    },
  { role: 'Receptionist', email: 'reception@medicare.com',    password: 'recep123',   color: 'bg-pink-50 border-pink-200 text-pink-700'       },
  { role: 'Nurse',        email: 'nurse@medicare.com',        password: 'nurse123',   color: 'bg-teal-50 border-teal-200 text-teal-700'       },
  { role: 'Lab Staff',    email: 'lab@medicare.com',          password: 'lab123',     color: 'bg-orange-50 border-orange-200 text-orange-700' },
 
];

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    Hospital Code (optional)
  </label>
  <input
    value={tenantSlug}
    onChange={e => setTenantSlug(e.target.value)}
    placeholder="e.g. citycare, alshifa"
    className="input-field"
  />
  <p className="text-xs text-gray-400 mt-1">Leave empty for demo login</p>
</div>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
await login(form.email, form.password, tenantSlug);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">M</div>
          <h1 className="text-2xl font-bold text-gray-900">MediCare Pro</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="your@email.com" required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="••••••••" required
                className="input-field"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            No account? <Link href="/register" className="text-blue-600 font-medium">Register</Link>
          </p>

          {/* Demo Logins */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Demo Login</p>
            <div className="space-y-2">
              {demos.map(d => (
                <button key={d.role}
                  onClick={() => setForm({ email: d.email, password: d.password })}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-medium ${d.color} transition-colors`}>
                  <span className="font-semibold">{d.role}:</span> {d.email} / {d.password}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}