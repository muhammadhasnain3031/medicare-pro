'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Patient {
  _id: string; 
  name: string; 
  email: string;
  phone: string; 
  bloodGroup: string; 
  dateOfBirth: string; 
  address: string;
}

export default function DoctorPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Patient | null>(null);

  useEffect(() => {
    fetch('/api/admin/users?role=patient')
      .then(r => r.json())
      .then(d => { 
        setPatients(d.users || []); 
        setLoading(false); 
      });
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone || '').includes(search)
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            🤒 My Patients
          </h1>
          <p className="text-gray-500 text-sm mt-1">{patients.length} registered patients</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* MOBILE VIEW — List View */}
          <div className="block md:hidden space-y-3">
            {filtered.map(p => (
              <div key={p._id}
                onClick={() => setSelected(selected?._id === p._id ? null : p)}
                className={`bg-white rounded-2xl border-2 p-4 transition-all shadow-sm ${
                  selected?._id === p._id ? 'border-blue-400 ring-1 ring-blue-100' : 'border-gray-100'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{p.email}</p>
                  </div>
                  {p.bloodGroup && (
                    <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-lg">
                      {p.bloodGroup}
                    </span>
                  )}
                </div>

                {/* Mobile Expanded Details */}
                {selected?._id === p._id && (
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        ['📞', p.phone || 'N/A'],
                        ['🎂', p.dateOfBirth || 'N/A'],
                        ['📍', p.address || 'N/A'],
                      ].map(([icon, val]) => (
                        <div key={icon as string} className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                          <p className="text-[10px] text-gray-400 mb-0.5">{icon}</p>
                          <p className="text-[10px] font-bold text-gray-700 truncate">{val}</p>
                        </div>
                      ))}
                    </div>
                    {/* MOBILE EMR BUTTON */}
                    <Link href={`/doctor/patients/${p._id}/emr`}
                      className="block w-full py-3 text-center text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-100"
                      onClick={e => e.stopPropagation()}>
                      📋 View Full EMR
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW — Grid View */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <div key={p._id} className="bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl transition-all group">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-100">
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate text-base">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.email}</p>
                    </div>
                  </div>
                  {/* DESKTOP EMR BUTTON */}
                  <Link href={`/doctor/patients/${p._id}/emr`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
                    onClick={e => e.stopPropagation()}>
                    📋 EMR
                  </Link>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                  {[
                    ['📞 Phone', p.phone || 'N/A'],
                    ['🎂 DOB',   p.dateOfBirth || 'N/A'],
                    ['📍 Area',  p.address || 'N/A'],
                    ['🩸 Blood', p.bloodGroup || 'N/A'],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-tight">{k}</span>
                      <span className="font-semibold text-gray-700 text-xs truncate max-w-[150px]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <p className="text-5xl mb-4 grayscale">🤒</p>
              <h3 className="text-lg font-bold text-gray-800">No patients found</h3>
              <p className="text-gray-400 text-sm mt-1">Try searching with a different name or number</p>
              <button 
                onClick={() => setSearch('')}
                className="mt-6 text-blue-600 font-bold text-sm hover:underline">
                Clear Search
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}