import { NextResponse } from 'next/server';
import { generateInvoice } from '@/lib/invoice';
import Prescription from '@/models/Prescription';

export async function POST(req: Request) {
  const body = await req.json();

  const {
    pp_ResponseCode,
    pp_TxnRefNo,
    amount
  } = body;

  // ✅ SUCCESS CHECK
  if (pp_ResponseCode === "000") {

    // 1. create invoice
    const invoice = await generateInvoice({
      orderId: pp_TxnRefNo,
      amount
    });

    // 2. save in DB (example)
    await Prescription.findOneAndUpdate(
      { orderId: pp_TxnRefNo },
      {
        paymentStatus: "PAID",
        invoiceId: invoice.id
      }
    );

    return NextResponse.json({
      status: "success",
      invoice
    });
  }

  return NextResponse.json({
    status: "failed"
  });
}