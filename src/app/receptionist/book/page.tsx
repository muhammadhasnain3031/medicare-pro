'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Doctor { _id: string; name: string; specialization: string; fee: number; }

const TIMES = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','02:00 PM','02:30 PM','03:00 PM','04:00 PM'];

export default function ReceptionistBook() {
  const router = useRouter();
  const [doctors, setDoctors]   = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [form, setForm]         = useState({
    patientId: '', doctorId: '', date: '', time: '', type: 'checkup', symptoms: ''
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    fetch('/api/doctors').then(r => r.json()).then(d => setDoctors(d.doctors || []));
    fetch('/api/admin/users?role=patient').then(r => r.json()).then(d => setPatients(d.users || []));
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.date || !form.time) {
      setError('All fields required'); return;
    }
    setLoading(true);
    try {
      // Book as receptionist on behalf of patient
      const res = await fetch('/api/appointments/receptionist', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Booking failed');
      router.push('/receptionist/appointments');
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-500 text-sm mt-1">Book on behalf of patient</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <form onSubmit={handleBook} className="space-y-4">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Patient *</label>
            <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
              <option value="">Choose patient...</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name} — {p.phone || p.email}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Doctor *</label>
            <select value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
              <option value="">Choose doctor...</option>
              {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.specialization} (PKR {d.fee})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date *</label>
              <input type="date" value={form.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({...form, date: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option value="checkup">Checkup</option>
                <option value="followup">Follow-up</option>
                <option value="consultation">Consultation</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Time *</label>
            <div className="grid grid-cols-3 gap-2">
              {TIMES.map(t => (
                <button type="button" key={t} onClick={() => setForm({...form, time: t})}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    form.time === t
                      ? 'bg-pink-600 text-white border-pink-600'
                      : 'border-gray-200 text-gray-600 hover:border-pink-300'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Symptoms / Notes</label>
            <textarea value={form.symptoms} onChange={e => setForm({...form, symptoms: e.target.value})}
              rows={3} placeholder="Patient symptoms..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Booking...' : '✅ Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}