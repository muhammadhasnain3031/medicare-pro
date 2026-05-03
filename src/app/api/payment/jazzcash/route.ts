import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  const { amount, orderId, customerPhone } = body;

  // ⚠️ demo payload (real keys JazzCash se milti hain)
  const paymentData = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: "YOUR_MERCHANT_ID",
    pp_Password: "YOUR_PASSWORD",
    pp_Amount: amount * 100,
    pp_TxnRefNo: orderId,
    pp_Description: "Hospital Bill Payment",
    pp_ReturnURL: "http://localhost:3000/payment/success",
    pp_SecureHash: "GENERATED_HASH",
    pp_MobileNumber: customerPhone
  };

  return NextResponse.json({
    redirectUrl: "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
    paymentData
  });
}