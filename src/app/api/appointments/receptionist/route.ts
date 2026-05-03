import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Appointment from '@/models/Appointment';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user || !['receptionist','admin'].includes(user.role))
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { patientId, doctorId, date, time, type, symptoms } = await req.json();

    const doctor = await User.findById(doctorId);

    const appointment = await Appointment.create({
      patient:  patientId,
      doctor:   doctorId,
      date, time, type, symptoms,
      fee:      doctor?.fee || 0,
      status:   'confirmed', // receptionist books = auto confirmed
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}