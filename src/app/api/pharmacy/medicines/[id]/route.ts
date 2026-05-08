import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

// Fresh model every time
const getMedicineModel = () => {
  if (mongoose.models.Medicine) return mongoose.models.Medicine;
  return mongoose.model('Medicine', new mongoose.Schema({
    name:          String,
    genericName:   String,
    category:      String,
    manufacturer:  String,
    batchNumber:   String,
    expiryDate:    String,
    purchasePrice: { type: Number, default: 0 },
    salePrice:     { type: Number, default: 0 },
    stock:         { type: Number, default: 0 },
    minStock:      { type: Number, default: 10 },
    unit:          String,
    description:   String,
    active:        { type: Boolean, default: true },
  }, { timestamps: true }));
};

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body     = await req.json();
    const Medicine = getMedicineModel();

    console.log('PUT medicine body:', body);

    // ✅ Restock — stock mein add karo (replace nahi)
    if (body.restock) {
      const addQty   = Number(body.restock);
      const medicine = await Medicine.findByIdAndUpdate(
        params.id,
        { $inc: { stock: addQty } }, // ✅ $inc use karo
        { new: true }
      ).lean();

      console.log('Restocked:', medicine);
      return NextResponse.json({ medicine });
    }

    // ✅ Full update (edit form)
    const updateData: Record<string, any> = {};
    const allowedFields = [
      'name','genericName','category','manufacturer','batchNumber',
      'expiryDate','purchasePrice','salePrice','stock','minStock','unit','description',
    ];
    allowedFields.forEach(field => {
      if (field in body) {
        if (['purchasePrice','salePrice','stock','minStock'].includes(field)) {
          updateData[field] = Number(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    });

    console.log('Updating medicine:', updateData);

    const medicine = await Medicine.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).lean();

    return NextResponse.json({ medicine });
  } catch (err: any) {
    console.error('Medicine PUT error:', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const Medicine = getMedicineModel();
    await Medicine.findByIdAndUpdate(params.id, { active: false });
    return NextResponse.json({ message: 'Deleted' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}