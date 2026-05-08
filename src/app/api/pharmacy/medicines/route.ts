import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Medicine from '@/models/Medicine';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const search   = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const alert    = searchParams.get('alert');

    const query: any = { active: true };
    if (search)   query.name = { $regex: search, $options: 'i' };
    if (category) query.category = category;

    let medicines = await Medicine.find(query).sort({ name: 1 }).lean();

    // Low stock or expiry alerts
    if (alert === 'low')    medicines = medicines.filter(m => m.stock <= m.minStock);
    if (alert === 'expiry') {
      const soon = new Date();
      soon.setDate(soon.getDate() + 30);
      medicines = medicines.filter(m => new Date(m.expiryDate) <= soon);
    }

    // Stats
    const allMeds    = await Medicine.find({ active: true }).lean();
    const lowStock   = allMeds.filter(m => m.stock <= m.minStock).length;
    const expirySoon = allMeds.filter(m => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 30);
      return new Date(m.expiryDate) <= soon;
    }).length;
    const expired = allMeds.filter(m => new Date(m.expiryDate) < new Date()).length;
    const totalValue = allMeds.reduce((s, m) => s + m.stock * m.salePrice, 0);

    return NextResponse.json({
      medicines,
      stats: {
        total: allMeds.length,
        lowStock,
        expirySoon,
        expired,
        totalValue,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();

    const medicine = await Medicine.create({
      ...body,
      active: true, 
      tenant: user.id,
    });

    return NextResponse.json({ medicine }, { status: 201 });
  } catch (err: any) {
    console.error("POST ERROR:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}