import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import NotificationLog from '@/models/NotificationLog';

export async function GET(req: NextRequest) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || !['admin','superadmin'].includes(decoded.role))
      return NextResponse.json({ message: 'Admin only' }, { status: 403 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get('channel') || '';
    const status  = searchParams.get('status')  || '';

    const query: any = {};
    if (channel) query.channel = channel;
    if (status)  query.status  = status;

    const logs = await NotificationLog.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const all      = await NotificationLog.find().lean();
    const total    = all.length;
    const sent     = all.filter(l => l.status === 'sent').length;
    const failed   = all.filter(l => l.status === 'failed').length;
    const whatsapp = all.filter(l => l.channel === 'whatsapp').length;
    const sms      = all.filter(l => l.channel === 'sms').length;

    return NextResponse.json({
      logs,
      stats: { total, sent, failed, whatsapp, sms },
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}