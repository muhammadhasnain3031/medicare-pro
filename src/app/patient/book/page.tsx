'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Doctor {
  _id:            string;
  name:           string;
  specialization: string;
  qualification:  string;
  experience:     number;
  fee:            number;
}

const SPECIALIZATIONS = [
  'All','Cardiologist','Dermatologist','General Physician',
  'Neurologist','Orthopedic','Pediatrician','Psychiatrist','Surgeon',
];

const TIMES = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM',
];

export default function BookAppointment() {
  const router = useRouter();
  const [doctors, setDoctors]         = useState<Doctor[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [spec, setSpec]               = useState('All');
  const [form, setForm]               = useState({ date:'', time:'', type:'checkup', symptoms:'' });
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [step, setStep]               = useState(1);

  useEffect(() => {
    const url = spec === 'All' ? '/api/doctors' : `/api/doctors?specialization=${spec}`;
    fetch(url).then(r => r.json()).then(d => setDoctors(d.doctors || []));
  }, [spec]);

  const handleBook = async () => {
    if (!selectedDoc || !form.date || !form.time) {
      setError('Please fill all required fields'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: selectedDoc._id, ...form }),
      });
      if (!res.ok) throw new Error('Booking failed');
      router.push('/patient/appointments');
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-500 mt-1">Find a doctor and schedule your visit</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[
          { n: 1, label: 'Choose Doctor'  },
          { n: 2, label: 'Select Schedule' },
          { n: 3, label: 'Confirm'         },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s.n ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {s.n}
            </div>
            <span className={`text-sm font-medium ${step >= s.n ? 'text-gray-900' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {i < 2 && <div className={`flex-1 h-0.5 w-12 ${step > s.n ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>
      )}

      {/* Step 1 — Choose Doctor */}
      {step === 1 && (
        <div>
          {/* Specialization Filter */}
          <div className="flex gap-2 flex-wrap mb-5">
            {SPECIALIZATIONS.map(s => (
              <button key={s} onClick={() => setSpec(s)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  spec === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {s}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map(doc => (
              <div key={doc._id}
                onClick={() => { setSelectedDoc(doc); setStep(2); }}
                className={`card p-5 cursor-pointer hover:shadow-md transition-all ${
                  selectedDoc?._id === doc._id ? 'border-blue-500 border-2' : ''
                }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {doc.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{doc.name}</p>
                    <p className="text-xs text-blue-600">{doc.specialization}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Qualification</span>
                    <span className="font-medium">{doc.qualification || 'MBBS'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-medium">{doc.experience || 0} yrs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fee</span>
                    <span className="font-semibold text-green-600">PKR {doc.fee}</span>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
                  Select Doctor →
                </button>
              </div>
            ))}

            {doctors.length === 0 && (
              <div className="col-span-3 text-center py-16 text-gray-400">
                <p className="text-3xl mb-2">👨‍⚕️</p>
                <p>No doctors found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2 — Schedule */}
      {step === 2 && selectedDoc && (
        <div className="max-w-2xl">
          {/* Selected Doctor */}
          <div className="card p-4 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
              {selectedDoc.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{selectedDoc.name}</p>
              <p className="text-sm text-blue-600">{selectedDoc.specialization} · PKR {selectedDoc.fee}</p>
            </div>
            <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700">
              Change
            </button>
          </div>

          <div className="card p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
                <input type="date" value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({...form,date:e.target.value})}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Appointment Type</label>
                <select value={form.type} onChange={e => setForm({...form,type:e.target.value})}
                  className="input-field">
                  <option value="checkup">General Checkup</option>
                  <option value="followup">Follow-up</option>
                  <option value="consultation">Consultation</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
              <div className="grid grid-cols-4 gap-2">
                {TIMES.map(t => (
                  <button key={t} onClick={() => setForm({...form, time: t})}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all border ${
                      form.time === t
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Symptoms / Reason</label>
              <textarea value={form.symptoms} onChange={e => setForm({...form,symptoms:e.target.value})}
                rows={3} placeholder="Describe your symptoms..."
                className="input-field resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
              <button onClick={() => { if (form.date && form.time) setStep(3); else setError('Date aur time select karo'); }}
                className="btn-primary flex-1 justify-center">
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && selectedDoc && (
        <div className="max-w-lg">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-5 text-lg">Confirm Appointment</h3>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Doctor',    value: selectedDoc.name },
                { label: 'Specialty', value: selectedDoc.specialization },
                { label: 'Date',      value: form.date },
                { label: 'Time',      value: form.time },
                { label: 'Type',      value: form.type },
                { label: 'Fee',       value: `PKR ${selectedDoc.fee}` },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500 text-sm">{item.label}</span>
                  <span className="font-semibold text-gray-900 text-sm capitalize">{item.value}</span>
                </div>
              ))}
            </div>

            {form.symptoms && (
              <div className="bg-blue-50 rounded-xl p-3 mb-5">
                <p className="text-xs font-semibold text-blue-600 mb-1">Symptoms</p>
                <p className="text-sm text-gray-700">{form.symptoms}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
              <button onClick={handleBook} disabled={loading}
                className="btn-primary flex-1 justify-center py-3">
                {loading ? 'Booking...' : '✅ Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}