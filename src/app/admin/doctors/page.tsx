'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Doctor {
  _id:            string;
  name:           string;
  email:          string;
  specialization: string;
  qualification:  string;
  experience:     number;
  fee:            number;
  available:      boolean;
  phone:          string;
}

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    fetch('/api/admin/users?role=doctor')
      .then(r => r.json())
      .then(d => { setDoctors(d.users || []); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this doctor?')) return;
    await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
    setDoctors(prev => prev.filter(d => d._id !== id));
  };

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-500 mt-1">{doctors.length} doctors registered</p>
        </div>
        <Link href="/admin/add-user?role=doctor" className="btn-primary">
          + Add Doctor
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or specialization..."
          className="input-field"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(doc => (
            <div key={doc._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {doc.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{doc.name}</p>
                    <p className="text-sm text-blue-600">{doc.specialization}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${doc.available ? 'badge-success' : 'badge-danger'}`}>
                  {doc.available ? 'Available' : 'Busy'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Qualification</span>
                  <span className="font-medium">{doc.qualification || 'MBBS'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Experience</span>
                  <span className="font-medium">{doc.experience || 0} years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-medium text-green-600">PKR {doc.fee || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium truncate max-w-[160px]">{doc.email}</span>
                </div>
              </div>

              <button onClick={() => handleDelete(doc._id)}
                className="w-full py-2 text-sm text-red-500 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors">
                Remove Doctor
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}