'use client';

import { useEffect } from 'react';

export default function PaymentSuccess() {

  useEffect(() => {

    const verifyPayment = async () => {

      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pp_ResponseCode: "000",
          pp_TxnRefNo: localStorage.getItem("orderId"),
          amount: localStorage.getItem("amount")
        })
      });

      const data = await res.json();

      console.log("Invoice Created:", data.invoice);
    };

    verifyPayment();

  }, []);

  return (
    <div className="p-10 text-center">
      <h1 className="text-green-600 text-2xl font-bold">
        Payment Successful 🎉
      </h1>
      <p>Invoice is being generated automatically...</p>
    </div>
  );
}