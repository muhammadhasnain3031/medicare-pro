import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Next.js 15+ mein params Promise hota hai
type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const token = req.cookies.get('token')?.value;
    const user = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // ✅ Params ko await karein
    const { id } = await params;

    await connectDB();

    const LabTest = (await import('@/models/LabTest')).default;
    const body = await req.json();

    const updateObj: Record<string, any> = {};
    Object.keys(body).forEach(key => {
      if (key === 'paid') {
        updateObj[key] = Boolean(body[key]);
      } else {
        updateObj[key] = body[key];
      }
    });

    console.log('🔄 Updating:', id, updateObj);

    const test = await LabTest.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { 
        returnDocument: 'after', // ✅ 'new: true' ki jagah ye use karein warning khatam karne ke liye
        runValidators: false 
      }
    )
    .populate('patient', 'name phone bloodGroup')
    .populate('doctor', 'name specialization')
    .lean();

    console.log('✅ Updated paid:', (test as any)?.paid);

    if (!test) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ test });
  } catch (err: any) {
    console.error('❌ PUT error:', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const token = req.cookies.get('token')?.value;
    const user = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // ✅ Params ko await karein
    const { id } = await params;

    await connectDB();
    const LabTest = (await import('@/models/LabTest')).default;
    
    const deletedTest = await LabTest.findByIdAndDelete(id);
    
    if (!deletedTest) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted' });
  } catch (err: any) {
    console.error('❌ DELETE error:', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}