import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';
import NotificationLog from '@/models/NotificationLog';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || !['admin','superadmin'].includes(decoded.role))
      return NextResponse.json({ message: 'Admin only' }, { status: 403 });

    await connectDB();

    const { role, channel = 'whatsapp', message, type = 'bulk' } = await req.json();
    if (!message) return NextResponse.json({ message: 'Message required' }, { status: 400 });

    // Get all users with the role
    const query: any = {};
    if (role && role !== 'all') query.role = role;
    const users = await User.find(query).select('name phone').lean();

    const usersWithPhone = users.filter(u => u.phone);
    if (usersWithPhone.length === 0)
      return NextResponse.json({ message: 'No users with phone numbers found' }, { status: 400 });

    // Send in parallel (max 10 at a time)
    let sent = 0, failed = 0;
    const chunks: typeof usersWithPhone[] = [];

    for (let i = 0; i < usersWithPhone.length; i += 10)
      chunks.push(usersWithPhone.slice(i, i + 10));

    for (const chunk of chunks) {
      await Promise.all(chunk.map(async user => {
        const result = await sendNotification(user.phone!, message, channel);
        await NotificationLog.create({
          recipient: user.name,
          phone:     user.phone,
          channel,
          type,
          message,
          status:  result.success ? 'sent' : 'failed',
          error:   (result as any).error || '',
          sid:     (result as any).sid   || '',
          sentBy:  decoded.id,
        });
        if (result.success) sent++;
        else                failed++;
      }));
    }

    return NextResponse.json({
      success: true,
      sent, failed, total: usersWithPhone.length,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}