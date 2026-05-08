import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import PharmacyBill from '@/models/PharmacyBill';
import Medicine from '@/models/Medicine';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const bills = await PharmacyBill.find()
      .populate('patient', 'name phone')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return NextResponse.json({ bills });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();

    // Bill number generate karo
    const count      = await PharmacyBill.countDocuments();
    const billNumber = `PHR-${Date.now()}-${count + 1}`;

    // Stock deduct karo
    for (const item of body.items) {
      await Medicine.findByIdAndUpdate(
        item.medicine,
        { $inc: { stock: -item.quantity } }
      );
    }

    const bill = await PharmacyBill.create({ ...body, billNumber });
    const populated = await PharmacyBill.findById(bill._id)
      .populate('patient', 'name phone')
      .lean();

    return NextResponse.json({ bill: populated }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}