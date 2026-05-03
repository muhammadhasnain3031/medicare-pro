import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Tenant from '@/models/Tenant';

export async function GET(req: NextRequest) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || decoded.role !== 'superadmin')
      return NextResponse.json({ message: 'Super Admin only' }, { status: 403 });

    await connectDB();
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    return NextResponse.json({ tenants });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || decoded.role !== 'superadmin')
      return NextResponse.json({ message: 'Super Admin only' }, { status: 403 });

    await connectDB();
    const body = await req.json();

    // Slug generate karo
    const slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existing = await Tenant.findOne({ slug });
    if (existing) return NextResponse.json({ message: 'Hospital slug already exists' }, { status: 400 });

    const tenant = await Tenant.create({ ...body, slug });
    return NextResponse.json({ tenant }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}