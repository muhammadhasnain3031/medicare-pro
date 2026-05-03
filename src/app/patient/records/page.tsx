'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Record {
  _id:        string;
  doctor:     { name: string; specialization: string };
  diagnosis:  string;
  medicines:  { name: string; dosage: string; duration: string }[];
  notes:      string;
  aiGenerated: boolean;
  createdAt:  string;
}

export default function PatientRecords() {
  const { user } = useAuth();
  const [records, setRecords]   = useState<Record[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Record | null>(null);

  useEffect(() => {
    fetch('/api/prescriptions')
      .then(r => r.json())
      .then(d => { setRecords(d.prescriptions || []); setLoading(false); });
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
        <p className="text-gray-500 mt-1">Your complete medical history</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>No medical records yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-3">
            {records.map(rec => (
              <div key={rec._id} onClick={() => setSelected(rec)}
                className={`card p-4 cursor-pointer hover:shadow-md transition-all ${
                  selected?._id === rec._id ? 'border-2 border-blue-500' : ''
                }`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                    {rec.doctor?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{rec.doctor?.name}</p>
                    <p className="text-xs text-blue-600">{rec.doctor?.specialization}</p>
                  </div>
                  {rec.aiGenerated && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">🤖 AI</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-800 mb-1">{rec.diagnosis}</p>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{rec.medicines?.length || 0} medicines</span>
                  <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {selected ? (
            <div className="card p-6 h-fit sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Record Detail</h3>
              <div className="bg-blue-50 rounded-xl p-3 mb-4">
                <p className="text-xs font-semibold text-blue-600 mb-1">Diagnosis</p>
                <p className="text-sm font-semibold">{selected.diagnosis}</p>
              </div>
              <div className="space-y-2 mb-4">
                {selected.medicines?.map((med, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <p className="font-semibold text-sm text-gray-900">{med.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{med.dosage} · {med.duration}</p>
                  </div>
                ))}
              </div>
              {selected.notes && (
                <div className="bg-yellow-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">Notes</p>
                  <p className="text-sm">{selected.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-8 text-center text-gray-400 h-fit">
              <p className="text-3xl mb-2">👆</p>
              <p className="text-sm">Select a record to view details</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}