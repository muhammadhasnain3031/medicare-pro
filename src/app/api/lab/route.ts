import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import mongoose, { Schema, Document } from 'mongoose';

// Lab Test Model inline
const LabTestSchema = new Schema({
  patient:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:      { type: Schema.Types.ObjectId, ref: 'User' },
  testName:    { type: String, required: true },
  testType:    { type: String, enum: ['blood','urine','xray','mri','ultrasound','ecg','other'], default: 'blood' },
  price:       { type: Number, default: 0 },
  status:      { type: String, enum: ['pending','processing','completed','cancelled'], default: 'pending' },
  priority:    { type: String, enum: ['normal','urgent','emergency'], default: 'normal' },
  result:      { type: String, default: '' },
  notes:       { type: String, default: '' },
  reportUrl:   { type: String, default: '' },
  paid:        { type: Boolean, default: false },
  paymentMethod: { type: String, default: '' },
}, { timestamps: true });

const LabTest = mongoose.models.LabTest || mongoose.model('LabTest', LabTestSchema);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (user.role === 'patient') query.patient = user.id;

    const tests = await LabTest.find(query)
      .populate('patient', 'name phone bloodGroup')
      .populate('doctor',  'name specialization')
      .sort({ createdAt: -1 });

    return NextResponse.json({ tests });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();

    const test = await LabTest.create({
      ...body,
      ...(user.role === 'patient' ? { patient: user.id } : {}),
    });

    const populated = await LabTest.findById(test._id)
      .populate('patient', 'name phone bloodGroup')
      .populate('doctor',  'name specialization');

    return NextResponse.json({ test: populated }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}