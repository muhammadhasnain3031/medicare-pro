import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get('specialization');

    const query: any = { role: 'doctor', available: true };
    if (specialization) query.specialization = specialization;

    const doctors = await User.find(query).select('-password');
    return NextResponse.json({ doctors });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}