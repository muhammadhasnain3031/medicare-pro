'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Note {
  id:          string;
  patient:     string;
  note:        string;
  priority:    string;
  createdAt:   string;
}

export default function NurseNotes() {
  const { user } = useAuth();
  const [notes, setNotes]   = useState<Note[]>([]);
  const [form, setForm]     = useState({ patient: '', note: '', priority: 'normal' });
  const [saved, setSaved]   = useState(false);
  const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

  const handleAdd = () => {
    if (!form.patient || !form.note) return;
    setNotes(prev => [{
      id:        Date.now().toString(),
      patient:   form.patient,
      note:      form.note,
      priority:  form.priority,
      createdAt: new Date().toLocaleString(),
    }, ...prev]);
    setForm({ patient: '', note: '', priority: 'normal' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">📝 Nurse Notes</h1>
        <p className="text-gray-500 text-sm mt-1">Patient observations & notes</p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 mb-4">
          ✅ Note saved!
        </div>
      )}

      {/* Add Note Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Add New Note</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Patient Name</label>
              <input value={form.patient} onChange={e => setForm({...form, patient: e.target.value})}
                placeholder="Patient name" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                className={inp}>
                <option value="normal">Normal</option>
                <option value="important">⚠️ Important</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Observation / Note</label>
            <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})}
              rows={3} placeholder="Patient observation, medication given, behavior notes..."
              className={`${inp} resize-none`} />
          </div>
          <button onClick={handleAdd} disabled={!form.patient || !form.note}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-colors">
            💾 Save Note
          </button>
        </div>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p className="text-3xl mb-2">📝</p>
          <p className="text-sm">No notes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(note => (
            <div key={note.id} className={`bg-white rounded-2xl border-l-4 p-4 shadow-sm ${
              note.priority === 'urgent'    ? 'border-red-500' :
              note.priority === 'important' ? 'border-yellow-500' :
              'border-teal-500'
            }`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-sm text-gray-900">{note.patient}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    note.priority === 'urgent'    ? 'bg-red-100 text-red-700' :
                    note.priority === 'important' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-teal-100 text-teal-700'
                  }`}>
                    {note.priority}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{note.note}</p>
              <p className="text-xs text-gray-400">{note.createdAt} · {user?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}