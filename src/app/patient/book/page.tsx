'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SmartScheduler from '@/components/SmartScheduler';

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  qualification: string;
  experience: number;
  fee: number;
}

const SPECIALIZATIONS = [
  'All', 'Cardiologist', 'Dermatologist', 'General Physician',
  'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist', 'Surgeon',
];

const TIMES = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
];

export default function BookAppointment() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [spec, setSpec] = useState('All');
  const [form, setForm] = useState({ date: '', time: '', type: 'checkup', symptoms: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // Fetch Doctors based on specialization
  useEffect(() => {
    const url = spec === 'All' ? '/api/doctors' : `/api/doctors?specialization=${spec}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => setDoctors(d.doctors || []))
      .catch(() => setError('Failed to load doctors'));
  }, [spec]);

  const handleBook = async () => {
    if (!selectedDoc || !form.date || !form.time) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: selectedDoc._id, ...form }),
      });
      if (!res.ok) throw new Error('Booking failed');
      router.push('/patient/appointments');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-500 mt-1">Find a doctor and schedule your visit</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
        {[
          { n: 1, label: 'Choose Doctor' },
          { n: 2, label: 'Select Schedule' },
          { n: 3, label: 'Confirm' },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s.n ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {s.n}
            </div>
            <span className={`text-sm font-medium ${step >= s.n ? 'text-gray-900' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {i < 2 && <div className={`h-0.5 w-8 md:w-12 ${step > s.n ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">
          {error}
        </div>
      )}

      {/* Step 1 — Choose Doctor & Smart Scheduler */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side: Smart Scheduler (4 columns) */}
          <div className="lg:col-span-4">
            <h3 className="text-lg font-semibold mb-4">AI Smart Scheduler</h3>
            <SmartScheduler
              selectedDoctorId={selectedDoc?._id}
              selectedDate={form.date}
              onSelectSlot={(doctorId, date, time) => {
                const doctor = doctors.find((d) => d._id === doctorId);
                if (doctor) {
                  setSelectedDoc(doctor);
                  setForm({ ...form, date, time });
                  setStep(3); // Go straight to confirmation
                }
              }}
            />
          </div>

          {/* Right Side: Doctor Selection (8 columns) */}
          <div className="lg:col-span-8">
            <div className="flex gap-2 flex-wrap mb-6">
              {SPECIALIZATIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpec(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    spec === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setStep(2);
                  }}
                  className={`border rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all ${
                    selectedDoc?._id === doc._id ? 'border-blue-500 ring-2 ring-blue-100' : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{doc.name}</p>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">{doc.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-50 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Exp</span>
                      <span className="font-medium text-gray-900">{doc.experience || 0} yrs</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fee</span>
                      <span className="font-bold text-green-600">PKR {doc.fee}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {doctors.length === 0 && (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl">
                <p className="text-4xl mb-3">👨‍⚕️</p>
                <p>No doctors found in this category</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2 — Schedule Selection */}
      {step === 2 && selectedDoc && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
              {selectedDoc.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{selectedDoc.name}</p>
              <p className="text-sm text-gray-500">{selectedDoc.specialization} • Fee: PKR {selectedDoc.fee}</p>
            </div>
            <button onClick={() => setStep(1)} className="text-sm text-blue-600 font-semibold hover:underline">
              Change Doctor
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date *</label>
                <input 
                  type="date" 
                  value={form.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({...form, date: e.target.value})}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Visit Type</label>
                <select 
                  value={form.type} 
                  onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="checkup">General Checkup</option>
                  <option value="followup">Follow-up</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Available Time Slots</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIMES.map(t => (
                  <button 
                    key={t} 
                    onClick={() => setForm({...form, time: t})}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      form.time === t
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                        : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Symptoms (Optional)</label>
              <textarea 
                value={form.symptoms} 
                onChange={e => setForm({...form, symptoms: e.target.value})}
                rows={3} 
                placeholder="Briefly describe your health issue..."
                className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 resize-none" 
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
                Back
              </button>
              <button 
                onClick={() => { 
                  if (form.date && form.time) setStep(3); 
                  else setError('Please select both Date and Time'); 
                }}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Final Confirmation */}
      {step === 3 && selectedDoc && (
        <div className="max-w-lg mx-auto">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Confirm Your Visit</h3>

            <div className="space-y-4 mb-8">
              {[
                { label: 'Doctor', value: selectedDoc.name },
                { label: 'Specialty', value: selectedDoc.specialization },
                { label: 'Date', value: form.date },
                { label: 'Time', value: form.time },
                { label: 'Consultation Fee', value: `PKR ${selectedDoc.fee}`, highlight: true },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500 text-sm">{item.label}</span>
                  <span className={`font-bold text-sm ${item.highlight ? 'text-green-600 text-base' : 'text-gray-900'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {form.symptoms && (
              <div className="bg-blue-50 rounded-2xl p-4 mb-8">
                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Your Note</p>
                <p className="text-sm text-gray-700 italic">"{form.symptoms}"</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleBook} 
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:bg-gray-300"
              >
                {loading ? 'Processing...' : 'Confirm Appointment'}
              </button>
              <button 
                onClick={() => setStep(2)} 
                className="w-full py-3 text-gray-400 text-sm font-medium hover:text-gray-600"
              >
                Go Back & Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}