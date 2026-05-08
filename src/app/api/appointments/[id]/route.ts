import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Appointment from '@/models/Appointment';

import { sendNotification, NotificationTemplates } from '@/lib/notifications';
import NotificationLog from '@/models/NotificationLog';

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user = verifyToken(token || '');

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Role सुरक्षा
    if (!['admin', 'receptionist', 'doctor'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { id } = context.params;
    const body = await req.json();

    // ✅ Pehle old appointment le lo (status compare ke liye)
    const oldAppointment = await Appointment.findById(id);

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('patient', 'name email phone bloodGroup')
      .populate('doctor', 'name email specialization fee');

    if (!appointment) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    // ✅ Notification logic (sirf jab status change ho)
    if (
      body.status === 'confirmed' &&
      oldAppointment?.status !== 'confirmed'
    ) {
      try {
        const patient = appointment.patient as any;
        const doctor = appointment.doctor as any;

        if (patient?.phone) {
          const msg = NotificationTemplates.appointmentConfirmed(
            patient.name,
            doctor?.name,
            appointment.date,
            appointment.time
          );

          const result = await sendNotification(
            patient.phone,
            msg,
            'whatsapp'
          );

          await NotificationLog.create({
            recipient: patient.name,
            phone: patient.phone,
            channel: 'whatsapp',
            type: 'appointment_confirmed',
            message: msg,
            status: result.success ? 'sent' : 'failed',
          });
        }
      } catch (e) {
        console.error('Notification failed:', e);
      }
    }

    return NextResponse.json({ appointment });

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user = verifyToken(token || '');

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Role check
    if (!['admin', 'receptionist'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { id } = context.params;

    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted' });

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}