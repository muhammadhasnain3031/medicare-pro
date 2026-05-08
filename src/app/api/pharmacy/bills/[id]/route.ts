import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import PharmacyBill from '@/models/PharmacyBill';

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
    if ('paid' in body) body.paid = Boolean(body.paid);

    const bill = await PharmacyBill.findByIdAndUpdate(
      params.id, { $set: body }, { new: true }
    ).populate('patient', 'name phone');

    return NextResponse.json({ bill });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}