import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
// 🔥 Sirf sendNotification import karein, NotificationTemplates ko yahan se hata dein
import { sendNotification } from '@/lib/notifications'; 
import NotificationLog from '@/models/NotificationLog';

export async function POST(req: NextRequest) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const {
      phone, channel = 'whatsapp', type, message,
      recipientName, customMessage,
    } = await req.json();

    if (!phone) return NextResponse.json({ message: 'Phone required' }, { status: 400 });

    // ✅ Logic: Final message select karein
    const finalMessage = customMessage || message;
    if (!finalMessage) return NextResponse.json({ message: 'Message required' }, { status: 400 });

    // ✅ Send notification (Ye ab Server par chalay ga)
    const result: any = await sendNotification(phone, finalMessage, channel);

    // ✅ Log recording in Database
    await NotificationLog.create({
      recipient: recipientName || '',
      phone,
      channel,
      type:      type || 'custom',
      message:   finalMessage,
      status:    result.success ? 'sent' : 'failed',
      error:     result.error || '',
      sid:       result.sid   || '',
      sentBy:    decoded.id,
    });

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Notification sent!' });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.error || 'Failed to send notification via Twilio' 
      }, { status: 500 });
    }
    
  } catch (err: any) {
    console.error("ROUTE ERROR:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}