'use client';
import { useState } from 'react';

interface PaymentModalProps {
  amount:   number;
  onPay:    (method: string) => void;
  onClose:  () => void;
  title?:   string;
}

export default function PaymentModal({ amount, onPay, onClose, title }: PaymentModalProps) {
  const [step, setStep]       = useState<'select'|'jazzcash'|'easypaisa'|'success'>('select');
  const [method, setMethod]   = useState('');
  const [phone, setPhone]     = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async (selectedMethod: string) => {
    setMethod(selectedMethod);
    if (selectedMethod === 'Cash') {
      setLoading(true);
      setTimeout(() => {
        setStep('success');
        setLoading(false);
      }, 800);
    } else {
      setStep(selectedMethod.toLowerCase() as any);
    }
  };

  const handleMobilePayment = () => {
    if (!phone || phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setStep('success');
      setLoading(false);
    }, 1500);
  };

  const handleSuccess = () => {
    onPay(method);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">

        {/* Select Payment Method */}
        {step === 'select' && (
          <>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white">
              <h3 className="font-bold text-lg mb-1">{title || 'Payment'}</h3>
              <p className="text-blue-100 text-sm">Total Amount</p>
              <p className="text-3xl font-black mt-1">PKR {amount.toLocaleString()}</p>
            </div>

            <div className="p-5">
              <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                Select Payment Method
              </p>

              <div className="space-y-3">
                {/* JazzCash */}
                <button onClick={() => handlePay('JazzCash')}
                  className="w-full flex items-center gap-4 p-4 border-2 border-red-100 rounded-2xl hover:border-red-400 hover:bg-red-50 transition-all group">
                  <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    JC
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 group-hover:text-red-700">JazzCash</p>
                    <p className="text-xs text-gray-500">Pay via JazzCash mobile wallet</p>
                  </div>
                  <span className="ml-auto text-gray-300 group-hover:text-red-500">→</span>
                </button>

                {/* EasyPaisa */}
                <button onClick={() => handlePay('EasyPaisa')}
                  className="w-full flex items-center gap-4 p-4 border-2 border-green-100 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all group">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    EP
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 group-hover:text-green-700">EasyPaisa</p>
                    <p className="text-xs text-gray-500">Pay via EasyPaisa mobile wallet</p>
                  </div>
                  <span className="ml-auto text-gray-300 group-hover:text-green-500">→</span>
                </button>

                {/* Cash */}
                <button onClick={() => handlePay('Cash')}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all group">
                  <div className="w-12 h-12 bg-gray-600 rounded-2xl flex items-center justify-center text-white text-xl flex-shrink-0">
                    💵
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Cash</p>
                    <p className="text-xs text-gray-500">Pay at counter</p>
                  </div>
                  <span className="ml-auto text-gray-300 group-hover:text-gray-500">→</span>
                </button>
              </div>

              <button onClick={onClose}
                className="w-full mt-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </>
        )}

        {/* JazzCash Form */}
        {step === 'jazzcash' && (
          <>
            <div className="bg-red-500 p-5 text-white">
              <button onClick={() => setStep('select')} className="text-red-200 text-sm mb-2 flex items-center gap-1">
                ← Back
              </button>
              <h3 className="font-bold text-lg">JazzCash Payment</h3>
              <p className="text-3xl font-black mt-1">PKR {amount.toLocaleString()}</p>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-500 mb-4">
                Enter your JazzCash registered mobile number to proceed.
              </p>

              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                JazzCash Mobile Number
              </label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="03XX-XXXXXXX"
                maxLength={11}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-xl text-sm focus:outline-none focus:border-red-400 mb-4"
              />

              <div className="bg-red-50 rounded-xl p-3 mb-4 text-xs text-red-700">
                💡 You will receive a confirmation SMS from JazzCash
              </div>

              <button onClick={handleMobilePayment} disabled={loading || phone.length < 10}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : `Pay PKR ${amount.toLocaleString()}`}
              </button>
            </div>
          </>
        )}

        {/* EasyPaisa Form */}
        {step === 'easypaisa' && (
          <>
            <div className="bg-green-500 p-5 text-white">
              <button onClick={() => setStep('select')} className="text-green-200 text-sm mb-2">
                ← Back
              </button>
              <h3 className="font-bold text-lg">EasyPaisa Payment</h3>
              <p className="text-3xl font-black mt-1">PKR {amount.toLocaleString()}</p>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-500 mb-4">
                Enter your EasyPaisa registered mobile number.
              </p>

              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                EasyPaisa Mobile Number
              </label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="03XX-XXXXXXX"
                maxLength={11}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl text-sm focus:outline-none focus:border-green-400 mb-4"
              />

              <div className="bg-green-50 rounded-xl p-3 mb-4 text-xs text-green-700">
                💡 You will receive a confirmation PIN from EasyPaisa
              </div>

              <button onClick={handleMobilePayment} disabled={loading || phone.length < 10}
                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : `Pay PKR ${amount.toLocaleString()}`}
              </button>
            </div>
          </>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-500 text-sm mb-2">Your payment has been processed</p>

            <div className="bg-gray-50 rounded-2xl p-4 mb-5 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-900">PKR {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-bold text-gray-900">{method}</span>
              </div>
              {phone && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mobile</span>
                  <span className="font-bold text-gray-900">{phone}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-bold text-gray-900">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <button onClick={handleSuccess}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors">
              Done ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}