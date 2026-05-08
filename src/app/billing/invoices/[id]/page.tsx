'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PaymentModal from '@/components/PaymentModal';

const CAT_ICONS: Record<string, string> = {
  consultation:'👨‍⚕️', medicine:'💊', lab:'🧪', bed:'🛏️', procedure:'⚕️', other:'📌',
};

const STATUS_STYLES: Record<string, string> = {
  paid:      'bg-green-100 text-green-700 border-green-200',
  partial:   'bg-blue-100 text-blue-700 border-blue-200',
  overdue:   'bg-red-100 text-red-700 border-red-200',
  sent:      'bg-yellow-100 text-yellow-700 border-yellow-200',
  draft:     'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-gray-100 text-gray-400 border-gray-200',
};

export default function InvoiceDetail() {
  const params  = useParams();
  const router  = useRouter();
  const [invoice, setInvoice]     = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [payModal, setPayModal]   = useState(false);
  const [partialAmt, setPartialAmt] = useState(0);

  useEffect(() => {
    fetch(`/api/billing/invoices/${params.id}`)
      .then(r => r.json())
      .then(d => { setInvoice(d.invoice); setLoading(false); });
  }, [params.id]);

  const handlePartialPayment = async (method: string) => {
    const amount = partialAmt || invoice.dueAmount;
    const res = await fetch(`/api/billing/invoices/${params.id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        addPayment: { amount, method, reference: '' }
      }),
    });
    const d = await res.json();
    if (d.invoice) setInvoice(d.invoice);
    setPayModal(false);
  };

  const downloadPDF = () => {
    if (!invoice) return;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 220, 40, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(20);
    doc.setFont('helvetica','bold');
    doc.text('MediCare Pro', 14, 16);
    doc.setFontSize(11);
    doc.setFont('helvetica','normal');
    doc.text('Hospital Management System', 14, 24);
    doc.setFontSize(10);
    doc.text(`INVOICE: ${invoice.invoiceNumber}`, 130, 16);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 130, 23);
    doc.text(`Due: ${invoice.dueDate || 'N/A'}`, 130, 30);

    // Status badge
    const statusColors: Record<string, number[]> = {
      paid: [22,163,74], partial: [37,99,235], overdue: [220,38,38], sent: [217,119,6],
    };
    const sc = statusColors[invoice.status] || [107,114,128];
    doc.setFillColor(sc[0], sc[1], sc[2]);
    doc.roundedRect(155, 33, 40, 8, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica','bold');
    doc.text(invoice.status.toUpperCase(), 158, 38.5);

    // Patient Info
    doc.setTextColor(0,0,0);
    doc.setFontSize(10);
    doc.setFont('helvetica','bold');
    doc.text('Bill To:', 14, 52);
    doc.setFont('helvetica','normal');
    doc.text(invoice.patient?.name || '', 14, 59);
    doc.text(invoice.patient?.phone || '', 14, 66);
    doc.text(invoice.patient?.email || '', 14, 73);

    if (invoice.doctor) {
      doc.setFont('helvetica','bold');
      doc.text('Doctor:', 130, 52);
      doc.setFont('helvetica','normal');
      doc.text(`Dr. ${invoice.doctor?.name}`, 130, 59);
      doc.text(invoice.doctor?.specialization || '', 130, 66);
    }

    // Insurance
    if (invoice.insuranceCompany) {
      doc.setFont('helvetica','bold');
      doc.text('Insurance:', 14, 82);
      doc.setFont('helvetica','normal');
      doc.text(`${invoice.insuranceCompany} — Claim: ${invoice.insuranceClaim || 'N/A'}`, 14, 89);
    }

    // Items Table
    autoTable(doc, {
      startY: invoice.insuranceCompany ? 95 : 82,
      head:   [['#','Description','Category','Qty','Unit Price','Total']],
      body:   invoice.items.map((item: any, i: number) => [
        i+1, item.description, item.category, item.quantity,
        `PKR ${item.unitPrice.toLocaleString()}`,
        `PKR ${item.total.toLocaleString()}`,
      ]),
      headStyles:  { fillColor: [37,99,235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248,250,255] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 5: { fontStyle: 'bold' } },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;

    // Summary
    doc.setFontSize(10);
    const summaryX = 130;
    let sy = finalY;
    doc.text(`Subtotal:`, summaryX, sy);
    doc.text(`PKR ${invoice.subtotal?.toLocaleString()}`, 185, sy, { align: 'right' });

    if (invoice.discount > 0) {
      sy += 7;
      doc.setTextColor(22,163,74);
      doc.text(`Discount:`, summaryX, sy);
      doc.text(`-PKR ${invoice.discount?.toLocaleString()}`, 185, sy, { align: 'right' });
      doc.setTextColor(0,0,0);
    }
    if (invoice.tax > 0) {
      sy += 7;
      doc.text(`Tax:`, summaryX, sy);
      doc.text(`+PKR ${invoice.tax?.toLocaleString()}`, 185, sy, { align: 'right' });
    }
    if (invoice.insuranceAmount > 0) {
      sy += 7;
      doc.setTextColor(37,99,235);
      doc.text(`Insurance:`, summaryX, sy);
      doc.text(`-PKR ${invoice.insuranceAmount?.toLocaleString()}`, 185, sy, { align: 'right' });
      doc.setTextColor(0,0,0);
    }

    sy += 8;
    doc.setFillColor(37,99,235);
    doc.rect(summaryX-2, sy-5, 70, 12, 'F');
    doc.setTextColor(255,255,255);
    doc.setFont('helvetica','bold');
    doc.setFontSize(11);
    doc.text(`TOTAL: PKR ${invoice.totalAmount?.toLocaleString()}`, summaryX, sy+3);
    doc.setTextColor(0,0,0);

    sy += 16;
    doc.setFontSize(10);
    doc.setFont('helvetica','normal');
    doc.setTextColor(22,163,74);
    doc.text(`Paid: PKR ${invoice.paidAmount?.toLocaleString()}`, summaryX, sy);
    if (invoice.dueAmount > 0) {
      doc.setTextColor(220,38,38);
      doc.text(`Due: PKR ${invoice.dueAmount?.toLocaleString()}`, summaryX+40, sy);
    }

    // Payment history
    if (invoice.payments?.length > 0) {
      doc.setTextColor(0,0,0);
      sy += 12;
      doc.setFont('helvetica','bold');
      doc.setFontSize(10);
      doc.text('Payment History:', 14, sy);
      doc.setFont('helvetica','normal');
      doc.setFontSize(9);
      invoice.payments.forEach((p: any, i: number) => {
        sy += 7;
        doc.text(`${i+1}. ${p.date} — PKR ${p.amount?.toLocaleString()} via ${p.method} ${p.reference ? `(Ref: ${p.reference})` : ''}`, 14, sy);
      });
    }

    // Notes
    if (invoice.notes) {
      sy += 12;
      doc.setFont('helvetica','bold');
      doc.setFontSize(10);
      doc.text('Notes:', 14, sy);
      doc.setFont('helvetica','normal');
      sy += 7;
      doc.text(invoice.notes, 14, sy);
    }

    // Footer
    doc.setFillColor(248,250,255);
    doc.rect(0, 278, 220, 20, 'F');
    doc.setFontSize(8);
    doc.setTextColor(107,114,128);
    doc.text('MediCare Pro — Your Health, Our Priority', 14, 287);
    doc.text('This is a computer-generated invoice', 14, 293);
    doc.text(`Invoice: ${invoice.invoiceNumber}`, 160, 287);

    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!invoice) return (
    <div className="p-6 text-center text-gray-400">
      <p className="text-3xl mb-2">❌</p>
      <p>Invoice not found</p>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">

      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-1 text-blue-600 text-sm font-medium mb-4 hover:underline">
        ← Back
      </button>

      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-blue-200 text-xs mb-1">INVOICE</p>
            <p className="text-2xl font-black">{invoice.invoiceNumber}</p>
            <p className="text-blue-100 text-sm mt-1">
              {invoice.patient?.name} · {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${STATUS_STYLES[invoice.status]}`}>
              {invoice.status?.toUpperCase()}
            </span>
            <p className="text-3xl font-black">PKR {invoice.totalAmount?.toLocaleString()}</p>
            {invoice.dueAmount > 0 && (
              <p className="text-red-200 text-sm font-semibold">
                Due: PKR {invoice.dueAmount?.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — Details */}
        <div className="lg:col-span-2 space-y-4">

          {/* Patient + Doctor */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Patient</p>
                <p className="font-bold text-gray-900">{invoice.patient?.name}</p>
                <p className="text-sm text-gray-500">{invoice.patient?.phone}</p>
                <p className="text-sm text-gray-500">{invoice.patient?.email}</p>
              </div>
              {invoice.doctor && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Doctor</p>
                  <p className="font-bold text-gray-900">Dr. {invoice.doctor?.name}</p>
                  <p className="text-sm text-blue-600">{invoice.doctor?.specialization}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm">📋 Invoice Items</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {invoice.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <span className="text-base flex-shrink-0">{CAT_ICONS[item.category]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-400 capitalize">{item.category} · {item.quantity} × PKR {item.unitPrice?.toLocaleString()}</p>
                  </div>
                  <p className="font-bold text-blue-700 text-sm flex-shrink-0">PKR {item.total?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insurance */}
          {invoice.insuranceCompany && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <h3 className="font-bold text-blue-800 text-sm mb-2">🏥 Insurance Details</h3>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-blue-600 mb-1">Company</p>
                  <p className="font-semibold text-gray-900">{invoice.insuranceCompany}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Claim #</p>
                  <p className="font-semibold text-gray-900">{invoice.insuranceClaim || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Covered Amount</p>
                  <p className="font-bold text-green-600">PKR {invoice.insuranceAmount?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment History */}
          {invoice.payments?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-3 border-b border-gray-100 bg-green-50">
                <h3 className="font-bold text-green-800 text-sm">💳 Payment History</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {invoice.payments.map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center text-green-600 font-bold text-xs flex-shrink-0">
                      {i+1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{p.method}</p>
                      <p className="text-xs text-gray-400">{p.date} {p.reference && `· Ref: ${p.reference}`}</p>
                    </div>
                    <p className="font-bold text-green-600 text-sm flex-shrink-0">
                      PKR {p.amount?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Summary + Actions */}
       <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">

          {/* Financial Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3">💰 Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">PKR {invoice.subtotal?.toLocaleString()}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">-PKR {invoice.discount?.toLocaleString()}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Tax</span>
                  <span className="font-semibold">+PKR {invoice.tax?.toLocaleString()}</span>
                </div>
              )}
              {invoice.insuranceAmount > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Insurance</span>
                  <span className="font-semibold">-PKR {invoice.insuranceAmount?.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2">
                <div className="flex justify-between font-black text-base">
                  <span>Total</span>
                  <span className="text-blue-700">PKR {invoice.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Paid</span>
                <span>PKR {invoice.paidAmount?.toLocaleString()}</span>
              </div>
              {invoice.dueAmount > 0 && (
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Due Balance</span>
                  <span>PKR {invoice.dueAmount?.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
            <button onClick={downloadPDF}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors">
              📄 Download PDF Invoice
            </button>

            {invoice.dueAmount > 0 && invoice.status !== 'cancelled' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Partial Payment Amount
                  </label>
                  <input
                    type="number"
                    value={partialAmt || ''}
                    onChange={e => setPartialAmt(Number(e.target.value))}
                    placeholder={`Max: PKR ${invoice.dueAmount?.toLocaleString()}`}
                    max={invoice.dueAmount}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button onClick={() => setPayModal(true)}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-colors">
                  💳 Collect Payment
                </button>
              </>
            )}

            {invoice.status === 'paid' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-2xl mb-1">✅</p>
                <p className="font-bold text-green-700 text-sm">Fully Paid</p>
              </div>
            )}
          </div>

          {invoice.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-yellow-700 mb-1">📝 Notes</p>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>

      {payModal && (
        <PaymentModal
          amount={partialAmt || invoice.dueAmount}
          title={`Invoice ${invoice.invoiceNumber}`}
          onPay={handlePartialPayment}
          onClose={() => setPayModal(false)}
        />
      )}
    </div>
  );
}