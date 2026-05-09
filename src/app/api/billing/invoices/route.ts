import { sendNotification } from '@/lib/notifications';
import { NotificationTemplates } from '@/lib/notification-templates';

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Invoice from '@/models/Invoice';



export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status    = searchParams.get('status');
    const patientId = searchParams.get('patientId');

    const query: any = {};
    if (status) query.status = status;
    if (patientId) query.patient = patientId;
    if (user.role === 'patient') query.patient = user.id;

    const invoices = await Invoice.find(query)
      .populate('patient', 'name phone email bloodGroup')
      .populate('doctor',  'name specialization')
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Stats
    const all = await Invoice.find(
      user.role === 'patient' ? { patient: user.id } : {}
    ).lean();

    const totalAmount  = all.reduce((s, i) => s + i.totalAmount, 0);
    const totalPaid    = all.reduce((s, i) => s + i.paidAmount,  0);
    const totalDue     = all.reduce((s, i) => s + i.dueAmount,   0);
    const overdueCount = all.filter(i => i.status === 'overdue').length;

    return NextResponse.json({
      invoices,
      stats: {
        total: all.length,
        totalAmount,
        totalPaid,
        totalDue,
        overdueCount
      },
    });

  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Role restriction (important)
    if (!['admin', 'receptionist'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();

    // ✅ Invoice number generate
    const count         = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // ✅ Calculations
    const subtotal      = body.items.reduce((s: number, i: any) => s + i.total, 0);

    const discountAmt   = body.discountType === 'percent'
      ? Math.round(subtotal * (body.discount || 0) / 100)
      : (body.discount || 0);

    const taxableAmount = subtotal - discountAmt;

    const taxAmt        = Math.round(taxableAmount * (body.taxPercent || 0) / 100);

    const totalAmount   = taxableAmount + taxAmt - (body.insuranceAmount || 0);

    const paidAmount    = body.paidAmount || 0;

    const dueAmount     = Math.max(0, totalAmount - paidAmount);

    let status = 'sent';
    if (paidAmount >= totalAmount) status = 'paid';
    else if (paidAmount > 0)       status = 'partial';

    const invoice = await Invoice.create({
      ...body,
      invoiceNumber,
      subtotal,
      discount: discountAmt,
      tax: taxAmt,
      totalAmount,
      paidAmount,
      dueAmount,
      status,
      payments: paidAmount > 0 ? [{
        amount: paidAmount,
        method: body.paymentMethod || 'Cash',
        date: new Date().toISOString().split('T')[0],
        reference: body.reference || '',
      }] : [],
    });

    // ✅ Populate for response + notification
    const populated = await Invoice.findById(invoice._id)
      .populate('patient', 'name phone email')
      .populate('doctor',  'name specialization')
      .lean();

    
    return NextResponse.json(
      { invoice: populated },
      { status: 201 }
    );

  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}