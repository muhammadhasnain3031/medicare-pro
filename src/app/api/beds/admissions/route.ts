import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Admission from '@/models/Admission';
import Room from '@/models/Room';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status) query.status = status;

    const admissions = await Admission.find(query)
      .populate('patient', 'name phone bloodGroup dateOfBirth')
      .populate('doctor',  'name specialization')
      .populate('room',    'roomNumber type ward floor dailyCharge')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ admissions });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();

    // Check room availability
    const room = await Room.findById(body.roomId);
    if (!room) return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    if (room.status === 'occupied')
      return NextResponse.json({ message: 'Room is already occupied' }, { status: 400 });

    // Create admission
    const admission = await Admission.create({
      patient:       body.patientId,
      doctor:        body.doctorId,
      room:          body.roomId,
      admissionDate: body.admissionDate || new Date().toISOString().split('T')[0],
      diagnosis:     body.diagnosis,
      admissionType: body.admissionType || 'planned',
      notes:         body.notes || '',
    });

    // Update room status
    await Room.findByIdAndUpdate(body.roomId, {
      status:         'occupied',
      currentPatient: body.patientId,
    });

    const populated = await Admission.findById(admission._id)
      .populate('patient', 'name phone bloodGroup')
      .populate('doctor',  'name specialization')
      .populate('room',    'roomNumber type ward dailyCharge')
      .lean();

    return NextResponse.json({ admission: populated }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}