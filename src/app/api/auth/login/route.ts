import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { signToken } from '@/lib/auth';
import User from '@/models/User';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password, tenantSlug } = await req.json();

    const query: any = { email };
    if (tenantSlug && tenantSlug !== 'superadmin') {
      const Tenant = (await import('@/models/Tenant')).default;
      const tenant = await Tenant.findOne({ slug: tenantSlug, active: true });
      if (!tenant) return NextResponse.json({ message: 'Hospital not found' }, { status: 404 });
      query.tenant = tenant._id;
    }

    const user = await User.findOne(query).populate('tenant', 'name slug primaryColor logo');

    // ✅ Failed login audit
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await createAuditLog({
        action:  AUDIT_ACTIONS.LOGIN_FAILED,
        module:  AUDIT_MODULES.AUTH,
        details: `Failed login attempt for email: ${email}`,
        status:  'failed',
        req,
      });
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    const token = signToken({
      id:       user._id,
      role:     user.role,
      tenantId: user.tenant?._id || null,
    });

    // ✅ Successful login audit
    await createAuditLog({
      userId:   user._id.toString(),
      userName: user.name,
      userRole: user.role,
      action:   AUDIT_ACTIONS.LOGIN,
      module:   AUDIT_MODULES.AUTH,
      details:  `User logged in successfully`,
      status:   'success',
      req,
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