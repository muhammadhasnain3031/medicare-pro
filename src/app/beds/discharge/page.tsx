'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function DischargePage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const preId        = searchParams.get('id');

  const [admissions, setAdmissions]   = useState<any[]>([]);
  const [selected,   setSelected]     = useState<any>(null);
  const [summary,    setSummary]      = useState('');
  const [loading,    setLoading]      = useState(true);
  const [saving,     setSaving]       = useState(false);
  const [discharged, setDischarged]   = useState<any>(null);

  useEffect(() => {
    fetch('/api/beds/admissions?status=admitted')
      .then(r => r.json())
      .then(d => {
        const list = d.admissions || [];
        setAdmissions(list);
        if (preId) setSelected(list.find((a: any) => a._id === preId) || null);
        setLoading(false);
      });
  }, [preId]);

  const calcDays = (admissionDate: string) => {
    const diff = new Date().getTime() - new Date(admissionDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000*60*60*24)));
  };

  const calcCharges = (adm: any) =>
    calcDays(adm.admissionDate) * (adm.room?.dailyCharge || 0);

  const handleDischarge = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/beds/admissions/${selected._id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'discharge', dischargeSummary: summary }),
    });
    const d = await res.json();
    if (d.admission) {
      setDischarged(d.admission);
      generateDischargePDF(d.admission);
    }
    setSaving(false);
  };

  const generateDischargePDF = (adm: any) => {
    const doc = new jsPDF();
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 220, 38, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(18);
    doc.setFont('helvetica','bold');
    doc.text('MediCare Pro', 14, 16);
    doc.setFontSize(11);
    doc.setFont('helvetica','normal');
    doc.text('DISCHARGE SUMMARY', 14, 26);
    doc.text(`Date: ${adm.dischargeDate}`, 140, 26);

    doc.setTextColor(0,0,0);
    doc.setFontSize(10);
    doc.text(`Patient: ${adm.patient?.name}`, 14, 50);
    doc.text(`Doctor: Dr. ${adm.doctor?.name} (${adm.doctor?.specialization})`, 14, 57);
    doc.text(`Room: ${adm.room?.roomNumber} (${adm.room?.type})`, 14, 64);
    doc.text(`Admission: ${adm.admissionDate}  →  Discharge: ${adm.dischargeDate}`, 14, 71);
    doc.text(`Total Days: ${adm.totalDays}`, 14, 78);

    doc.setFont('helvetica','bold');
    doc.setFontSize(11);
    doc.text('CHARGES:', 14, 92);
    doc.setFont('helvetica','normal');
    doc.setFontSize(10);
    autoTable(doc, {
      startY: 97,
      head:   [['Description','Days','Rate/Day','Total']],
      body:   [
        ['Room Charges', adm.totalDays, `PKR ${adm.room?.dailyCharge}`, `PKR ${adm.totalCharges}`],
      ],
      headStyles: { fillColor: [79,70,229], textColor: 255 },
      styles: { fontSize: 9 },
    });

    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica','bold');
    doc.setFontSize(13);
    doc.text(`Total Amount: PKR ${adm.totalCharges?.toLocaleString()}`, 14, y);

    if (adm.dischargeSummary) {
      doc.setFontSize(10);
      doc.setFont('helvetica','bold');
      doc.text('DISCHARGE NOTES:', 14, y+15);
      doc.setFont('helvetica','normal');
      const lines = doc.splitTextToSize(adm.dischargeSummary, 180);
      doc.text(lines, 14, y+23);
    }

    doc.setFillColor(245,247,255);
    doc.rect(0,278,220,20,'F');
    doc.setFontSize(8);
    doc.setTextColor(100,100,100);
    doc.text('MediCare Pro — Discharge Summary', 14, 287);
    doc.save(`discharge-${adm.patient?.name}.pdf`);
  };

  if (discharged) return (
    <div className="p-6 max-w-md mx-auto text-center">
      <div className="bg-white rounded-2xl border border-green-200 p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Patient Discharged!</h2>
        <p className="text-gray-500 text-sm mb-4">{discharged.patient?.name} — Room {discharged.room?.roomNumber}</p>
        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Total Days</span>
            <span className="font-bold">{discharged.totalDays}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Room Charges</span>
            <span className="font-bold text-indigo-600">PKR {discharged.totalCharges?.toLocaleString()}</span>
          </div>
        </div>
        <div className="space-y-2">
          <button onClick={() => generateDischargePDF(discharged)}
            className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700">
            📄 Download Summary PDF
          </button>
          <button onClick={() => router.push('/beds')}
            className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">✅ Discharge Patient</h1>
        <p className="text-gray-500 text-sm mt-1">Process patient discharge and generate summary</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Admissions List */}
        <div>
          <h3 className="font-bold text-gray-900 text-sm mb-3">Select Patient to Discharge</h3>
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
            <div className="space-y-3">
              {admissions.map(adm => (
                <div key={adm._id}
                  onClick={() => setSelected(adm)}
                  className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                    selected?._id === adm._id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                      {adm.patient?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900">{adm.patient?.name}</p>
                      <p className="text-xs text-gray-500">
                        Room {adm.room?.roomNumber} · {calcDays(adm.admissionDate)} days
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-indigo-600 text-sm">PKR {calcCharges(adm).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">charges</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discharge Form */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Discharge Details</h3>

            <div className="bg-indigo-50 rounded-xl p-3 mb-4 space-y-1">
              <p className="font-bold text-sm text-gray-900">{selected.patient?.name}</p>
              <p className="text-xs text-gray-600">Dr. {selected.doctor?.name}</p>
              <p className="text-xs text-gray-600">Room {selected.room?.roomNumber} · {selected.room?.type}</p>
              <p className="text-xs text-gray-600">Admitted: {selected.admissionDate}</p>
              <div className="pt-2 border-t border-indigo-100 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Days Admitted:</span>
                  <span className="font-bold">{calcDays(selected.admissionDate)} days</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Daily Charge:</span>
                  <span className="font-bold">PKR {selected.room?.dailyCharge?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base mt-2 font-black">
                  <span>Total Charges:</span>
                  <span className="text-indigo-700">PKR {calcCharges(selected).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Discharge Summary / Notes</label>
              <textarea value={summary} onChange={e => setSummary(e.target.value)}
                rows={4} placeholder="Patient condition at discharge, follow-up instructions, medications..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button onClick={handleDischarge} disabled={saving}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-colors">
              {saving ? '⏳ Processing...' : '✅ Confirm Discharge & Generate PDF'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 h-fit">
            <p className="text-3xl mb-2">👆</p>
            <p className="text-sm">Select a patient to discharge</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DischargePageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <DischargePage />
    </Suspense>
  );
}