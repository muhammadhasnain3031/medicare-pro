import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Admission from '@/models/Admission';
import Room from '@/models/Room';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();

    // Discharge patient
    if (body.action === 'discharge') {
      const admission    = await Admission.findById(params.id);
      if (!admission) return NextResponse.json({ message: 'Not found' }, { status: 404 });

      const admitDate    = new Date(admission.admissionDate);
      const dischargeDate= new Date();
      const days         = Math.max(1, Math.ceil((dischargeDate.getTime() - admitDate.getTime()) / (1000*60*60*24)));

      const room         = await Room.findById(admission.room);
      const totalCharges = days * (room?.dailyCharge || 0);

      await Admission.findByIdAndUpdate(params.id, {
        status:          'discharged',
        dischargeDate:   dischargeDate.toISOString().split('T')[0],
        totalDays:       days,
        totalCharges,
        dischargeSummary: body.dischargeSummary || '',
      });

      // Free up room
      await Room.findByIdAndUpdate(admission.room, {
        status:         'available',
        currentPatient: null,
      });

      const updated = await Admission.findById(params.id)
        .populate('patient', 'name phone bloodGroup')
        .populate('doctor',  'name specialization')
        .populate('room',    'roomNumber type ward dailyCharge')
        .lean();

      return NextResponse.json({ admission: updated });
    }

    // Add vitals
    if (body.addVitals) {
      const updated = await Admission.findByIdAndUpdate(
        params.id,
        { $push: { vitalSigns: { ...body.addVitals, recordedAt: new Date().toLocaleString() } } },
        { new: true }
      )
      .populate('patient', 'name phone')
      .populate('room',    'roomNumber type')
      .lean();
      return NextResponse.json({ admission: updated });
    }

    // General update
    const updated = await Admission.findByIdAndUpdate(
      params.id, { $set: body }, { new: true }
    )
    .populate('patient', 'name phone bloodGroup')
    .populate('doctor',  'name specialization')
    .populate('room',    'roomNumber type ward dailyCharge')
    .lean();

    return NextResponse.json({ admission: updated });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}