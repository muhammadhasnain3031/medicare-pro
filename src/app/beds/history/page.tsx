'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function BedsHistory() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState<any>(null);

  useEffect(() => {
    fetch('/api/beds/admissions?status=discharged')
      .then(r => r.json())
      .then(d => { setAdmissions(d.admissions || []); setLoading(false); });
  }, []);

  const filtered = admissions.filter(a =>
    a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.room?.roomNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = admissions.reduce((s, a) => s + (a.totalCharges || 0), 0);

  const downloadPDF = (adm: any) => {
    const doc = new jsPDF();
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 220, 38, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(16);
    doc.setFont('helvetica','bold');
    doc.text('MediCare Pro — Discharge Summary', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica','normal');
    doc.text(`Date: ${adm.dischargeDate}`, 14, 28);
    doc.setTextColor(0,0,0);
    doc.setFontSize(10);
    doc.text(`Patient: ${adm.patient?.name}`, 14, 48);
    doc.text(`Doctor: Dr. ${adm.doctor?.name}`, 14, 55);
    doc.text(`Room: ${adm.room?.roomNumber} (${adm.room?.type})`, 14, 62);
    doc.text(`Admitted: ${adm.admissionDate}  |  Discharged: ${adm.dischargeDate}`, 14, 69);
    doc.text(`Total Days: ${adm.totalDays}`, 14, 76);
    autoTable(doc, {
      startY: 85,
      head:   [['Item','Days','Rate/Day','Total']],
      body:   [['Room Charges', adm.totalDays, `PKR ${adm.room?.dailyCharge}`, `PKR ${adm.totalCharges?.toLocaleString()}`]],
      headStyles: { fillColor: [79,70,229], textColor: 255 },
      styles: { fontSize: 9 },
    });
    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica','bold');
    doc.setFontSize(13);
    doc.text(`Total: PKR ${adm.totalCharges?.toLocaleString()}`, 14, y);
    if (adm.dischargeSummary) {
      doc.setFontSize(10);
      doc.setFont('helvetica','normal');
      doc.text('Notes:', 14, y+12);
      const lines = doc.splitTextToSize(adm.dischargeSummary, 180);
      doc.text(lines, 14, y+20);
    }
    doc.save(`discharge-${adm.patient?.name}.pdf`);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">📋 Admission History</h1>
        <p className="text-gray-500 text-sm mt-1">
          {admissions.length} discharged · Total Revenue:{' '}
          <span className="font-bold text-green-600">PKR {totalRevenue.toLocaleString()}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label:'Total Admissions', value:admissions.length,                                        icon:'🏥', color:'bg-blue-50 border-blue-200'   },
          { label:'Total Revenue',    value:`PKR ${(totalRevenue/1000).toFixed(1)}K`,                 icon:'💰', color:'bg-green-50 border-green-200'  },
          { label:'Avg Stay',         value:`${admissions.length > 0 ? Math.round(admissions.reduce((s,a) => s+(a.totalDays||0),0)/admissions.length) : 0}d`, icon:'📅', color:'bg-purple-50 border-purple-200' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-2xl p-3 md:p-4`}>
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-lg md:text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by patient name or room..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-400">
                <p className="text-3xl mb-2">📋</p>
                <p>No discharge history</p>
              </div>
            ) : filtered.map(adm => (
              <div key={adm._id}
                onClick={() => setSelected(selected?._id === adm._id ? null : adm)}
                className={`bg-white rounded-2xl border-2 p-4 cursor-pointer hover:shadow-md transition-all ${
                  selected?._id === adm._id ? 'border-indigo-400' : 'border-gray-100'
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                    {adm.patient?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900">{adm.patient?.name}</p>
                    <p className="text-xs text-gray-500">
                      Room {adm.room?.roomNumber} · {adm.totalDays} days · {adm.admissionDate} → {adm.dischargeDate}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-green-600 text-sm">PKR {adm.totalCharges?.toLocaleString()}</p>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                      ✅ Discharged
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 h-fit lg:sticky lg:top-6">
              <h3 className="font-bold text-gray-900 mb-4">Discharge Details</h3>
              <div className="space-y-3 mb-4">
                {[
                  ['👤 Patient',   selected.patient?.name],
                  ['👨‍⚕️ Doctor',   `Dr. ${selected.doctor?.name}`],
                  ['🛏️ Room',      `${selected.room?.roomNumber} (${selected.room?.type})`],
                  ['📅 Admitted',  selected.admissionDate],
                  ['✅ Discharged',selected.dischargeDate],
                  ['⏱️ Total Days', `${selected.totalDays} days`],
                  ['🏥 Diagnosis', selected.diagnosis || 'N/A'],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between text-sm bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-gray-500 text-xs">{k}</span>
                    <span className="font-semibold text-gray-900 text-xs text-right max-w-[60%] truncate">{v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Room Charge/Day</span>
                  <span className="font-semibold text-sm">PKR {selected.room?.dailyCharge?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2 font-black text-base">
                  <span>Total Charges</span>
                  <span className="text-indigo-700">PKR {selected.totalCharges?.toLocaleString()}</span>
                </div>
              </div>

              {selected.dischargeSummary && (
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">📝 Discharge Notes</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{selected.dischargeSummary}</p>
                </div>
              )}

              <button onClick={() => downloadPDF(selected)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors">
                📄 Download Discharge PDF
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 h-fit hidden lg:block">
              <p className="text-3xl mb-2">👆</p>
              <p className="text-sm">Select a record to view details</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}