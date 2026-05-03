'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Medicine {
  name: string; dosage: string; duration: string; instructions: string;
}

function NewPrescriptionForm() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const patientId     = searchParams.get('patientId') || '';
  const appointmentId = searchParams.get('appointmentId') || '';

  const [form, setForm]         = useState({ diagnosis: '', notes: '', symptoms: '' });
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: '', dosage: '', duration: '', instructions: '' }
  ]);
  const [loading, setLoading]   = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError]       = useState('');

  const addMedicine = () =>
    setMedicines(prev => [...prev, { name:'', dosage:'', duration:'', instructions:'' }]);

  const updateMedicine = (i: number, key: keyof Medicine, val: string) => {
    setMedicines(prev => prev.map((m, idx) => idx === i ? { ...m, [key]: val } : m));
  };

  const handleAIGenerate = async () => {
    if (!form.diagnosis) { setError('Diagnosis zaroori hai AI ke liye'); return; }
    setAiLoading(true); setError('');
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId, appointmentId,
          diagnosis:    form.diagnosis,
          symptoms:     form.symptoms,
          notes:        form.notes,
          generateWithAI: true,
        }),
      });
      if (!res.ok) throw new Error('AI generation failed');
      const data = await res.json();
      if (data.prescription?.medicines) setMedicines(data.prescription.medicines);
      if (data.prescription?.notes)     setForm(f => ({ ...f, notes: data.prescription.notes }));
      router.push('/doctor/prescriptions');
    } catch (err: any) { setError(err.message); }
    setAiLoading(false);
  };

  const handleSave = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId, appointmentId,
          diagnosis: form.diagnosis,
          notes:     form.notes,
          medicines,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      router.push('/doctor/prescriptions');
    } catch (err: any) { setError(err.message); }
    setLoading(false);
  };

  const inp = "input-field text-sm";
  const label = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Prescription</h1>
        <p className="text-gray-500 mt-1">Write prescription manually or generate with AI</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>
      )}

      <div className="card p-6 mb-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className={label}>Diagnosis *</label>
            <input value={form.diagnosis} onChange={e => setForm({...form,diagnosis:e.target.value})}
              placeholder="e.g. Acute Pharyngitis" required className={inp} />
          </div>
          <div>
            <label className={label}>Symptoms</label>
            <input value={form.symptoms} onChange={e => setForm({...form,symptoms:e.target.value})}
              placeholder="Sore throat, fever..." className={inp} />
          </div>
        </div>
        <div>
          <label className={label}>Notes</label>
          <textarea value={form.notes} onChange={e => setForm({...form,notes:e.target.value})}
            rows={2} placeholder="Additional instructions..."
            className="input-field text-sm resize-none" />
        </div>
      </div>

      {/* Medicines */}
      <div className="card p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Medicines</h3>
          <button onClick={addMedicine}
            className="text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium">
            + Add Medicine
          </button>
        </div>

        <div className="space-y-4">
          {medicines.map((med, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Medicine Name</label>
                  <input value={med.name} onChange={e => updateMedicine(i,'name',e.target.value)}
                    placeholder="Amoxicillin 500mg" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Dosage</label>
                  <input value={med.dosage} onChange={e => updateMedicine(i,'dosage',e.target.value)}
                    placeholder="1 tablet" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                  <input value={med.duration} onChange={e => updateMedicine(i,'duration',e.target.value)}
                    placeholder="7 days" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Instructions</label>
                  <input value={med.instructions} onChange={e => updateMedicine(i,'instructions',e.target.value)}
                    placeholder="After meals" className={inp} />
                </div>
              </div>
              {medicines.length > 1 && (
                <button onClick={() => setMedicines(prev => prev.filter((_,j) => j !== i))}
                  className="mt-2 text-xs text-red-500 hover:text-red-700">
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button onClick={handleAIGenerate} disabled={aiLoading}
          className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
          {aiLoading ? '⏳ AI Generating...' : '🤖 Generate with AI'}
        </button>
        <button onClick={handleSave} disabled={loading}
          className="flex-1 btn-primary py-3 justify-center text-base">
          {loading ? 'Saving...' : '💾 Save Prescription'}
        </button>
      </div>
    </div>
  );
}

export default function NewPrescriptionPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <NewPrescriptionForm />
    </Suspense>
  );
}