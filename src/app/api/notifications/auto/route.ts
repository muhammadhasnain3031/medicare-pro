import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { sendNotification, NotificationTemplates } from '@/lib/notifications';
import NotificationLog from '@/models/NotificationLog';
import Appointment from '@/models/Appointment';
import Invoice from '@/models/Invoice';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || !['admin','superadmin'].includes(decoded.role))
      return NextResponse.json({ message: 'Admin only' }, { status: 403 });

    await connectDB();
    const { type } = await req.json();
    let sent = 0, failed = 0;

    // Tomorrow's appointment reminders
    if (type === 'appointment_reminders') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const appointments = await Appointment.find({
        date:   tomorrowStr,
        status: { $in: ['confirmed','pending'] },
      })
      .populate('patient', 'name phone')
      .populate('doctor',  'name')
      .lean();

      for (const apt of appointments) {
        const patient = apt.patient as any;
        if (!patient?.phone) continue;

        const msg = NotificationTemplates.appointmentReminder(
          patient.name, (apt.doctor as any)?.name, apt.date, apt.time
        );

        const result = await sendNotification(patient.phone, msg, 'whatsapp');
        await NotificationLog.create({
          recipient: patient.name,
          phone:     patient.phone,
          channel:   'whatsapp',
          type:      'appointment_reminder',
          message:   msg,
          status:    result.success ? 'sent' : 'failed',
          error:     (result as any).error || '',
          sentBy:    decoded.id,
        });

        if (result.success) sent++;
        else                failed++;
      }
    }

    // Overdue bill reminders
    if (type === 'bill_reminders') {
      const invoices = await Invoice.find({
        dueAmount: { $gt: 0 },
        status:    { $nin: ['paid','cancelled'] },
      })
      .populate('patient', 'name phone')
      .lean();

      for (const inv of invoices) {
        const patient = inv.patient as any;
        if (!patient?.phone) continue;

        const msg = NotificationTemplates.dueBillReminder(
          patient.name,
          inv.invoiceNumber,
          inv.dueAmount,
          inv.dueDate || 'N/A'
        );

        const result = await sendNotification(patient.phone, msg, 'whatsapp');
        await NotificationLog.create({
          recipient: patient.name,
          phone:     patient.phone,
          channel:   'whatsapp',
          type:      'bill_reminder',
          message:   msg,
          status:    result.success ? 'sent' : 'failed',
          sentBy:    decoded.id,
        });

        if (result.success) sent++;
        else                failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Done: ${sent} sent, ${failed} failed`,
      sent, failed,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}