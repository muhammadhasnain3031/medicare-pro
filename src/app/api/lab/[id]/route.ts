import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Tenant from '@/models/Tenant';
import { verifyToken } from '@/lib/auth';

// @ts-ignore
export async function PUT(req: NextRequest, { params }: any) {
  try {
    const { id } = await params; // Next.js 15 requirement
    const token = req.cookies.get('token')?.value;
    const user = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();

    const tenant = await Tenant.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!tenant) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    return NextResponse.json({ tenant });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// @ts-ignore
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const { id } = await params;
    const token = req.cookies.get('token')?.value;
    const user = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    await Tenant.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}