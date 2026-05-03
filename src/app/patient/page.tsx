'use client';
import { useEffect, useState } from 'react';

interface Patient {
  _id:         string;
  name:        string;
  email:       string;
  phone:       string;
  bloodGroup:  string;
  dateOfBirth: string;
  address:     string;
}

export default function DoctorPatients() {
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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
        <p className="text-gray-500 mt-1">{patients.length} registered patients</p>
      </div>

      <div className="card p-4 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search patients..."
          className="input-field"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(patient => (
            <div key={patient._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{patient.name}</p>
                  <p className="text-xs text-gray-500">{patient.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  ['Phone',      patient.phone      || 'N/A'],
                  ['Blood Group',patient.bloodGroup  || 'N/A'],
                  ['DOB',        patient.dateOfBirth || 'N/A'],
                  ['Address',    patient.address     || 'N/A'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-medium text-gray-800 truncate max-w-[160px]">{v}</span>
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