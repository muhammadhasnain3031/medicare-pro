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
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const doctors = await User.find({ role: 'doctor', available: true }).select('name specialization fee');

    const availability = await Promise.all(doctors.map(async (doc) => {
      const bookings = await Appointment.countDocuments({
        doctor: doc._id,
        date,
        status: { $in: ['pending','confirmed'] },
      });

      const maxSlots   = 14;
      const freeSlots  = Math.max(0, maxSlots - bookings);
      const busyPercent = Math.round((bookings / maxSlots) * 100);

      return {
        doctor:       { id: doc._id, name: doc.name, specialization: doc.specialization, fee: doc.fee },
        date,
        totalSlots:   maxSlots,
        booked:       bookings,
        available:    freeSlots,
        busyPercent,
        status:       busyPercent >= 90 ? 'almost_full' : busyPercent >= 50 ? 'busy' : 'available',
      };
    }));

    return NextResponse.json({ availability, date });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}