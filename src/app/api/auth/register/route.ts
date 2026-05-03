import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { signToken } from '@/lib/auth';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, password, role, ...rest } = await req.json();

    if (await User.findOne({ email }))
      return NextResponse.json({ message: 'Email already exists' }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed, role, ...rest });

    const token = signToken({ id: user._id, role: user.role });

    const res = NextResponse.json({
      user: { id: user._id, name, email, role: user.role },
    }, { status: 201 });

    res.cookies.set('token', token, {
      httpOnly: true, maxAge: 7 * 24 * 60 * 60, path: '/',
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}