'use client';
import { useEffect, useState } from 'react';

interface Patient {
  _id: string; name: string; email: string;
  phone: string; bloodGroup: string; dateOfBirth: string; address: string;
}

export default function DoctorPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<Patient | null>(null);

  useEffect(() => {
    fetch('/api/admin/users?role=patient')
      .then(r => r.json())
      .then(d => { setPatients(d.users || []); setLoading(false); });
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone || '').includes(search)
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">🤒 My Patients</h1>
        <p className="text-gray-500 text-sm mt-1">{patients.length} registered patients</p>
      </div>

      <div className="mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Mobile — list view */}
          <div className="block md:hidden space-y-3">
            {filtered.map(p => (
              <div key={p._id}
                onClick={() => setSelected(selected?._id === p._id ? null : p)}
                className={`bg-white rounded-2xl border-2 p-4 transition-all ${
                  selected?._id === p._id ? 'border-blue-400' : 'border-gray-100'
                }`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.email}</p>
                  </div>
                  {p.bloodGroup && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                      {p.bloodGroup}
                    </span>
                  )}
                </div>
                {selected?._id === p._id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                    {[
                      ['📞', p.phone || 'N/A'],
                      ['🎂', p.dateOfBirth || 'N/A'],
                      ['📍', p.address || 'N/A'],
                    ].map(([icon, val]) => (
                      <div key={icon as string} className="bg-gray-50 rounded-xl p-2">
                        <p className="text-xs text-gray-400">{icon}</p>
                        <p className="text-xs font-semibold text-gray-700 truncate">{val}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop — grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.email}</p>
                  </div>
                  {p.bloodGroup && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                      {p.bloodGroup}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {[
                    ['📞 Phone', p.phone || 'N/A'],
                    ['🎂 DOB',   p.dateOfBirth || 'N/A'],
                    ['📍 Area',  p.address || 'N/A'],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between text-sm">
                      <span className="text-gray-400 text-xs">{k}</span>
                      <span className="font-medium text-gray-700 text-xs truncate max-w-[140px]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-3xl mb-2">🤒</p>
              <p>No patients found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}