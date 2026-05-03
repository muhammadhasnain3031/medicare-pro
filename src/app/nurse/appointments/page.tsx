'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Appointment {
  _id:      string;
  patient:  { _id: string; name: string; phone: string; bloodGroup: string };
  date:     string;
  time:     string;
  status:   string;
  type:     string;
  symptoms: string;
  fee:      number;
}

export default function DoctorAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');

  useEffect(() => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => { setAppointments(d.appointments || []); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
  try {
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),  // ✅ sirf status bhejo
    });
    
    if (!res.ok) {
      const err = await res.json();
      console.error('Update failed:', err);
      return;
    }
    
    // ✅ Local state update karo
    setAppointments(prev => 
      prev.map(a => a._id === id ? { ...a, status } : a)
    );
  } catch (err) {
    console.error('Error:', err);
  }
};

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500 mt-1">{appointments.length} total appointments</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['all','pending','confirmed','completed','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {f} ({f === 'all' ? appointments.length : appointments.filter(a => a.status === f).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(apt => (
          <div key={apt._id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {apt.patient?.name?.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-semibold text-gray-900">{apt.patient?.name}</p>
                  {apt.patient?.bloodGroup && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                      {apt.patient.bloodGroup}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">{apt.symptoms || 'No symptoms noted'}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>📅 {apt.date}</span>
                  <span>⏰ {apt.time}</span>
                  <span className="capitalize">🏥 {apt.type}</span>
                  <span>💰 PKR {apt.fee}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  apt.status === 'pending'   ? 'badge-warning' :
                  apt.status === 'confirmed' ? 'badge-info'    :
                  apt.status === 'completed' ? 'badge-success' : 'badge-danger'
                }`}>
                  {apt.status}
                </span>

                <div className="flex gap-2">
                  {apt.status === 'pending' && (
                    <button onClick={() => updateStatus(apt._id, 'confirmed')}
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100">
                      Confirm
                    </button>
                  )}
                  {apt.status === 'confirmed' && (
                    <>
                      <button onClick={() => updateStatus(apt._id, 'completed')}
                        className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-medium hover:bg-green-100">
                        Complete
                      </button>
                      <button
                        onClick={() => router.push(`/doctor/prescriptions/new?patientId=${apt.patient?._id}&appointmentId=${apt._id}`)}
                        className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg font-medium hover:bg-purple-100">
                        + Prescription
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p>No appointments found</p>
          </div>
        )}
      </div>
    </div>
  );
}