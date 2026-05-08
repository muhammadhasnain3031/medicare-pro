import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';
import Appointment from '@/models/Appointment';
import Prescription from '@/models/Prescription';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // Basic counts
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      completedApts,
      pendingApts,
      cancelledApts,
      totalPrescriptions,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Prescription.countDocuments(),
    ]);

    // Revenue from completed appointments
    const revenueData = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$fee' } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Last 7 days appointments
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.setHours(0,0,0,0));
      const end   = new Date(d.setHours(23,59,59,999));
      const count = await Appointment.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });
      const rev = await Appointment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$fee' } } },
      ]);
      last7Days.push({
        date:         start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        appointments: count,
        revenue:      rev[0]?.total || 0,
      });
    }

    // Last 6 months revenue
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const rev = await Appointment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$fee' } } },
      ]);
      const count = await Appointment.countDocuments({
        createdAt: { $gte: start, $lte: end }
      });
      last6Months.push({
        month:   start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: rev[0]?.total || 0,
        appointments: count,
      });
    }

    // Appointment type distribution
    const typeData = await Appointment.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Top doctors by appointments
    const topDoctors = await Appointment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$doctor', count: { $sum: 1 }, revenue: { $sum: '$fee' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'doctorInfo' } },
      { $unwind: '$doctorInfo' },
      { $project: {
        name:           '$doctorInfo.name',
        specialization: '$doctorInfo.specialization',
        appointments:   '$count',
        revenue:        1,
      }},
    ]);

    // New patients per month (last 6)
    const newPatients = [];
    for (let i = 5; i >= 0; i--) {
      const d     = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const count = await User.countDocuments({
        role:      'patient',
        createdAt: { $gte: start, $lte: end },
      });
      newPatients.push({
        month: start.toLocaleDateString('en-US', { month: 'short' }),
        count,
      });
    }

    // Today stats
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd   = new Date(); todayEnd.setHours(23,59,59,999);
    const [todayApts, todayRevData] = await Promise.all([
      Appointment.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Appointment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: todayStart, $lte: todayEnd } } },
        { $group: { _id: null, total: { $sum: '$fee' } } },
      ]),
    ]);
    const todayRevenue = todayRevData[0]?.total || 0;

    return NextResponse.json({
      overview: {
        totalPatients, totalDoctors,
        totalAppointments, completedApts,
        pendingApts, cancelledApts,
        totalPrescriptions, totalRevenue,
        todayApts, todayRevenue,
        completionRate: totalAppointments > 0
          ? Math.round((completedApts / totalAppointments) * 100) : 0,
      },
      last7Days,
      last6Months,
      typeData:   typeData.map(t => ({ type: t._id || 'other', count: t.count })),
      topDoctors,
      newPatients,
    });
  } catch (err: any) {
    console.error('Analytics error:', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}