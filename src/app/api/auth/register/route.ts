import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { signToken } from '@/lib/auth';
import User from '@/models/User';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, role, ...rest } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'All fields required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    if (await User.findOne({ email: normalizedEmail })) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashed,
      role,
      ...rest,
    });

    try {
      await createAuditLog({
        userId: user._id.toString(),
        userName: user.name,
        userRole: user.role,
        action: AUDIT_ACTIONS.USER_CREATED,
        module: AUDIT_MODULES.USERS,
        details: `New ${user.role} account created: ${user.email}`,
        status: 'success',
      });
    } catch (e) {
      console.error('Audit log failed', e);
    }

    const token = signToken({ id: user._id, role: user.role });

    const res = NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, { status: 201 });

    res.cookies.set('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return res;

  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}