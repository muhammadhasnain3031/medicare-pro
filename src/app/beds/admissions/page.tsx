'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('admitted');
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState<any>(null);

  const fetchAdmissions = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    const res  = await fetch(`/api/beds/admissions?${params}`);
    const data = await res.json();
    setAdmissions(data.admissions || []);
    setLoading(false);
  };

  useEffect(() => { fetchAdmissions(); }, [filter]);

  const filtered = admissions.filter(a =>
    a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.room?.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
    a.doctor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const calcDays = (admDate: string) => {
    const diff = new Date().getTime() - new Date(admDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const TYPE_ICONS: Record<string, string> = {
    general: '🛏️', private: '🏨', 'semi-private': '🛏️',
    icu: '🚨', emergency: '⚡', operation: '⚕️',
  };

  const ADM_TYPE_STYLE: Record<string, string> = {
    emergency: 'bg-red-100 text-red-700',
    planned:   'bg-blue-100 text-blue-700',
    transfer:  'bg-purple-100 text-purple-700',
  };

  const total    = admissions.length;
  const admitted = admissions.filter(a => a.status === 'admitted').length;
  const totalRev = admissions.filter(a => a.status === 'discharged')
    .reduce((s, a) => s + (a.totalCharges || 0), 0);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">🏥 Admissions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {admitted} active · {total} total
          </p>
        </div>
        <Link href="/beds/admissions/new"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors text-center">
          + Admit Patient
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label:'Active Admissions', value:admitted,                                  color:'bg-indigo-50 border-indigo-200', text:'text-indigo-700' },
          { label:'Total Admissions',  value:total,                                     color:'bg-blue-50 border-blue-200',    text:'text-blue-700'   },
          { label:'Total Revenue',     value:`PKR ${(totalRev/1000).toFixed(1)}K`,     color:'bg-green-50 border-green-200',  text:'text-green-700'  },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-3 md:p-4`}>
            <p className={`text-lg md:text-2xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search patient, room, doctor..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-2 flex-shrink-0">
          {[
            { key:'admitted',  label:'Active'     },
            { key:'discharged',label:'Discharged' },
            { key:'all',       label:'All'        },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f.key ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-3">🏥</p>
          <p className="text-gray-400 text-lg mb-4">No admissions found</p>
          <Link href="/beds/admissions/new"
            className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
            + Admit First Patient
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Admission Cards */}
          <div className="space-y-3">
            {filtered.map(adm => {
              const days     = adm.status === 'admitted' ? calcDays(adm.admissionDate) : adm.totalDays;
              const charges  = adm.status === 'admitted'
                ? days * (adm.room?.dailyCharge || 0)
                : adm.totalCharges || 0;

              return (
                <div key={adm._id}
                  onClick={() => setSelected(selected?._id === adm._id ? null : adm)}
                  className={`bg-white rounded-2xl border-2 p-4 cursor-pointer hover:shadow-md transition-all ${
                    selected?._id === adm._id
                      ? 'border-indigo-400 bg-indigo-50/30'
                      : adm.status === 'admitted' ? 'border-indigo-100' : 'border-gray-100'
                  }`}>

                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      adm.status === 'admitted' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {adm.patient?.name?.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name + status */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-gray-900">{adm.patient?.name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          adm.status === 'admitted' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {adm.status === 'admitted' ? '🏥 Admitted' : '✅ Discharged'}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ADM_TYPE_STYLE[adm.admissionType] || 'bg-gray-100 text-gray-600'}`}>
                          {adm.admissionType}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span>{TYPE_ICONS[adm.room?.type] || '🛏️'} Room {adm.room?.roomNumber}</span>
                        <span>👨‍⚕️ Dr. {adm.doctor?.name}</span>
                        <span>📅 {adm.admissionDate}</span>
                        <span className="font-semibold text-indigo-600">⏱️ {days} day{days > 1 ? 's' : ''}</span>
                      </div>

                      {adm.diagnosis && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          🔍 {adm.diagnosis}
                        </p>
                      )}
                    </div>

                    {/* Charges */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-base text-green-600">
                        PKR {charges.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {adm.status === 'admitted' ? 'so far' : 'total'}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {adm.status === 'admitted' && selected?._id === adm._id && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Link href={`/beds/discharge?id=${adm._id}`}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl text-center transition-colors">
                        ✅ Discharge
                      </Link>
                      <Link href={`/beds/admissions/new`}
                        className="flex-1 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs font-bold rounded-xl text-center hover:bg-indigo-100 transition-colors">
                        + New Admission
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detail Panel */}
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 h-fit lg:sticky lg:top-6">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">📋 Admission Details</h3>

              <div className="space-y-2 mb-4">
                {[
                  ['👤 Patient',      selected.patient?.name],
                  ['📞 Phone',        selected.patient?.phone || 'N/A'],
                  ['🩸 Blood Group',  selected.patient?.bloodGroup || 'N/A'],
                  ['👨‍⚕️ Doctor',       `Dr. ${selected.doctor?.name}`],
                  ['🏥 Specialization',selected.doctor?.specialization],
                  ['🛏️ Room',         `${selected.room?.roomNumber} (${selected.room?.type})`],
                  ['🏢 Ward',         selected.room?.ward],
                  ['📅 Admitted',     selected.admissionDate],
                  ['✅ Discharged',   selected.dischargeDate || 'Still admitted'],
                  ['🔍 Diagnosis',    selected.diagnosis || 'N/A'],
                  ['📝 Type',         selected.admissionType],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between text-sm py-1.5 border-b border-gray-50">
                    <span className="text-gray-400 text-xs">{k}</span>
                    <span className="font-semibold text-xs text-gray-900 text-right max-w-[55%]">{v}</span>
                  </div>
                ))}
              </div>

              {/* Charges */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Daily Rate</span>
                  <span className="font-semibold">PKR {selected.room?.dailyCharge?.toLocaleString()}/day</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Days</span>
                  <span className="font-semibold">
                    {selected.status === 'admitted'
                      ? calcDays(selected.admissionDate)
                      : selected.totalDays} days
                  </span>
                </div>
                <div className="flex justify-between font-black text-base mt-2 pt-2 border-t border-indigo-100">
                  <span>Total</span>
                  <span className="text-indigo-700">
                    PKR {(selected.status === 'admitted'
                      ? calcDays(selected.admissionDate) * (selected.room?.dailyCharge || 0)
                      : selected.totalCharges || 0
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {selected.dischargeSummary && (
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">📝 Discharge Summary</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{selected.dischargeSummary}</p>
                </div>
              )}

              {selected.notes && (
                <div className="bg-yellow-50 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-yellow-700 mb-1">📌 Notes</p>
                  <p className="text-xs text-gray-700">{selected.notes}</p>
                </div>
              )}

              {selected.status === 'admitted' && (
                <Link href={`/beds/discharge?id=${selected._id}`}
                  className="block w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm text-center transition-colors">
                  ✅ Process Discharge
                </Link>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 items-center justify-center h-64">
              <div>
                <p className="text-4xl mb-2">👆</p>
                <p className="text-sm">Click any admission to view details</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}