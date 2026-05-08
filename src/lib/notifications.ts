'use server'; // 🔥 Ye line browser errors ko khatam karegi

import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const FROM_SMS = process.env.TWILIO_PHONE_NUMBER!;
const FROM_WHATSAPP = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// Phone number format karne ka function
function formatPakistaniPhone(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('92') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 11) return `+92${digits.slice(1)}`;
  if (digits.length === 10) return `+92${digits}`;
  return digits.startsWith('+') ? phone : null;
}

export async function sendNotification(to: string, message: string, channel: 'whatsapp' | 'sms' = 'whatsapp') {
  try {
    const phone = formatPakistaniPhone(to);
    if (!phone) throw new Error('Invalid phone number format');

    const from = channel === 'whatsapp' ? FROM_WHATSAPP : FROM_SMS;
    const toAddress = channel === 'whatsapp' ? `whatsapp:${phone}` : phone;

    const result = await client.messages.create({
      body: message,
      from: from,
      to: toAddress,
    });

    return { success: true, sid: result.sid };
  } catch (err: any) {
    console.error('Twilio Error:', err.message);
    return { success: false, error: err.message };
  }
}