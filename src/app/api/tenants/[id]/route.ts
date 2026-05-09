import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Tenant from '@/models/Tenant';
import User from '@/models/User';

// ✅ Interface for Next.js 15+ async params
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(
  req: NextRequest, 
  context: RouteContext // ✅ Changed from { params }
) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || decoded.role !== 'superadmin')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });

    await connectDB();
    
    // ✅ Must await the params promise
    const { id } = await context.params;
    const body   = await req.json();

    const tenant = await Tenant.findByIdAndUpdate(id, body, { new: true });

    if (!tenant) return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });

    return NextResponse.json({ tenant });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest, 
  context: RouteContext // ✅ Changed from { params }
) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || decoded.role !== 'superadmin')
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });

    await connectDB();

    // ✅ Must await the params promise
    const { id } = await context.params;

    // Tenant ke sare users bhi delete karo
    await User.deleteMany({ tenant: id });
    const deletedTenant = await Tenant.findByIdAndDelete(id);

    if (!deletedTenant) return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });

    return NextResponse.json({ message: 'Tenant deleted' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}