import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';
import Appointment from '@/models/Appointment';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user || user.role !== 'admin')
      return NextResponse.json({ message: 'Admin only' }, { status: 403 });

    await connectDB();

    const today = new Date().toISOString().split('T')[0];

    const [
      totalPatients, totalDoctors,
      totalAppointments, pendingAppointments,
      todayAppointments, completedAppointments,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ date: today }),
      Appointment.countDocuments({ status: 'completed' }),
    ]);

    const revenueData = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$fee' } } },
    ]);
    const revenue = revenueData[0]?.total || 0;

    // Last 7 days appointments
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count   = await Appointment.countDocuments({ date: dateStr });
      last7Days.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        appointments: count,
      });
    }

    return NextResponse.json({
      totalPatients, totalDoctors,
      totalAppointments, pendingAppointments,
      todayAppointments, completedAppointments,
      revenue, last7Days,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}