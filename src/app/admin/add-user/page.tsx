'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const SPECIALIZATIONS = [
  'Cardiologist','Dermatologist','General Physician','Neurologist',
  'Orthopedic','Pediatrician','Psychiatrist','Surgeon',
];

function AddUserForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const defaultRole  = searchParams.get('role') || 'doctor';

  const [role, setRole]   = useState(defaultRole);
  const [form, setForm]   = useState<any>({ name:'', email:'', password:'', phone:'' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      setSuccess(`${role} created successfully!`);
      setForm({ name:'', email:'', password:'', phone:'' });
      setTimeout(() => router.push(`/admin/${role}s`), 1500);
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
        <p className="text-gray-500 mt-1">Create a new doctor or patient account</p>
      </div>

      {/* Role Toggle */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
        {['doctor','patient'].map(r => (
          <button key={r} onClick={() => setRole(r)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}>
            {r}
          </button>
        ))}
      </div>

      <div className="card p-8">
        {error   && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl p-3 mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
              <input value={form.name} onChange={e => setForm({...form,name:e.target.value})}
                placeholder="Full name" required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})}
                placeholder="+92 300..." className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})}
              placeholder="email@example.com" required className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
            <input type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})}
              placeholder="Min 6 characters" required className="input-field" />
          </div>

          {role === 'doctor' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialization</label>
                <select value={form.specialization||''} onChange={e => setForm({...form,specialization:e.target.value})}
                  className="input-field">
                  <option value="">Select...</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fee (PKR)</label>
                <input type="number" value={form.fee||''} onChange={e => setForm({...form,fee:Number(e.target.value)})}
                  placeholder="1500" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Qualification</label>
                <input value={form.qualification||''} onChange={e => setForm({...form,qualification:e.target.value})}
                  placeholder="MBBS, MD" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience (yrs)</label>
                <input type="number" value={form.experience||''} onChange={e => setForm({...form,experience:Number(e.target.value)})}
                  placeholder="5" className="input-field" />
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
            {loading ? 'Creating...' : `Create ${role} Account`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AddUserPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <AddUserForm />
    </Suspense>
  );
}