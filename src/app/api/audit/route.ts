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
    const { searchParams } = new URL(req.url);
    const module  = searchParams.get('module') || '';
    const status  = searchParams.get('status') || '';
    const search  = searchParams.get('search') || '';
    const limit   = Number(searchParams.get('limit') || '100');
    const page    = Number(searchParams.get('page')  || '1');

    const query: any = {};
    if (module) query.module = module;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { action:   { $regex: search, $options: 'i' } },
        { details:  { $regex: search, $options: 'i' } },
        { ipAddress:{ $regex: search, $options: 'i' } },
      ];
    }

    const total = await AuditLog.countDocuments(query);
    const logs  = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Stats
    const allLogs      = await AuditLog.find().lean();
    const totalLogs    = allLogs.length;
    const failedLogins = allLogs.filter(l => l.action === 'LOGIN_FAILED').length;
    const todayLogins  = allLogs.filter(l => {
      const today = new Date();
      const logDate = new Date(l.createdAt as Date);
      return logDate.toDateString() === today.toDateString() && l.action === 'LOGIN';
    }).length;

    // Unique IPs
    const uniqueIPs = new Set(allLogs.map(l => l.ipAddress).filter(Boolean)).size;

    // Module breakdown
    const moduleStats: Record<string, number> = {};
    allLogs.forEach(l => {
      moduleStats[l.module] = (moduleStats[l.module] || 0) + 1;
    });

    // Recent failed attempts
    const recentFailed = allLogs
      .filter(l => l.status === 'failed')
      .slice(0, 5);

    return NextResponse.json({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats: {
        totalLogs,
        failedLogins,
        todayLogins,
        uniqueIPs,
        moduleStats,
        recentFailed,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// Clear old logs
export async function DELETE(req: NextRequest) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || decoded.role !== 'superadmin')
      return NextResponse.json({ message: 'Super Admin only' }, { status: 403 });

    await connectDB();
    const days    = 30;
    const cutoff  = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });
    return NextResponse.json({ message: `Deleted ${result.deletedCount} old logs` });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}