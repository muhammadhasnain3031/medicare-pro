import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    // ✅ Token verify — role check nahi (doctor bhi patients dekh sake)
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'No token' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ message: 'Invalid' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    const query: any = {};
    if (role) query.role = role;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || decoded.role !== 'admin')
      return NextResponse.json({ message: 'Admin only' }, { status: 403 });

    await connectDB();
    const body = await req.json();

    if (await User.findOne({ email: body.email }))
      return NextResponse.json({ message: 'Email exists' }, { status: 400 });

    const newUser = await User.create({
      ...body,
      password: await bcrypt.hash(body.password, 10),
    });

    const { password: _, ...userWithoutPass } = newUser.toObject();
    return NextResponse.json({ user: userWithoutPass }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token || '');
    if (!decoded || decoded.role !== 'admin')
      return NextResponse.json({ message: 'Admin only' }, { status: 403 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}