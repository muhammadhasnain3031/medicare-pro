import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import PharmacyBill from '@/models/PharmacyBill';

// ✅ Interface for Next.js 15+ async params
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  req: NextRequest,
  context: RouteContext // Changed from { params }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // ✅ CRITICAL FIX: await the params promise
    const { id } = await context.params;
    
    const body = await req.json();
    if ('paid' in body) body.paid = Boolean(body.paid);

    const bill = await PharmacyBill.findByIdAndUpdate(
      id, // Used the awaited id here
      { $set: body }, 
      { new: true }
    ).populate('patient', 'name phone');

    if (!bill) return NextResponse.json({ message: 'Bill not found' }, { status: 404 });

    return NextResponse.json({ bill });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// Agar is file mein GET ya DELETE bhi hai, toh unko bhi isi tarah update karein:
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectDB();
    const bill = await PharmacyBill.findById(id).populate('patient', 'name phone');
    return NextResponse.json({ bill });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}