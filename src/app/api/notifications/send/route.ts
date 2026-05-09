import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';
import { NotificationTemplates } from '@/lib/notification-templates';
import NotificationLog from '@/models/NotificationLog';

export async function POST(req: NextRequest) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded)
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const {
      phone,
      channel = 'whatsapp',
      type,
      recipientName,
      customMessage,
    } = await req.json();

    if (!phone)
      return NextResponse.json({ message: 'Phone required' }, { status: 400 });

    const finalMessage = customMessage;
    if (!finalMessage)
      return NextResponse.json({ message: 'Message required' }, { status: 400 });

    const result = await sendNotification(phone, finalMessage, channel);

    await NotificationLog.create({
      recipient: recipientName || '',
      phone,
      channel,
      type:      type || 'custom',
      message:   finalMessage,
      status:    result.success ? 'sent' : 'failed',
      error:     (result as any).error || '',
      sid:       (result as any).sid   || '',
      sentBy:    decoded.id,
    });

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Notification sent!' : 'Failed to send',
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}