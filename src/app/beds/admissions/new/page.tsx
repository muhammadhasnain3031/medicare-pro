'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewAdmission() {
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors,  setDoctors]  = useState<any[]>([]);
  const [rooms,    setRooms]    = useState<any[]>([]);
  const [form, setForm] = useState({
    patientId: '', doctorId: '', roomId: '',
    diagnosis: '', admissionType: 'planned',
    admissionDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users?role=patient').then(r => r.json()),
      fetch('/api/doctors').then(r => r.json()),
      fetch('/api/beds/rooms?status=available').then(r => r.json()),
    ]).then(([p, d, r]) => {
      setPatients(p.users   || []);
      setDoctors( d.doctors || []);
      setRooms(   r.rooms   || []);
    });
  }, []);

  const selectedRoom = rooms.find(r => r._id === form.roomId);

  const handleAdmit = async () => {
    if (!form.patientId || !form.doctorId || !form.roomId || !form.diagnosis) {
      setError('All fields required'); return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/beds/admissions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      router.push('/beds');
    } catch (err: any) { setError(err.message); }
    setSaving(false);
  };

  const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  const TYPE_ICONS: Record<string, string> = {
    general: '🛏️', private: '🏨', 'semi-private': '🛏️',
    icu: '🚨', emergency: '⚡', operation: '⚕️',
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">🏥 Admit Patient</h1>
        <p className="text-gray-500 text-sm mt-1">Create new patient admission</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Patient *</label>
            <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className={inp}>
              <option value="">Select patient...</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name} — {p.phone||p.email}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Doctor *</label>
            <select value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className={inp}>
              <option value="">Select doctor...</option>
              {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization}</option>)}
            </select>
          </div>
        </div>

        {/* Room Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">Select Room *</label>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">

            {rooms.map(room => (
              <button key={room._id}
                onClick={() => setForm({...form, roomId: room._id})}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.roomId === room._id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}>
                <p className="text-lg">{TYPE_ICONS[room.type] || '🛏️'}</p>
                <p className="font-bold text-sm text-gray-900">{room.roomNumber}</p>
                <p className="text-xs text-gray-500 capitalize">{room.type}</p>
                <p className="text-xs font-semibold text-green-600">PKR {room.dailyCharge}/day</p>
              </button>
            ))}
          </div>
          {selectedRoom && (
            <div className="mt-2 bg-indigo-50 border border-indigo-200 rounded-xl p-3">
              <p className="text-xs font-bold text-indigo-700">
                ✅ Selected: {selectedRoom.roomNumber} — {selectedRoom.ward} Ward — PKR {selectedRoom.dailyCharge}/day
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Admission Type</label>
            <select value={form.admissionType} onChange={e => setForm({...form, admissionType: e.target.value})} className={inp}>
              <option value="planned">Planned</option>
              <option value="emergency">Emergency</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Admission Date</label>
            <input type="date" value={form.admissionDate}
              onChange={e => setForm({...form, admissionDate: e.target.value})} className={inp} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Diagnosis *</label>
          <input value={form.diagnosis}
            onChange={e => setForm({...form, diagnosis: e.target.value})}
            placeholder="Primary diagnosis..." className={inp} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
          <textarea value={form.notes}
            onChange={e => setForm({...form, notes: e.target.value})}
            rows={2} placeholder="Additional notes..." className={`${inp} resize-none`} />
        </div>

        <button onClick={handleAdmit} disabled={saving}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-colors">
          {saving ? '⏳ Admitting...' : '🏥 Admit Patient'}
        </button>
      </div>
    </div>
  );
}