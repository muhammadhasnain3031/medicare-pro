import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// ✅ Interface for Next.js 15+ async params
interface RouteContext {
  params: Promise<{ id: string }>;
}

const getRoomModel = async () => (await import('@/models/Room')).default;

export async function GET(
  req: NextRequest,
  context: RouteContext // ✅ Changed from { params }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const Room = await getRoomModel();

    // ✅ Must await params
    const { id } = await context.params;

    const room = await Room.findById(id)
      .populate('currentPatient', 'name phone bloodGroup')
      .lean();

    if (!room) return NextResponse.json({ message: 'Room not found' }, { status: 404 });

    return NextResponse.json({ room });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: RouteContext // ✅ Changed from { params }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const Room = await getRoomModel();

    // ✅ Must await params
    const { id } = await context.params;
    const body = await req.json();

    console.log('Room PUT:', id, body);

    // ✅ Convert numbers
    const updateData: Record<string, any> = {};
    Object.keys(body).forEach(key => {
      if (key === 'dailyCharge' || key === 'capacity') {
        updateData[key] = Number(body[key]);
      } else if (key === 'currentPatient' && body[key] === null) {
        updateData[key] = null;
      } else {
        updateData[key] = body[key];
      }
    });

    const room = await Room.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).populate('currentPatient', 'name phone bloodGroup');

    if (!room)
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });

    return NextResponse.json({ room });
  } catch (err: any) {
    console.error('Room PUT error:', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: RouteContext // ✅ Changed from { params }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user || !['admin','superadmin'].includes(user.role))
      return NextResponse.json({ message: 'Admin only' }, { status: 403 });

    await connectDB();
    const Room = await getRoomModel();

    // ✅ Must await params
    const { id } = await context.params;

    // Check if occupied
    const room = await Room.findById(id);
    if (!room)
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    
    if (room.status === 'occupied')
      return NextResponse.json({ message: 'Cannot delete occupied room' }, { status: 400 });

    await Room.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Room deleted' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}