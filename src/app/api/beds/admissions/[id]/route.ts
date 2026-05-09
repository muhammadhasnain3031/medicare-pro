import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// ✅ Type definition for Next.js 15+ params
interface RouteContext {
  params: Promise<{ id: string }>;
}

const getModels = async () => {
  const Admission = (await import('@/models/Admission')).default;
  const Room      = (await import('@/models/Room')).default;
  return { Admission, Room };
};

export async function GET(
  req: NextRequest,
  context: RouteContext // ✅ Changed from {params} to context
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { Admission } = await getModels();

    // ✅ CRITICAL FIX: await params
    const { id } = await context.params;

    const admission = await Admission.findById(id)
      .populate('patient', 'name phone bloodGroup dateOfBirth')
      .populate('doctor',  'name specialization')
      .populate('room',    'roomNumber type ward floor dailyCharge')
      .lean();

    if (!admission)
      return NextResponse.json({ message: 'Not found' }, { status: 404 });

    return NextResponse.json({ admission });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: RouteContext // ✅ Changed from {params} to context
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { Admission, Room } = await getModels();
    
    // ✅ CRITICAL FIX: await params
    const { id } = await context.params;
    const body = await req.json();

    console.log('Admission PUT:', id, body.action);

    // ✅ DISCHARGE
    if (body.action === 'discharge') {
      const admission = await Admission.findById(id);
      if (!admission)
        return NextResponse.json({ message: 'Admission not found' }, { status: 404 });

      if (admission.status === 'discharged')
        return NextResponse.json({ message: 'Already discharged' }, { status: 400 });

      const admitDate     = new Date(admission.admissionDate);
      const dischargeDate = new Date();
      const diffMs        = dischargeDate.getTime() - admitDate.getTime();
      const days          = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      const room          = await Room.findById(admission.room);
      const dailyCharge   = room?.dailyCharge || 0;
      const totalCharges  = days * dailyCharge;

      // ✅ Update admission
      const updated = await Admission.findByIdAndUpdate(
        id,
        {
          $set: {
            status:           'discharged',
            dischargeDate:    dischargeDate.toISOString().split('T')[0],
            totalDays:        days,
            totalCharges:     totalCharges,
            dischargeSummary: body.dischargeSummary || '',
          }
        },
        { new: true }
      )
      .populate('patient', 'name phone bloodGroup')
      .populate('doctor',  'name specialization')
      .populate('room',    'roomNumber type ward dailyCharge');

      // ✅ Free up room
      if (admission.room) {
        await Room.findByIdAndUpdate(admission.room, {
          $set: {
            status:          'available',
            currentPatient:  null,
          }
        });
      }

      return NextResponse.json({ admission: updated });
    }

    // ✅ ADD VITALS
    if (body.addVitals) {
      const updated = await Admission.findByIdAndUpdate(
        id,
        {
          $push: {
            vitalSigns: {
              ...body.addVitals,
              recordedAt: new Date().toLocaleString(),
            }
          }
        },
        { new: true }
      )
      .populate('patient', 'name phone')
      .populate('room',    'roomNumber type');

      return NextResponse.json({ admission: updated });
    }

    // ✅ GENERAL UPDATE
    const updated = await Admission.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    )
    .populate('patient', 'name phone bloodGroup')
    .populate('doctor',  'name specialization')
    .populate('room',    'roomNumber type ward dailyCharge');

    return NextResponse.json({ admission: updated });
  } catch (err: any) {
    console.error('Admission PUT error:', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}