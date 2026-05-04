'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Patient {
  _id: string; name: string; email: string;
  phone: string; bloodGroup: string; dateOfBirth: string;
}

export default function NursePatients() {
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
    (p.phone || '').includes(search)
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">🤒 Patients</h1>
        <p className="text-gray-500 text-sm mt-1">{patients.length} registered</p>
      </div>

      <div className="mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 font-bold text-xl flex-shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                    {p.bloodGroup && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {p.bloodGroup}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>📞 {p.phone || 'N/A'}</span>
                    <span>🎂 {p.dateOfBirth || 'N/A'}</span>
                    <span className="truncate">📧 {p.email}</span>
                  </div>
                </div>
                <Link
                  href={`/nurse/vitals?patientName=${encodeURIComponent(p.name)}`}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0"
                  onClick={e => e.stopPropagation()}>
                  💉 Vitals
                </Link>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-3xl mb-2">🤒</p>
              <p>No patients found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}