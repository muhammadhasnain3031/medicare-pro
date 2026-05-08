import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Room from '@/models/Room';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type   = searchParams.get('type');

    const query: any = {};
    if (status) query.status = status;
    if (type)   query.type   = type;

    const rooms = await Room.find(query)
      .populate('currentPatient', 'name phone bloodGroup')
      .sort({ roomNumber: 1 })
      .lean();

    const all          = await Room.find().lean();
    const available    = all.filter(r => r.status === 'available').length;
    const occupied     = all.filter(r => r.status === 'occupied').length;
    const maintenance  = all.filter(r => r.status === 'maintenance').length;
    const occupancyRate= all.length > 0 ? Math.round((occupied / all.length) * 100) : 0;

    return NextResponse.json({
      rooms,
      stats: {
        total: all.length,
        available,
        occupied,
        maintenance,
        occupancyRate,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user || !['admin','superadmin'].includes(user.role))
      return NextResponse.json({ message: 'Admin only' }, { status: 403 });

    await connectDB();
    const body = await req.json();
    const room = await Room.create(body);
    return NextResponse.json({ room }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}