import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Appointment from '@/models/Appointment';
import { sendNotification } from '@/lib/notifications';
import NotificationLog from '@/models/NotificationLog';

// Params ka type ab Promise hona chahiye
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  req: NextRequest,
  context: RouteContext // Updated context type
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user = verifyToken(token || '');

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'receptionist', 'doctor'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // ✅ CRITICAL FIX: params ko await karein
    const { id } = await context.params;
    const body = await req.json();

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

    // Notification Logic (as it was)
    if (body.status === 'confirmed' && oldAppointment?.status !== 'confirmed') {
      try {
        const patient = appointment.patient as any;
        const doctor = appointment.doctor as any;

        if (patient?.phone) {
          // Note: NotificationTemplates model ya lib se import karna mat bhooliye ga agar error aaye
          const msg = `Hi ${patient.name}, your appointment with Dr. ${doctor?.name} on ${appointment.date} at ${appointment.time} is confirmed.`;

          const result = await sendNotification(patient.phone, msg, 'whatsapp');

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
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: RouteContext // Updated context type
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user = verifyToken(token || '');

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'receptionist'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // ✅ CRITICAL FIX: params ko await karein
    const { id } = await context.params;

    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted' });

  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}