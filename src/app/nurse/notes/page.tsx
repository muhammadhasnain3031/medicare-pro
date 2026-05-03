'use client';
import React, { useState } from 'react';

interface Note {
  id: string;
  patientName: string;
  note: string;
  time: string;
  category: 'Critical' | 'Stable' | 'Observation';
}

export default function NurseNotes() {
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', patientName: 'Zayan Sultan', note: 'Patient is stable after medication. Pulse rate normal.', time: '10:30 AM', category: 'Stable' },
    { id: '2', patientName: 'Meiroz Sultan', note: 'High fever recorded. Administered paracetamol.', time: '09:15 AM', category: 'Critical' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({ patientName: '', note: '', category: 'Observation' as const });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    const noteToAdd: Note = {
      id: Math.random().toString(),
      patientName: newNote.patientName,
      note: newNote.note,
      category: newNote.category,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotes([noteToAdd, ...notes]);
    setIsModalOpen(false);
    setNewNote({ patientName: '', note: '', category: 'Observation' });
  };

  return (
    <div className="p-6 min-h-screen bg-[#F8FAFC]"> {/* Matching Light Background */}
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nurse Daily Notes</h1>
          <p className="text-slate-500 text-sm">Monitor and record patient status</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2563EB] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all"
        >
          + Add New Note
        </button>
      </div>

      {/* Notes List */}
      <div className="grid gap-4">
        {notes.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{item.patientName}</h3>
                <span className="text-xs font-medium text-slate-400">{item.time}</span>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                item.category === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 
                item.category === 'Stable' ? 'bg-green-50 text-green-600 border-green-100' : 
                'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                {item.category}
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{item.note}</p>
          </div>
        ))}
      </div>

      {/* Add Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Create New Note</h2>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Patient Name</label>
                <input 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={newNote.patientName}
                  onChange={(e) => setNewNote({...newNote, patientName: e.target.value})}
                  placeholder="E.g. Zayan Sultan"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 outline-none"
                  value={newNote.category}
                  onChange={(e) => setNewNote({...newNote, category: e.target.value as any})}
                >
                  <option value="Observation">Observation</option>
                  <option value="Stable">Stable</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Note Details</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:border-blue-500 outline-none resize-none"
                  value={newNote.note}
                  onChange={(e) => setNewNote({...newNote, note: e.target.value})}
                  placeholder="Enter observation details..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-[#2563EB] text-white hover:bg-blue-700 font-medium shadow-sm transition-all"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}