import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import Invoice from '@/models/Invoice';

// ✅ Define Context Interface for Next.js 15+
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: NextRequest,
  context: RouteContext // Changed from direct params
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // ✅ Await the params promise
    const { id } = await context.params;

    const invoice = await Invoice.findById(id)
      .populate('patient', 'name phone email address bloodGroup dateOfBirth')
      .populate('doctor',  'name specialization qualification')
      .lean();

    if (!invoice) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    return NextResponse.json({ invoice });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: RouteContext // Changed from direct params
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // ✅ Await the params promise
    const { id } = await context.params;
    const body = await req.json();

    // Partial payment add karo
    if (body.addPayment) {
      const invoice = await Invoice.findById(id);
      if (!invoice) return NextResponse.json({ message: 'Not found' }, { status: 404 });

      const newPaid = invoice.paidAmount + body.addPayment.amount;
      const newDue  = Math.max(0, invoice.totalAmount - newPaid);
      let   status  = invoice.status;
      if (newPaid >= invoice.totalAmount) status = 'paid';
      else if (newPaid > 0)               status = 'partial';

      invoice.paidAmount = newPaid;
      invoice.dueAmount  = newDue;
      invoice.status     = status as any;
      invoice.payments.push({
        amount:    body.addPayment.amount,
        method:    body.addPayment.method,
        date:      new Date().toISOString().split('T')[0],
        reference: body.addPayment.reference || '',
      });
      await invoice.save();

      const updated = await Invoice.findById(id)
        .populate('patient', 'name phone email')
        .populate('doctor',  'name specialization')
        .lean();
      return NextResponse.json({ invoice: updated });
    }

    // Status update
    const updated = await Invoice.findByIdAndUpdate(
      id, { $set: body }, { new: true }
    )
    .populate('patient', 'name phone email')
    .populate('doctor',  'name specialization')
    .lean();

    return NextResponse.json({ invoice: updated });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: RouteContext // Changed from direct params
) {
  try {
    const token = req.cookies.get('token')?.value;
    const user  = verifyToken(token || '');
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // ✅ Await the params promise
    const { id } = await context.params;

    await Invoice.findByIdAndUpdate(id, { status: 'cancelled' });
    return NextResponse.json({ message: 'Cancelled' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}