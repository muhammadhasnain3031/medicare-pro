'use client';
import { useEffect, useState } from 'react';

interface Patient {
  _id: string; name: string; email: string;
  phone: string; bloodGroup: string; dateOfBirth: string; address: string;
}

export default function AdminPatients() {
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
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this patient?')) return;
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    setPatients(prev => prev.filter(p => p._id !== id));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 mt-1">{patients.length} registered patients</p>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search patients by name or email..."
          className="input-field" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Patient','Phone','Blood Group','DOB','Address','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.phone || 'N/A'}</td>
                  <td className="px-4 py-3">
                    {p.bloodGroup ? (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                        {p.bloodGroup}
                      </span>
                    ) : <span className="text-gray-400 text-sm">N/A</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.dateOfBirth || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate">{p.address || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(p._id)}
                      className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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