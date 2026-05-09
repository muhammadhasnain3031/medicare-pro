'use client';

import { useState, useEffect } from 'react';
import { NotificationTemplates } from '@/lib/notification-templates';

const TEMPLATES = [
  { label: 'Appointment Confirmed', key: 'appointmentConfirmed' },
  { label: 'Appointment Reminder', key: 'appointmentReminder' },
  { label: 'Appointment Cancelled', key: 'appointmentCancelled' },
  { label: 'Lab Report Ready', key: 'labReportReady' },
  { label: 'Bill Generated', key: 'billGenerated' },
  { label: 'Payment Received', key: 'paymentReceived' },
  { label: 'Prescription Ready', key: 'prescriptionReady' },
  { label: 'Due Bill Reminder', key: 'dueBillReminder' },
  { label: 'Welcome Patient', key: 'welcomePatient' },
  { label: 'Pharmacy Bill Ready', key: 'pharmacyBillReady' },
  { label: 'Custom Message', key: 'custom' },
];

export default function SendNotification() {
  const [form, setForm] = useState({
    phone: '',
    recipientName: '',
    doctorName: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00',
    channel: 'whatsapp' as 'whatsapp' | 'sms',
    template: 'appointmentConfirmed',
    message: '',
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Template Generator Function
  const generateMessage = (templateKey: string) => {
    const pName = form.recipientName || 'Patient Name';
    const dName = form.doctorName || 'Doctor Name';
    const aDate = form.appointmentDate;
    const aTime = form.appointmentTime;

    const map: Record<string, () => string> = {
      appointmentConfirmed: () =>
        NotificationTemplates.appointmentConfirmed(
          pName,
          dName,
          aDate,
          aTime
        ),

      appointmentReminder: () =>
        NotificationTemplates.appointmentReminder(
          pName,
          dName,
          aDate,
          aTime
        ),

      appointmentCancelled: () =>
        NotificationTemplates.appointmentCancelled(
          pName,
          dName,
          aDate
        ),

      labReportReady: () =>
        NotificationTemplates.labReportReady(
          pName,
          'CBC Blood Test'
        ),

      billGenerated: () =>
        NotificationTemplates.billGenerated(
          pName,
          'INV-2026-0001',
          5000,
          '2026-05-20'
        ),

      paymentReceived: () =>
        NotificationTemplates.paymentReceived(
          pName,
          '5000',
          'JazzCash',
          'INV-2026-0001'
        ),

      prescriptionReady: () =>
        NotificationTemplates.prescriptionReady(
          pName,
          dName
        ),

      dueBillReminder: () =>
        NotificationTemplates.dueBillReminder(
          pName,
          'INV-2026-0001',
          2500,
          '2026-05-15'
        ),

      welcomePatient: () =>
        NotificationTemplates.welcomePatient(
          pName
        ),

      pharmacyBillReady: () =>
        NotificationTemplates.pharmacyBillReady(
          pName,
          'PHR-001',
          1500
        ),

      custom: () => '',
    };

    return map[templateKey]?.() || '';
  };

  // ✅ Auto Generate Message
  useEffect(() => {
    if (form.template === 'custom') return;

    const generated = generateMessage(form.template);

    setForm(prev => ({
      ...prev,
      message: generated,
    }));
  }, [
    form.recipientName,
    form.doctorName,
    form.appointmentDate,
    form.appointmentTime,
    form.template,
  ]);

  // ✅ Handle Template Change
  const handleTemplateChange = (key: string) => {
    const generated = generateMessage(key);

    setForm(prev => ({
      ...prev,
      template: key,
      message: generated,
    }));
  };

  // ✅ Send Notification
  const handleSend = async () => {
    if (!form.phone || !form.message) return;

    setLoading(true);

    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: form.phone,
          recipientName: form.recipientName,
          channel: form.channel,
          type: form.template,
          customMessage: form.message,
        }),
      });

      const data = await res.json();

      setResult(data);
    } catch (err) {
      console.error(err);

      setResult({
        success: false,
        message: 'Network error occurred',
      });
    }

    setLoading(false);
  };

  const inp =
    'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all';

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          📤 Send Notification
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          Send personalized Hospital Management alerts
        </p>
      </div>

      {result && (
        <div
          className={`rounded-2xl border p-4 mb-5 ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <p
            className={`font-bold text-sm ${
              result.success
                ? 'text-green-700'
                : 'text-red-700'
            }`}
          >
            {result.success ? '✅ Success!' : '❌ Error'}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {result.message}
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">

        {/* Channel */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() =>
              setForm(prev => ({
                ...prev,
                channel: 'whatsapp',
              }))
            }
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
              form.channel === 'whatsapp'
                ? 'bg-green-600 text-white border-transparent'
                : 'bg-white text-gray-600 border-gray-100'
            }`}
          >
            💬 WhatsApp
          </button>

          <button
            onClick={() =>
              setForm(prev => ({
                ...prev,
                channel: 'sms',
              }))
            }
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
              form.channel === 'sms'
                ? 'bg-blue-600 text-white border-transparent'
                : 'bg-white text-gray-600 border-gray-100'
            }`}
          >
            📱 SMS
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={form.recipientName}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                recipientName: e.target.value,
              }))
            }
            placeholder="Patient Name"
            className={inp}
          />

          <input
            value={form.phone}
            onChange={e =>
              setForm(prev => ({
                ...prev,
                phone: e.target.value,
              }))
            }
            placeholder="0300XXXXXXX"
            className={inp}
          />
        </div>

        {/* Template */}
        <select
          value={form.template}
          onChange={e => handleTemplateChange(e.target.value)}
          className={inp}
        >
          {TEMPLATES.map(t => (
            <option key={t.key} value={t.key}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Message */}
        <textarea
          value={form.message}
          onChange={e =>
            setForm(prev => ({
              ...prev,
              message: e.target.value,
            }))
          }
          rows={6}
          className={`${inp} resize-none`}
        />

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={loading || !form.phone || !form.message}
          className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm disabled:opacity-50"
        >
          {loading
            ? 'Processing...'
            : `Send ${
                form.channel === 'whatsapp'
                  ? 'WhatsApp 💬'
                  : 'SMS 📱'
              }`}
        </button>
      </div>
    </div>
  );
}