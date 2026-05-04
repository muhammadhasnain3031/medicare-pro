import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Appointment from '@/models/Appointment';

const ALL_SLOTS = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM',
  '11:00 AM','11:30 AM','12:00 PM','02:00 PM',
  '02:30 PM','03:00 PM','03:30 PM','04:00 PM',
  '04:30 PM','05:00 PM',
];

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const date     = searchParams.get('date');

    if (!doctorId || !date)
      return NextResponse.json({ message: 'doctorId and date required' }, { status: 400 });

    // Booked slots
    const booked = await Appointment.find({
      doctor: doctorId,
      date,
      status: { $in: ['pending','confirmed'] },
    }).select('time');

    const bookedTimes = booked.map(a => a.time);
    const available   = ALL_SLOTS.filter(s => !bookedTimes.includes(s));

    // AI-suggested best slots (morning preferred)
    const suggested = available.filter(s =>
      s.includes('AM') || s === '02:00 PM' || s === '02:30 PM'
    ).slice(0, 4);

    return NextResponse.json({
      date,
      allSlots:    ALL_SLOTS,
      booked:      bookedTimes,
      available,
      suggested,
      totalBooked: bookedTimes.length,
      totalFree:   available.length,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}