import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Appointment from '@/models/Appointment';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query: any = {};
    if (user.role === 'patient') query.patient = user.id;
    if (user.role === 'doctor')  query.doctor  = user.id;
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone bloodGroup')
      .populate('doctor',  'name email specialization fee')
      .sort({ createdAt: -1 });

    return NextResponse.json({ appointments });
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

    const doctor = await User.findById(body.doctorId);
    const appointment = await Appointment.create({
      patient:  user.id,
      doctor:   body.doctorId,
      date:     body.date,
      time:     body.time,
      type:     body.type,
      symptoms: body.symptoms,
      fee:      doctor?.fee || 0,
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}