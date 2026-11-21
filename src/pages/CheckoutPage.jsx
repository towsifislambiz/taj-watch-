import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { STORE_SETTINGS } from '../data/products';

export default function CheckoutPage() {
  const {
    cartItems,
    subtotal,
    deliveryZone,
    setDeliveryZone,
    deliveryFee,
    grandTotal,
    clearCart,
  } = useCart();
  const { submitOrder, isSubmitting } = useOrder();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'bkash_nagad'
  const [transactionId, setTransactionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F8FAFC] p-4">
        <div className="text-center max-w-md bg-white border border-gray-200 p-8 rounded-3xl shadow-sm space-y-4">
          <p className="text-base text-gray-900 font-bold">আপনার কার্ট খালি আছে</p>
          <p className="text-xs text-gray-500">অর্ডার করার পূর্বে ঘড়ি নির্বাচন করে কার্টে যোগ করুন।</p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-black text-white font-bold text-xs rounded-xl shadow-sm"
          >
            কালেকশনে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('দয়া করে আপনার সম্পূর্ণ নাম লিখুন।');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMessage('দয়া করে ১১ ডিজিটের সঠিক মোবাইল নম্বর দিন।');
      return;
    }

    if (!address.trim() || address.trim().length < 6) {
      setErrorMessage('দয়া করে ডেলিভারি ঠিকানা বিস্তারিত লিখুন।');
      return;
    }

    if (paymentMethod === 'bkash_nagad' && !transactionId.trim()) {
      setErrorMessage('দয়া করে বিকাশ বা নগদের TrxID অথবা প্রেরক নম্বরটি লিখুন।');
      return;
    }

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#DC2626', '#F59E0B', '#10B981'],
      });
    } catch {
      // ignore
    }

    const orderPayload = {
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
      deliveryZone,
      deliveryFee,
      paymentMethod,
      transactionId: transactionId.trim(),
      subtotal,
      total: grandTotal,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.nameBn || item.name,
        price: item.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor || 'Default',
        image: item.image,
      })),
    };

    const placedOrder = await submitOrder(orderPayload);
    clearCart();
    navigate(`/order-success/${placedOrder.orderId}`);
  };

  return (
    <div className="py-10 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black font-semibold">
            <ArrowLeft className="w-4 h-4" /> কেনাকাটায় ফিরে যান
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 mt-2">
            চেকআউট — <span className="text-red-600">অর্ডার সম্পন্ন করুন</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            সরাসরি ক্যাশ অন ডেলিভারি অথবা বিকাশ/নগদে অর্ডার করুন
          </p>
        </div>

        <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form: Delivery Address & Customer Info */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-red-600" />
                <span>ডেলিভারি ঠিকানা ও যোগাযোগের তথ্য</span>
              </h3>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    আপনার সম্পূর্ণ নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: তানভীর আহমেদ"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    মোবাইল নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="যেমন: 01712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:bg-white shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    সম্পূর্ণ ঠিকানা (বাসা নং, রোড নং, থানা, জেলা) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="যেমন: বাসা #৪৫, রোড #৭, সেক্টর #৩, উত্তরা, ঢাকা"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:bg-white shadow-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ডেলিভারি নোট বা বিশেষ নির্দেশনা (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: প্যাকেটের উপর গিফট র‍্যাপার দিলে ভালো হয়"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Delivery Zone Switcher */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-800 mb-2">ডেলিভারি এরিয়া:</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label
                    onClick={() => setDeliveryZone('inside_dhaka')}
                    className={`cursor-pointer p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                      deliveryZone === 'inside_dhaka'
                        ? 'border-red-600 bg-red-50/60 text-gray-900 font-bold shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>ঢাকার ভিতরে</span>
                      <strong className="text-red-600">৳{STORE_SETTINGS.deliveryInsideDhaka}</strong>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">হোম ডেলিভারি (২৪-৪৮ ঘণ্টা)</span>
                  </label>

                  <label
                    onClick={() => setDeliveryZone('outside_dhaka')}
                    className={`cursor-pointer p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                      deliveryZone === 'outside_dhaka'
                        ? 'border-red-600 bg-red-50/60 text-gray-900 font-bold shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>ঢাকার বাইরে</span>
                      <strong className="text-red-600">৳{STORE_SETTINGS.deliveryOutsideDhaka}</strong>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">সারা দেশে ক্যাশ অন ডেলিভারি</span>
                  </label>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-3">
                <label className="block text-xs font-bold text-gray-800 mb-2">পেমেন্ট মেথড নির্বাচন করুন:</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`cursor-pointer p-3.5 rounded-2xl border flex items-center gap-2.5 ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-emerald-600"
                    />
                    <span>ক্যাশ অন ডেলিভারি</span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('bkash_nagad')}
                    className={`cursor-pointer p-3.5 rounded-2xl border flex items-center gap-2.5 ${
                      paymentMethod === 'bkash_nagad'
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === 'bkash_nagad'}
                      onChange={() => setPaymentMethod('bkash_nagad')}
                      className="accent-amber-500"
                    />
                    <span>বিকাশ / নগদ পে</span>
                  </label>
                </div>

                {paymentMethod === 'bkash_nagad' && (
                  <div className="mt-3 bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs space-y-2 text-gray-800">
                    <p>
                      📱 আমাদের বিকাশ / নগদ পার্সোনাল নম্বর:{' '}
                      <strong className="text-amber-900 font-mono text-sm font-black">{STORE_SETTINGS.bkashNagad}</strong>
                    </p>
                    <p className="text-[11px] text-gray-600">
                      সেন্ড মানি করার পর যে নম্বর থেকে টাকা পাঠিয়েছেন বা TrxID নিচে লিখুন:
                    </p>
                    <input
                      type="text"
                      placeholder="TrxID বা প্রেরক নম্বর"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-3">
                অর্ডার সারাংশ ({cartItems.length} টি আইটেম)
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="pt-3 first:pt-0 flex items-center gap-3">
                    <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-xl p-1 shrink-0 flex items-center justify-center">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.nameBn || item.name}</h4>
                      <p className="text-[11px] text-gray-500">
                        {item.quantity} × ৳{item.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className="text-xs font-black text-red-600">
                      ৳{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="border-t border-gray-200 pt-3 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span className="font-bold text-gray-900">৳ {Number(subtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-bold text-gray-900">৳ {Number(deliveryFee || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-base font-black text-red-600 pt-2 border-t border-gray-200">
                  <span>সর্বমোট বিল:</span>
                  <span className="text-lg font-black tracking-tight">৳ {Number(grandTotal || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold text-center">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Confirm Order Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm sm:text-base py-4 rounded-2xl uppercase tracking-wider shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'অর্ডার প্রক্রিয়াধীন...'
                    : `অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)`}
                </span>
              </button>

              <div className="text-center text-[11px] text-gray-500 space-y-1">
                <p className="flex items-center justify-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>কোনো অগ্রিম পেমেন্টের ঝুঁকি নেই। সম্পূর্ণ পণ্য দেখে টাকা দিন।</span>
                </p>
                <p>হটলাইন: {STORE_SETTINGS.hotline}</p>
              </div>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
