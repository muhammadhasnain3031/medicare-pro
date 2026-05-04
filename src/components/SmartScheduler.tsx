'use client';
import { useEffect, useState } from 'react';

interface Doctor {
  id: string; name: string; specialization: string; fee: number;
}

interface SlotData {
  available:  string[];
  booked:     string[];
  suggested:  string[];
  totalBooked: number;
  totalFree:  number;
}

interface DoctorAvailability {
  doctor:       Doctor;
  available:    number;
  booked:       number;
  busyPercent:  number;
  status:       string;
}

interface AISuggestion {
  recommendedSpecialization: string;
  recommendedDoctor:         string;
  urgency:                   string;
  reason:                    string;
  tips:                      string;
}

interface Props {
  onSelectSlot: (doctorId: string, date: string, time: string) => void;
  selectedDoctorId?: string;
  selectedDate?:     string;
}

const URGENCY_STYLES: Record<string, string> = {
  routine:   'bg-green-100 text-green-700 border-green-200',
  soon:      'bg-yellow-100 text-yellow-700 border-yellow-200',
  urgent:    'bg-orange-100 text-orange-700 border-orange-200',
  emergency: 'bg-red-100 text-red-700 border-red-200',
};

export default function SmartScheduler({ onSelectSlot, selectedDoctorId, selectedDate: propDate }: Props) {
  const [date, setDate]                   = useState(propDate || new Date().toISOString().split('T')[0]);
  const [doctorId, setDoctorId]           = useState(selectedDoctorId || '');
  const [slots, setSlots]                 = useState<SlotData | null>(null);
  const [availability, setAvailability]   = useState<DoctorAvailability[]>([]);
  const [aiSuggestion, setAiSuggestion]   = useState<AISuggestion | null>(null);
  const [symptoms, setSymptoms]           = useState('');
  const [selectedSlot, setSelectedSlot]   = useState('');
  const [loadingSlots, setLoadingSlots]   = useState(false);
  const [loadingAI, setLoadingAI]         = useState(false);
  const [activeTab, setActiveTab]         = useState<'availability'|'slots'|'ai'>('availability');

  // Load doctor availability
  useEffect(() => {
    fetch(`/api/scheduling/doctor-availability?date=${date}`)
      .then(r => r.json())
      .then(d => setAvailability(d.availability || []));
  }, [date]);

  // Load slots when doctor + date selected
  useEffect(() => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    fetch(`/api/scheduling/slots?doctorId=${doctorId}&date=${date}`)
      .then(r => r.json())
      .then(d => { setSlots(d); setLoadingSlots(false); });
  }, [doctorId, date]);

  const handleAISuggest = async () => {
    if (!symptoms.trim()) return;
    setLoadingAI(true);
    try {
      const res = await fetch('/api/scheduling/ai-suggest', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ symptoms, preferredDate: date }),
      });
      const data = await res.json();
      setAiSuggestion(data);
    } catch (err) {
      console.error(err);
    }
    setLoadingAI(false);
  };

  const handleConfirm = () => {
    if (!doctorId || !date || !selectedSlot) return;
    onSelectSlot(doctorId, date, selectedSlot);
  };

  const statusColor = (s: string) =>
    s === 'available'   ? 'bg-green-100 text-green-700'  :
    s === 'busy'        ? 'bg-yellow-100 text-yellow-700' :
    s === 'almost_full' ? 'bg-red-100 text-red-700'       : 'bg-gray-100 text-gray-600';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
        <h3 className="font-bold text-base flex items-center gap-2">
          📅 Smart Appointment Scheduler
        </h3>
        <p className="text-blue-100 text-xs mt-1">AI-powered scheduling assistant</p>
      </div>

      {/* Date Picker */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700 flex-shrink-0">📅 Date:</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {[
          { key: 'availability', label: '🟢 Availability'      },
          { key: 'slots',        label: '⏰ Time Slots'         },
          { key: 'ai',           label: '🤖 AI Suggest'         },
        ].map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-3 text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Doctor Availability — {new Date(date).toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}
            </p>
            {availability.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-2xl mb-2">👨‍⚕️</p>
                <p className="text-sm">No doctors available</p>
              </div>
            ) : availability.map(item => (
              <div key={item.doctor.id}
                onClick={() => { setDoctorId(item.doctor.id); setActiveTab('slots'); }}
                className={`p-3 rounded-xl border cursor-pointer hover:shadow-sm transition-all ${
                  doctorId === item.doctor.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-blue-200'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {item.doctor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{item.doctor.name}</p>
                      <p className="text-xs text-blue-600">{item.doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusColor(item.status)}`}>
                      {item.status === 'available' ? '🟢 Available' :
                       item.status === 'busy'       ? '🟡 Busy'     :
                                                      '🔴 Almost Full'}
                    </span>
                    <span className="text-xs text-green-600 font-semibold">PKR {item.doctor.fee}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.busyPercent >= 90 ? 'bg-red-500' :
                        item.busyPercent >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.busyPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {item.available} free
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Slots Tab */}
        {activeTab === 'slots' && (
          <div>
            {!doctorId ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-2xl mb-2">👆</p>
                <p className="text-sm">Select a doctor from Availability tab first</p>
                <button onClick={() => setActiveTab('availability')}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">
                  View Availability
                </button>
              </div>
            ) : loadingSlots ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : slots ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Available Time Slots
                  </p>
                  <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full" /> Free ({slots.totalFree})</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-300 rounded-full" /> Booked ({slots.totalBooked})</span>
                  </div>
                </div>

                {/* Suggested slots */}
                {slots.suggested.length > 0 && (
                  <div className="mb-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-blue-700 mb-2">⭐ AI Suggested Best Slots</p>
                    <div className="flex gap-2 flex-wrap">
                      {slots.suggested.map(slot => (
                        <button key={slot} onClick={() => setSelectedSlot(slot)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                            selectedSlot === slot
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-blue-700 border-blue-300 hover:border-blue-500'
                          }`}>
                          ⭐ {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* All slots grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[...slots.available, ...slots.booked].sort().map(slot => {
                    const isBooked    = slots.booked.includes(slot);
                    const isSelected  = selectedSlot === slot;
                    const isSuggested = slots.suggested.includes(slot);
                    return (
                      <button key={slot}
                        disabled={isBooked}
                        onClick={() => !isBooked && setSelectedSlot(slot)}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all ${
                          isBooked  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through' :
                          isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md' :
                          isSuggested ? 'bg-blue-50 text-blue-700 border-blue-300 hover:border-blue-500' :
                          'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                        }`}>
                        {isBooked ? '🚫' : isSelected ? '✅' : '⏰'} {slot}
                      </button>
                    );
                  })}
                </div>

                {selectedSlot && (
                  <button onClick={handleConfirm}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity shadow-md">
                    ✅ Confirm {selectedSlot} Appointment
                  </button>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* AI Suggest Tab */}
        {activeTab === 'ai' && (
          <div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                🤖 Describe your symptoms or reason for visit
              </label>
              <textarea
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                rows={3}
                placeholder="e.g. I have been having chest pain and shortness of breath for 2 days..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button onClick={handleAISuggest}
                disabled={!symptoms.trim() || loadingAI}
                className="mt-2 w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 hover:opacity-90 transition-opacity">
                {loadingAI ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AI is analyzing...
                  </span>
                ) : '🤖 Get AI Doctor Recommendation'}
              </button>
            </div>

            {aiSuggestion && (
              <div className="space-y-3">
                {/* Urgency */}
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm ${URGENCY_STYLES[aiSuggestion.urgency]}`}>
                  <span className="text-lg">
                    {aiSuggestion.urgency === 'emergency' ? '🚨' :
                     aiSuggestion.urgency === 'urgent'    ? '⚠️' :
                     aiSuggestion.urgency === 'soon'      ? '🟡' : '🟢'}
                  </span>
                  Urgency: <span className="capitalize font-bold">{aiSuggestion.urgency}</span>
                </div>

                {/* Recommendation */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-700 mb-2">👨‍⚕️ AI Recommendation</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Specialization:</span>
                      <span className="font-bold text-gray-900">{aiSuggestion.recommendedSpecialization}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Doctor:</span>
                      <span className="font-bold text-blue-600">{aiSuggestion.recommendedDoctor}</span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">💡 Reason:</p>
                  <p className="text-sm text-gray-700">{aiSuggestion.reason}</p>
                </div>

                {/* Tips */}
                {aiSuggestion.tips && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-green-700 mb-1">✅ Health Tips:</p>
                    <p className="text-sm text-gray-700">{aiSuggestion.tips}</p>
                  </div>
                )}

                <button onClick={() => setActiveTab('availability')}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors">
                  📅 Book Appointment Now →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}