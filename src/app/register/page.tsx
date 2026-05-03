'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState<any>({
    name:'', email:'', password:'', phone:'',
    dateOfBirth:'', bloodGroup:''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // ✅ role force = patient
      await register({ ...form, role: 'patient' });
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">M</div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Registration</h1>
        </div>

        <div className="card p-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({...form,name:e.target.value})}
                  placeholder="John Doe"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  value={form.phone}
                  onChange={e => setForm({...form,phone:e.target.value})}
                  placeholder="+92 300 0000000"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form,email:e.target.value})}
                placeholder="your@email.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({...form,password:e.target.value})}
                placeholder="••••••••"
                required
                className="input-field"
              />
            </div>

            {/* Patient Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={e => setForm({...form,dateOfBirth:e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
                <select
                  value={form.bloodGroup}
                  onChange={e => setForm({...form,bloodGroup:e.target.value})}
                  className="input-field"
                >
                  <option value="">Select...</option>
                  {BLOOD_GROUPS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {loading ? 'Creating account...' : 'Create Patient Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have account? <Link href="/login" className="text-blue-600 font-medium">Sign In</Link>
          </p>

        </div>
      </div>
    </div>
  );
}