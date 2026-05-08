import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';
import Tenant from '@/models/Tenant';

export async function POST(req: NextRequest) {
  try {
    const token   = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || decoded.role !== 'superadmin')
      return NextResponse.json({ message: 'Super Admin only' }, { status: 403 });

    await connectDB();
    const { tenantSlug, name, email, password, role, phone, ...rest } = await req.json();

    // Tenant dhundo
    const tenant = await Tenant.findOne({ slug: tenantSlug });
    if (!tenant) return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });

    // Email check
    if (await User.findOne({ email, tenant: tenant._id }))
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      phone:  phone || '',
      tenant: tenant._id,
      ...rest,
    });

    return NextResponse.json({
      success: true,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
      loginInfo: {
        url:          `http://localhost:3000/login`,
        email,
        password,
        hospitalCode: tenantSlug,
      }
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}