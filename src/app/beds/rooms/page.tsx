'use client';
import { useEffect, useState } from 'react';

const TYPE_CONFIG: Record<string, { color: string; icon: string; bg: string; border: string }> = {
  general:       { color:'text-blue-700',   icon:'🛏️', bg:'bg-blue-50',   border:'border-blue-200'   },
  private:       { color:'text-purple-700', icon:'🏨', bg:'bg-purple-50', border:'border-purple-200' },
  'semi-private':{ color:'text-indigo-700', icon:'🛏️', bg:'bg-indigo-50', border:'border-indigo-200' },
  icu:           { color:'text-red-700',    icon:'🚨', bg:'bg-red-50',    border:'border-red-200'    },
  emergency:     { color:'text-orange-700', icon:'⚡', bg:'bg-orange-50', border:'border-orange-200' },
  operation:     { color:'text-teal-700',   icon:'⚕️', bg:'bg-teal-50',   border:'border-teal-200'   },
};

const STATUS_CONFIG: Record<string, { dot: string; label: string; bg: string; text: string }> = {
  available:   { dot:'bg-green-500',  label:'Available',   bg:'bg-green-100',  text:'text-green-700'  },
  occupied:    { dot:'bg-red-500',    label:'Occupied',    bg:'bg-red-100',    text:'text-red-700'    },
  maintenance: { dot:'bg-yellow-500', label:'Maintenance', bg:'bg-yellow-100', text:'text-yellow-700' },
  reserved:    { dot:'bg-blue-500',   label:'Reserved',    bg:'bg-blue-100',   text:'text-blue-700'   },
};

const CATEGORIES = ['all','general','private','semi-private','icu','emergency','operation'];

