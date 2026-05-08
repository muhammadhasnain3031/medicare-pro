import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import AuditLog from '@/models/AuditLog';

export async function GET(req: NextRequest) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || !['admin','superadmin'].includes(decoded.role))
      return NextResponse.json({ message: 'Admin only' }, { status: 403 });

    await connectDB();

    // Recent logins per user
    const recentLogins = await AuditLog.aggregate([
      { $match: { action: 'LOGIN', status: 'success' } },
      { $sort:  { createdAt: -1 } },
      { $group: {
        _id:       '$userName',
        userRole:  { $first: '$userRole' },
        lastLogin: { $first: '$createdAt' },
        ipAddress: { $first: '$ipAddress' },
        userAgent: { $first: '$userAgent' },
        loginCount:{ $sum: 1 },
      }},
      { $sort: { lastLogin: -1 } },
      { $limit: 20 },
    ]);

    // Failed login attempts by IP
    const failedByIP = await AuditLog.aggregate([
      { $match: { action: 'LOGIN_FAILED' } },
      { $group: {
        _id:      '$ipAddress',
        attempts: { $sum: 1 },
        lastAttempt: { $max: '$createdAt' },
      }},
      { $sort:  { attempts: -1 } },
      { $limit: 10 },
    ]);

    // Today's activity timeline
    const today      = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs  = await AuditLog.find({ createdAt: { $gte: today } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ recentLogins, failedByIP, todayLogs });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}