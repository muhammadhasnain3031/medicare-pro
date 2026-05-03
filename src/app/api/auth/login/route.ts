import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { signToken } from '@/lib/auth';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password, tenantSlug } = await req.json();

    // Query banao
    const query: any = { email };

    // Agar tenantSlug diya toh us tenant ka user dhundo
    if (tenantSlug && tenantSlug !== 'superadmin') {
      const Tenant = (await import('@/models/Tenant')).default;
      const tenant = await Tenant.findOne({ slug: tenantSlug, active: true });
      if (!tenant) return NextResponse.json({ message: 'Hospital not found' }, { status: 404 });
      query.tenant = tenant._id;
    }

    const user = await User.findOne(query).populate('tenant', 'name slug primaryColor logo');
    if (!user || !(await bcrypt.compare(password, user.password)))
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });

    const token = signToken({
      id:       user._id,
      role:     user.role,
      tenantId: user.tenant?._id || null,
    });

    const res = NextResponse.json({
      user: {
        id:     user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        tenant: user.tenant,
      },
    });

    res.cookies.set('token', token, {
      httpOnly: true, maxAge: 7 * 24 * 60 * 60, path: '/',
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}