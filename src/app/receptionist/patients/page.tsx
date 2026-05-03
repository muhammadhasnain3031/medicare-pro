'use client';
import { useEffect, useState } from 'react';

interface Patient {
  _id: string; name: string; email: string;
  phone: string; bloodGroup: string; dateOfBirth: string;
}

export default function ReceptionistPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    fetch('/api/admin/users?role=patient')
      .then(r => r.json())
      .then(d => { setPatients(d.users || []); setLoading(false); });
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-gray-500 text-sm mt-1">{patients.length} registered</p>
      </div>

      <div className="mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 font-bold">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 truncate">{p.email}</p>
                </div>
                {p.bloodGroup && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    {p.bloodGroup}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {[
                  ['📞 Phone', p.phone || 'N/A'],
                  ['🎂 DOB',   p.dateOfBirth || 'N/A'],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between text-xs">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-medium text-gray-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <p className="text-3xl mb-2">🤒</p>
              <p>No patients found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}