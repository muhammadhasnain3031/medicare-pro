import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Tenant from '@/models/Tenant';
import User from '@/models/User';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || decoded.role !== 'superadmin')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });

    await connectDB();
    const body   = await req.json();
    const tenant = await Tenant.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ tenant });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || decoded.role !== 'superadmin')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });

    await connectDB();

    // Tenant ke sare users bhi delete karo
    await User.deleteMany({ tenant: params.id });
    await Tenant.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Tenant deleted' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}