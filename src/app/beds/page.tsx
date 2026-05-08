'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const TYPE_CONFIG: Record<string, { color: string; icon: string; bg: string }> = {
  general:      { color: 'text-blue-700',   icon: '🛏️',  bg: 'bg-blue-50 border-blue-200'    },
  private:      { color: 'text-purple-700', icon: '🏨',  bg: 'bg-purple-50 border-purple-200' },
  'semi-private':{ color: 'text-indigo-700',icon: '🛏️',  bg: 'bg-indigo-50 border-indigo-200' },
  icu:          { color: 'text-red-700',    icon: '🚨',  bg: 'bg-red-50 border-red-200'       },
  emergency:    { color: 'text-orange-700', icon: '⚡',  bg: 'bg-orange-50 border-orange-200' },
  operation:    { color: 'text-teal-700',   icon: '⚕️',  bg: 'bg-teal-50 border-teal-200'     },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  available:   { color: 'bg-green-100 text-green-700',  label: '🟢 Available'   },
  occupied:    { color: 'bg-red-100 text-red-700',      label: '🔴 Occupied'    },
  maintenance: { color: 'bg-yellow-100 text-yellow-700',label: '🟡 Maintenance' },
  reserved:    { color: 'bg-blue-100 text-blue-700',    label: '🔵 Reserved'    },
};

export default function BedsDashboard() {
  const [stats, setStats]       = useState<any>(null);
  const [rooms, setRooms]       = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/beds/rooms').then(r => r.json()),
      fetch('/api/beds/admissions?status=admitted').then(r => r.json()),
    ]).then(([roomData, admData]) => {
      setStats(roomData.stats);
      setRooms(roomData.rooms || []);
      setAdmissions(admData.admissions || []);
      setLoading(false);
    });
  }, []);

  const filteredRooms = typeFilter === 'all'
    ? rooms
    : rooms.filter(r => r.type === typeFilter);

  const ROOM_TYPES = ['all','general','private','semi-private','icu','emergency','operation'];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">🛏️ Bed & Room Management</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time room occupancy overview</p>
        </div>
        <div className="flex gap-2">
          <Link href="/beds/admissions/new" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors">
            + Admit Patient
          </Link>
          <Link href="/beds/rooms/add" className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">
            + Add Room
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label:'Total Rooms',    value:stats?.total       || 0, icon:'🛏️', color:'bg-gray-50 border-gray-200'      },
          { label:'Available',      value:stats?.available   || 0, icon:'🟢', color:'bg-green-50 border-green-200'    },
          { label:'Occupied',       value:stats?.occupied    || 0, icon:'🔴', color:'bg-red-50 border-red-200'        },
          { label:'Maintenance',    value:stats?.maintenance || 0, icon:'🟡', color:'bg-yellow-50 border-yellow-200'  },
          { label:'Occupancy Rate', value:`${stats?.occupancyRate || 0}%`, icon:'📊', color:'bg-indigo-50 border-indigo-200'},
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-4`}>
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label:'Admit Patient',  href:'/beds/admissions/new', icon:'🏥', color:'bg-indigo-600' },
          { label:'View Rooms',     href:'/beds/rooms',          icon:'🛏️', color:'bg-blue-600'   },
          { label:'Discharge',      href:'/beds/discharge',      icon:'✅', color:'bg-green-600'  },
          { label:'History',        href:'/beds/history',        icon:'📋', color:'bg-gray-600'   },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className={`${a.color} text-white rounded-2xl p-4 text-center hover:opacity-90 transition-opacity`}>
            <p className="text-2xl mb-1">{a.icon}</p>
            <p className="text-xs font-semibold">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* Room Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-5">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-gray-900">🛏️ Room Overview</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {ROOM_TYPES.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap flex-shrink-0 transition-all ${
                    typeFilter === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
            {filteredRooms.map(room => {
              const tc = TYPE_CONFIG[room.type]     || TYPE_CONFIG.general;
              const sc = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
              return (
                <div key={room._id}
                  className={`${tc.bg} border-2 rounded-2xl p-3 transition-all hover:shadow-md cursor-pointer ${
                    room.status === 'occupied' ? 'opacity-80' : ''
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{tc.icon}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sc.color}`}>
                      {room.status === 'available' ? '🟢' :
                       room.status === 'occupied'  ? '🔴' :
                       room.status === 'maintenance'? '🟡' : '🔵'}
                    </span>
                  </div>
                  <p className="font-black text-gray-900 text-base">{room.roomNumber}</p>
                  <p className={`text-xs font-semibold ${tc.color} capitalize mb-1`}>{room.type}</p>
                  <p className="text-xs text-gray-500">{room.ward}</p>
                  <p className="text-xs font-bold text-green-600 mt-1">PKR {room.dailyCharge}/day</p>
                  {room.currentPatient && (
                    <p className="text-xs text-red-600 font-semibold mt-1 truncate">
                      👤 {room.currentPatient.name}
                    </p>
                  )}
                </div>
              );
            })}
            {filteredRooms.length === 0 && (
              <div className="col-span-5 text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">🛏️</p>
                <p>No rooms found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Admissions */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">🏥 Active Admissions ({admissions.length})</h3>
          <Link href="/beds/admissions" className="text-xs text-indigo-600 font-medium">View all →</Link>
        </div>
        {admissions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🏥</p>
            <p className="text-sm">No active admissions</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {admissions.slice(0, 5).map(adm => (
              <div key={adm._id} className="flex items-center gap-3 p-4 hover:bg-gray-50">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                  {adm.patient?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{adm.patient?.name}</p>
                  <p className="text-xs text-gray-500">
                    Room {adm.room?.roomNumber} · Dr. {adm.doctor?.name} · Since {adm.admissionDate}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-indigo-600 capitalize">{adm.room?.type}</p>
                  <p className="text-xs text-green-600 font-bold">PKR {adm.room?.dailyCharge}/day</p>
                </div>
                <Link href={`/beds/discharge?id=${adm._id}`}
                  className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-bold rounded-xl hover:bg-green-100 transition-colors flex-shrink-0">
                  Discharge
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}