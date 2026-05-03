'use client';
import { useState } from 'react';

export default function NurseVitals() {
  const [form, setForm] = useState({
    patientName:   '',
    bloodPressure: '',
    heartRate:     '',
    temperature:   '',
    oxygenLevel:   '',
    weight:        '',
    height:        '',
    notes:         '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inp = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Record Vitals</h1>
        <p className="text-gray-500 text-sm mt-1">Enter patient vital signs</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 mb-4">
          ✅ Vitals saved successfully!
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Patient Name</label>
          <input value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})}
            placeholder="Enter patient name" className={inp} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            { key: 'bloodPressure', label: 'Blood Pressure', placeholder: '120/80 mmHg', icon: '🩺' },
            { key: 'heartRate',     label: 'Heart Rate',     placeholder: '72 bpm',       icon: '❤️' },
            { key: 'temperature',   label: 'Temperature',    placeholder: '98.6°F',       icon: '🌡️' },
            { key: 'oxygenLevel',   label: 'Oxygen Level',   placeholder: '98%',          icon: '🫁' },
            { key: 'weight',        label: 'Weight',         placeholder: '70 kg',        icon: '⚖️' },
            { key: 'height',        label: 'Height',         placeholder: '170 cm',       icon: '📏' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {f.icon} {f.label}
              </label>
              <input
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm({...form, [f.key]: e.target.value})}
                placeholder={f.placeholder}
                className={inp}
              />
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nurse Notes</label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
            rows={3} placeholder="Additional observations..."
            className={`${inp} resize-none`} />
        </div>

        <button onClick={handleSave}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors">
          💾 Save Vitals
        </button>
      </div>
    </div>
  );
}