export default function RoomsPage() {
  const [rooms,    setRooms]    = useState<any[]>([]);
  const [stats,    setStats]    = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [status,   setStatus]   = useState('all');
  const [showAdd,  setShowAdd]  = useState(false);
  const [showEdit, setShowEdit] = useState<any>(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState('');

  const emptyForm = {
    roomNumber:'', type:'general', floor:'1', ward:'General',
    capacity:'1', dailyCharge:'2000', notes:'',
    facilities: [] as string[],
    status:'available',
  };
  const [form, setForm] = useState(emptyForm);

  const FACILITIES_LIST = [
    'AC','Fan','TV','WiFi','Washroom','Sofa','Fridge',
    'Oxygen','Monitor','Ventilator','Emergency Call','Locker',
  ];

  const fetchRooms = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (filter !== 'all') params.set('type',   filter);
    const res  = await fetch(`/api/beds/rooms?${params}`);
    const data = await res.json();
    setRooms(data.rooms || []);
    setStats(data.stats);
    setLoading(false);
  };

  useEffect(() => { fetchRooms(); }, [filter, status]);

  const handleSave = async () => {
    if (!form.roomNumber || !form.dailyCharge) return;
    setSaving(true);
    const body = {
      ...form,
      capacity:    Number(form.capacity),
      dailyCharge: Number(form.dailyCharge),
    };
    if (showEdit) {
      const res = await fetch(`/api/beds/rooms/${showEdit._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.room) {
        setRooms(prev => prev.map(r => r._id === showEdit._id ? d.room : r));
        setShowEdit(null);
      }
    } else {
      const res = await fetch('/api/beds/rooms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.room) { setRooms(prev => [d.room, ...prev]); setShowAdd(false); }
    }
    setForm(emptyForm);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this room?')) return;
    setDeleting(id);
    await fetch(`/api/beds/rooms/${id}`, { method: 'DELETE' });
    setRooms(prev => prev.filter(r => r._id !== id));
    setDeleting('');
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setRooms(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
    await fetch(`/api/beds/rooms/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const toggleFacility = (f: string) => {
    setForm(prev => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter(x => x !== f)
        : [...prev.facilities, f],
    }));
  };

  const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  const RoomForm = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Room Number *</label>
          <input value={form.roomNumber}
            onChange={e => setForm({...form, roomNumber: e.target.value})}
            placeholder="e.g. G-101" className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Room Type *</label>
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={inp}>
            <option value="general">General Ward</option>
            <option value="semi-private">Semi-Private</option>
            <option value="private">Private</option>
            <option value="icu">ICU</option>
            <option value="emergency">Emergency</option>
            <option value="operation">Operation Theater</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Floor</label>
          <input value={form.floor}
            onChange={e => setForm({...form, floor: e.target.value})}
            placeholder="1" className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ward</label>
          <input value={form.ward}
            onChange={e => setForm({...form, ward: e.target.value})}
            placeholder="General" className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Capacity (Beds)</label>
          <input type="number" min="1" value={form.capacity}
            onChange={e => setForm({...form, capacity: e.target.value})}
            className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Daily Charge (PKR) *</label>
          <input type="number" min="0" value={form.dailyCharge}
            onChange={e => setForm({...form, dailyCharge: e.target.value})}
            className={inp} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={inp}>
            <option value="available">Available</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
      </div>

      {/* Facilities */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">Facilities</label>
        <div className="flex flex-wrap gap-2">
          {FACILITIES_LIST.map(f => (
            <button key={f} type="button"
              onClick={() => toggleFacility(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                form.facilities.includes(f)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes</label>
        <textarea value={form.notes}
          onChange={e => setForm({...form, notes: e.target.value})}
          rows={2} placeholder="Additional notes..." className={`${inp} resize-none`} />
      </div>

      <div className="flex gap-3">
        <button onClick={() => { setShowAdd(false); setShowEdit(null); setForm(emptyForm); }}
          className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={handleSave}
          disabled={saving || !form.roomNumber || !form.dailyCharge}
          className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors">
          {saving ? '⏳ Saving...' : showEdit ? '✅ Update Room' : '✅ Add Room'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">🛏️ Room Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            {rooms.length} rooms · {stats?.available || 0} available · {stats?.occupied || 0} occupied
          </p>
        </div>
        <button onClick={() => { setShowAdd(true); setForm(emptyForm); }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors">
          + Add Room
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        {[
          { label:'Total',       value:stats?.total       || 0, color:'bg-gray-50 border-gray-200'        },
          { label:'Available',   value:stats?.available   || 0, color:'bg-green-50 border-green-200'      },
          { label:'Occupied',    value:stats?.occupied    || 0, color:'bg-red-50 border-red-200'          },
          { label:'Maintenance', value:stats?.maintenance || 0, color:'bg-yellow-50 border-yellow-200'    },
          { label:'Occupancy',   value:`${stats?.occupancyRate || 0}%`, color:'bg-indigo-50 border-indigo-200' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-3 text-center`}>
            <p className="text-xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap flex-shrink-0 transition-all ${
                filter === c ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}>
              {c}
            </button>
          ))}
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-shrink-0">
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
          <option value="reserved">Reserved</option>
        </select>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-3">🛏️</p>
          <p className="text-gray-400 text-lg mb-4">No rooms found</p>
          <button onClick={() => setShowAdd(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
            + Add First Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => {
            const tc = TYPE_CONFIG[room.type]     || TYPE_CONFIG.general;
            const sc = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
            return (
              <div key={room._id}
                className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-lg transition-all ${tc.border}`}>

                {/* Room Header */}
                <div className={`${tc.bg} p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tc.icon}</span>
                      <div>
                        <p className="font-black text-gray-900 text-lg">{room.roomNumber}</p>
                        <p className={`text-xs font-semibold capitalize ${tc.color}`}>{room.type}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${sc.dot} mr-1`} />
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                    <span>🏢 Floor {room.floor}</span>
                    <span>🏥 {room.ward}</span>
                    <span>🛏️ {room.capacity} bed{room.capacity > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Daily Charge</p>
                      <p className="font-black text-green-600 text-lg">PKR {room.dailyCharge?.toLocaleString()}</p>
                    </div>
                    {room.currentPatient && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Current Patient</p>
                        <p className="text-xs font-bold text-red-600">{room.currentPatient.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Facilities */}
                  {room.facilities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {room.facilities.slice(0, 4).map((f: string) => (
                        <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                          {f}
                        </span>
                      ))}
                      {room.facilities.length > 4 && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">
                          +{room.facilities.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Status Change */}
                  {room.status !== 'occupied' && (
                    <div className="flex gap-2 mb-3">
                      {room.status !== 'available' && (
                        <button onClick={() => handleStatusChange(room._id, 'available')}
                          className="flex-1 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors">
                          ✅ Available
                        </button>
                      )}
                      {room.status !== 'maintenance' && (
                        <button onClick={() => handleStatusChange(room._id, 'maintenance')}
                          className="flex-1 py-1.5 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-xl text-xs font-semibold hover:bg-yellow-100 transition-colors">
                          🔧 Maintenance
                        </button>
                      )}
                    </div>
                  )}

                  {/* Edit + Delete */}
                  <div className="flex gap-2">
                    <button onClick={() => {
                      setShowEdit(room);
                      setForm({
                        roomNumber:  room.roomNumber,
                        type:        room.type,
                        floor:       room.floor,
                        ward:        room.ward,
                        capacity:    String(room.capacity),
                        dailyCharge: String(room.dailyCharge),
                        notes:       room.notes || '',
                        facilities:  room.facilities || [],
                        status:      room.status,
                      });
                    }}
                      className="flex-1 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(room._id)}
                      disabled={deleting === room._id || room.status === 'occupied'}
                      className="px-3 py-2 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xs font-semibold hover:bg-red-100 disabled:opacity-40 transition-colors">
                      {deleting === room._id ? '⏳' : '🗑️'}
                    </button>
                  </div>

                  {room.status === 'occupied' && (
                    <p className="text-xs text-red-400 text-center mt-2">
                      ⚠️ Cannot delete occupied room
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {(showAdd || showEdit) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">
                {showEdit ? '✏️ Edit Room' : '➕ Add New Room'}
              </h3>
              <button onClick={() => { setShowAdd(false); setShowEdit(null); setForm(emptyForm); }}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg text-xl">
                ✕
              </button>
            </div>
            <RoomForm />
          </div>
        </div>
      )}
    </div>
  );
}