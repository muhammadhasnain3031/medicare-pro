'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function DischargeContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const preId        = searchParams.get('id');

  const [admissions, setAdmissions]   = useState<any[]>([]);
  const [selected,   setSelected]     = useState<any>(null);
  const [summary,    setSummary]      = useState('');
  const [loading,    setLoading]      = useState(true);
  const [processing, setProcessing]   = useState(false);
  const [discharged, setDischarged]   = useState<any>(null);
  const [error,      setError]        = useState('');

  useEffect(() => {
    fetch('/api/beds/admissions?status=admitted')
      .then(r => r.json())
      .then(d => {
        const list = d.admissions || [];
        setAdmissions(list);
        if (preId) {
          const found = list.find((a: any) => a._id === preId);
          if (found) setSelected(found);
        }
        setLoading(false);
      });
  }, [preId]);

  const calcDays = (admDate: string) => {
    const diff = new Date().getTime() - new Date(admDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const calcCharges = (adm: any) =>
    calcDays(adm.admissionDate) * (adm.room?.dailyCharge || 0);

  // ✅ Discharge handler
  const handleDischarge = async () => {
    if (!selected) return;
    setProcessing(true);
    setError('');

    try {
      console.log('Discharging:', selected._id);

      const res = await fetch(`/api/beds/admissions/${selected._id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          action:          'discharge',
          dischargeSummary: summary,
        }),
      });

      const data = await res.json();
      console.log('Discharge response:', data);

      if (!res.ok) {
        setError(data.message || 'Discharge failed');
        setProcessing(false);
        return;
      }

      if (data.admission) {
        setDischarged(data.admission);
        generateDischargePDF(data.admission);
      }
    } catch (err: any) {
      console.error('Discharge error:', err);
      setError(err.message || 'Something went wrong');
    }

    setProcessing(false);
  };

  const generateDischargePDF = (adm: any) => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 220, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MediCare Pro', 14, 16);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('DISCHARGE SUMMARY', 14, 26);
    doc.text(`Date: ${adm.dischargeDate || new Date().toLocaleDateString()}`, 130, 26);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    let y = 52;
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 14, y); y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Name:        ${adm.patient?.name || 'N/A'}`, 14, y); y += 6;
    doc.text(`Phone:       ${adm.patient?.phone || 'N/A'}`, 14, y); y += 6;
    doc.text(`Blood Group: ${adm.patient?.bloodGroup || 'N/A'}`, 14, y); y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('ADMISSION DETAILS', 14, y); y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Doctor:        Dr. ${adm.doctor?.name || 'N/A'} (${adm.doctor?.specialization || ''})`, 14, y); y += 6;
    doc.text(`Room:          ${adm.room?.roomNumber || 'N/A'} (${adm.room?.type || ''})`, 14, y); y += 6;
    doc.text(`Admission Date: ${adm.admissionDate}`, 14, y); y += 6;
    doc.text(`Discharge Date: ${adm.dischargeDate || new Date().toLocaleDateString()}`, 14, y); y += 10;

    autoTable(doc, {
      startY: y,
      head:   [['Description', 'Days', 'Rate/Day', 'Total Amount']],
      body:   [[
        'Room & Board Charges',
        String(adm.totalDays || calcDays(adm.admissionDate)),
        `PKR ${(adm.room?.dailyCharge || 0).toLocaleString()}`,
        `PKR ${(adm.totalCharges || calcCharges(adm)).toLocaleString()}`,
      ]],
      headStyles:  { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      styles:      { fontSize: 10, cellPadding: 5 },
      columnStyles:{ 3: { fontStyle: 'bold' } },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    doc.setFillColor(237, 233, 254);
    doc.rect(14, y - 5, 182, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(79, 70, 229);
    doc.text('TOTAL CHARGES:', 18, y + 6);
    doc.text(`PKR ${(adm.totalCharges || calcCharges(adm)).toLocaleString()}`, 140, y + 6);

    if (adm.dischargeSummary || summary) {
      y += 25;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('DISCHARGE NOTES / FOLLOW-UP:', 14, y); y += 8;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(adm.dischargeSummary || summary, 180);
      doc.text(lines, 14, y);
    }

    // Footer
    doc.setFillColor(245, 243, 255);
    doc.rect(0, 278, 220, 19, 'F');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('MediCare Pro — Hospital Management System', 14, 286);
    doc.text('This is a computer-generated document', 14, 292);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 130, 286);

    doc.save(`Discharge-${adm.patient?.name || 'Patient'}-${adm.dischargeDate || 'today'}.pdf`);
  };

  // ✅ Success screen
  if (discharged) return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-white rounded-3xl border-2 border-green-200 p-8 text-center shadow-lg">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Discharged Successfully!</h2>
        <p className="text-gray-500 mb-6">
          {discharged.patient?.name} — Room {discharged.room?.roomNumber}
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3 text-sm">
          {[
            ['📅 Admission Date',  discharged.admissionDate],
            ['✅ Discharge Date',  discharged.dischargeDate],
            ['⏱️ Total Days',      `${discharged.totalDays} days`],
            ['💰 Daily Charge',    `PKR ${discharged.room?.dailyCharge?.toLocaleString()}/day`],
            ['💵 Total Charges',   `PKR ${discharged.totalCharges?.toLocaleString()}`],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between">
              <span className="text-gray-500">{k}</span>
              <span className="font-bold text-gray-900">{v}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-black text-lg">
            <span>Total Bill</span>
            <span className="text-indigo-700">PKR {discharged.totalCharges?.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={() => generateDischargePDF(discharged)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-colors">
            📄 Download Discharge PDF
          </button>
          <button onClick={() => router.push('/beds')}
            className="w-full py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl text-sm hover:bg-gray-50 transition-colors">
            🏠 Back to Dashboard
          </button>
          <button onClick={() => router.push('/beds/admissions/new')}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl text-sm transition-colors">
            + New Admission
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">✅ Discharge Patient</h1>
        <p className="text-gray-500 text-sm mt-1">Select patient and process discharge</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Active Admissions */}
        <div>
          <h3 className="font-bold text-gray-900 text-sm mb-3">
            🏥 Active Admissions ({admissions.length})
          </h3>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full" />
            </div>
          ) : admissions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400">
              <p className="text-3xl mb-2">🏥</p>
              <p className="text-sm">No active admissions</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {admissions.map(adm => {
                const days    = calcDays(adm.admissionDate);
                const charges = calcCharges(adm);
                return (
                  <div key={adm._id}
                    onClick={() => { setSelected(adm); setError(''); }}
                    className={`bg-white rounded-2xl border-2 p-4 cursor-pointer hover:shadow-md transition-all ${
                      selected?._id === adm._id
                        ? 'border-indigo-500 bg-indigo-50/30'
                        : 'border-gray-100 hover:border-indigo-200'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                        {adm.patient?.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900">{adm.patient?.name}</p>
                        <p className="text-xs text-gray-500">
                          Room {adm.room?.roomNumber} · {adm.room?.type} · {days} day{days > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-blue-600">Dr. {adm.doctor?.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-indigo-700 text-sm">PKR {charges.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">estimated</p>
                      </div>
                    </div>
                    {selected?._id === adm._id && (
                      <div className="mt-2 pt-2 border-t border-indigo-100">
                        <p className="text-xs text-indigo-600 font-semibold text-center">
                          ✅ Selected — Fill discharge form →
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Discharge Form */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">📋 Discharge Details</h3>

            {/* Patient summary */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {selected.patient?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selected.patient?.name}</p>
                  <p className="text-xs text-indigo-600">Dr. {selected.doctor?.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ['🛏️ Room',       `${selected.room?.roomNumber} (${selected.room?.type})`],
                  ['📅 Admitted',   selected.admissionDate],
                  ['⏱️ Days',       `${calcDays(selected.admissionDate)} days`],
                  ['💰 Rate',       `PKR ${selected.room?.dailyCharge?.toLocaleString()}/day`],
                ].map(([k, v]) => (
                  <div key={k as string} className="bg-white rounded-lg p-2">
                    <p className="text-gray-400">{k}</p>
                    <p className="font-semibold text-gray-900">{v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-indigo-600 rounded-xl p-3 text-center">
                <p className="text-indigo-200 text-xs">Estimated Total Charges</p>
                <p className="text-white font-black text-2xl">
                  PKR {calcCharges(selected).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Discharge Notes / Follow-up Instructions (Optional)
              </label>
              <textarea value={summary} onChange={e => setSummary(e.target.value)}
                rows={4}
                placeholder={`Patient condition at discharge...
Follow-up appointment: 1 week
Medications: Continue current prescriptions
Restrictions: Rest for 3-5 days...`}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button onClick={handleDischarge} disabled={processing}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl text-sm disabled:opacity-50 transition-all">
              {processing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Discharge...
                </span>
              ) : (
                '✅ Confirm Discharge & Generate PDF'
              )}
            </button>

            <button onClick={() => { setSelected(null); setSummary(''); setError(''); }}
              className="w-full mt-2 py-2.5 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <div className="hidden lg:flex bg-white rounded-2xl border-2 border-dashed border-gray-200 items-center justify-center p-8 text-center text-gray-400">
            <div>
              <p className="text-4xl mb-3">👈</p>
              <p className="font-semibold text-gray-500">Select a patient to discharge</p>
              <p className="text-xs mt-1">Click any admission from the list</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DischargePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    }>
      <DischargeContent />
    </Suspense>
  );
}