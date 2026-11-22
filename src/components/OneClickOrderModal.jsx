import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Truck, Lock, Plus, Minus, CheckCircle2, PhoneCall, AlertOctagon, MessageCircle } from 'lucide-react';
import { fireConfetti } from '../utils/confetti';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { STORE_SETTINGS } from '../data/products';

export default function OneClickOrderModal() {
  const { quickOrderProduct, closeOneClickOrder } = useCart();
  const { submitOrder, isSubmitting } = useOrder();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    quickOrderProduct?.colors?.[0]?.name || null
  );
  const [deliveryZone, setDeliveryZone] = useState('inside_dhaka'); // 'inside_dhaka' | 'outside_dhaka'
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'bkash_nagad'
  const [transactionId, setTransactionId] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!quickOrderProduct) return null;

  const isOutOfStock =
    quickOrderProduct?.inStock === false ||
    (typeof quickOrderProduct?.stock === 'number' && quickOrderProduct?.stock <= 0);

  const deliveryFee =
    deliveryZone === 'outside_dhaka'
      ? STORE_SETTINGS.deliveryOutsideDhaka
      : STORE_SETTINGS.deliveryInsideDhaka;

  const itemPrice = quickOrderProduct.price || 0;
  const subtotal = itemPrice * quantity;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (isOutOfStock) {
      setErrorMessage('দুঃখিত, এই ঘড়িটির স্টক শেষ হয়ে গেছে!');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('দয়া করে আপনার সম্পূর্ণ নাম লিখুন।');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMessage('দয়া করে ১১ ডিজিটের সঠিক মোবাইল নম্বর দিন (যেমন: 01712345678)।');
      return;
    }

    if (!address.trim() || address.trim().length < 6) {
      setErrorMessage('দয়া করে আপনার ডেলিভারি ঠিকানা বিস্তারিত লিখুন (জেলা, থানা, এলাকা, রোড/বাসা নং)।');
      return;
    }

    if (paymentMethod === 'bkash_nagad' && !transactionId.trim()) {
      setErrorMessage('দয়া করে বিকাশ বা নগদের TrxID বা প্রেরক নম্বরটি লিখুন।');
      return;
    }

    fireConfetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#DC2626', '#F59E0B', '#10B981', '#000000'],
    });

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
      items: [
        {
          id: quickOrderProduct.id,
          name: quickOrderProduct.nameBn || quickOrderProduct.name,
          price: quickOrderProduct.price,
          quantity,
          selectedColor: selectedColor || 'Default',
          image: quickOrderProduct.image,
        },
      ],
    };

    const placedOrder = await submitOrder(orderPayload);
    closeOneClickOrder();
    navigate(`/order-success/${placedOrder.orderId}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              ইনস্ট্যান্ট অর্ডার — <span className="text-red-600 font-extrabold">ক্যাশ অন ডেলিভারি</span>
            </h3>
          </div>
          <button
            onClick={closeOneClickOrder}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-black flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmitOrder} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Stock Out Alert Warning */}
          {isOutOfStock && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 font-bold animate-fadeIn">
              <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
              <span>এই ঘড়িটি বর্তমানে স্টক আউট। নতুন স্টক আসার পর অর্ডার কনফার্ম করা যাবে।</span>
            </div>
          )}

          {/* Selected Product Summary Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex gap-3 items-center">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white border border-gray-200 rounded-xl overflow-hidden shrink-0 p-1 flex items-center justify-center">
              <img
                src={quickOrderProduct.image}
                alt={quickOrderProduct.name}
                className={`w-full h-full object-contain ${isOutOfStock ? 'grayscale opacity-40' : ''}`}
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white bg-red-600 px-1 py-0.5 rounded">
                    OUT
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                {quickOrderProduct.nameBn || quickOrderProduct.name}
              </h4>
              <p className="text-xs text-red-600 font-black mt-0.5 tracking-tight">
                ৳ {Number(quickOrderProduct.price || 0).toLocaleString('en-IN')}{' '}
                {quickOrderProduct.originalPrice && (
                  <span className="text-[11px] text-gray-400 line-through font-normal ml-1">
                    ৳ {Number(quickOrderProduct.originalPrice || 0).toLocaleString('en-IN')}
                  </span>
                )}
              </p>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-gray-500 font-medium">পরিমাণ:</span>
                <div className="inline-flex items-center border border-gray-300 bg-white rounded-lg shadow-sm">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 hover:text-red-600 text-gray-600 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2.5 text-xs font-bold text-gray-900">{quantity}</span>
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 hover:text-red-600 text-gray-600 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Color Switcher */}
          {quickOrderProduct.colors && quickOrderProduct.colors.length > 1 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800">কালার বা ভ্যারিয়েন্ট বেছে নিন:</label>
              <div className="flex flex-wrap gap-2">
                {quickOrderProduct.colors.map((c) => (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all ${
                      selectedColor === c.name
                        ? 'border-red-600 bg-red-50 text-red-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.nameBn || c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Zone Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-red-600" />
              <span>ডেলিভারি এরিয়া বেছে নিন:</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label
                onClick={() => setDeliveryZone('inside_dhaka')}
                className={`cursor-pointer p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  deliveryZone === 'inside_dhaka'
                    ? 'border-red-600 bg-red-50/60 text-gray-900 font-bold shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">ঢাকার ভিতরে</span>
                  <span className="font-bold text-red-600">৳{STORE_SETTINGS.deliveryInsideDhaka}</span>
                </div>
                <span className="text-[10px] text-gray-500 mt-1">হোম ডেলিভারি (২৪-৪৮ ঘণ্টা)</span>
              </label>

              <label
                onClick={() => setDeliveryZone('outside_dhaka')}
                className={`cursor-pointer p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  deliveryZone === 'outside_dhaka'
                    ? 'border-red-600 bg-red-50/60 text-gray-900 font-bold shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">ঢাকার বাইরে</span>
                  <span className="font-bold text-red-600">৳{STORE_SETTINGS.deliveryOutsideDhaka}</span>
                </div>
                <span className="text-[10px] text-gray-500 mt-1">সারা দেশে ক্যাশ অন ডেলিভারি</span>
              </label>
            </div>
          </div>

          {/* Customer Inputs */}
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                আপনার পুরো নাম <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: তানভীর আহমেদ"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                সচল মোবাইল নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="যেমন: 01712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                সম্পূর্ণ ঠিকানা (বাসা নং, রোড, থানা, জেলা) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="যেমন: বাসা #৪৫, রোড #৭, সেক্টর #৩, উত্তরা, ঢাকা"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 shadow-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                বিশেষ কোনো নোট বা পছন্দ (ঐচ্ছিক)
              </label>
              <input
                type="text"
                placeholder="যেমন: বিকেলে ডেলিভারি দিলে ভালো হয়"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Method Switcher */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-gray-800">পেমেন্ট মেথড:</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`cursor-pointer p-2.5 rounded-xl border flex items-center gap-2 ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-emerald-600"
                />
                <span>ক্যাশ অন ডেলিভারি</span>
              </label>

              <label
                onClick={() => setPaymentMethod('bkash_nagad')}
                className={`cursor-pointer p-2.5 rounded-xl border flex items-center gap-2 ${
                  paymentMethod === 'bkash_nagad'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bkash_nagad'}
                  onChange={() => setPaymentMethod('bkash_nagad')}
                  className="accent-amber-500"
                />
                <span>বিকাশ / নগদ পে</span>
              </label>
            </div>

            {/* bKash / Nagad Manual Payment Details Box */}
            {paymentMethod === 'bkash_nagad' && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs space-y-2 animate-fadeIn text-gray-800">
                <p>
                  📱 আমাদের পার্সোনাল বিকাশ / নগদ নম্বর:{' '}
                  <strong className="text-amber-800 select-all font-mono text-sm font-black">
                    {STORE_SETTINGS.bkashNagad}
                  </strong>
                </p>
                <p className="text-[11px] text-gray-600">
                  সেন্ড মানি করার পর ট্রানজেকশন আইডি (TrxID) বা যে নম্বর থেকে পাঠিয়েছেন তা নিচে লিখুন:
                </p>
                <input
                  type="text"
                  placeholder="TrxID অথবা প্রেরক মোবাইল নম্বর"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400"
                />
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>ঘড়ির দাম ({quantity} টি):</span>
              <span className="font-bold text-gray-900">৳ {Number(subtotal || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-bold text-gray-900">৳ {Number(deliveryFee || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black text-red-600 pt-1.5 border-t border-gray-200">
              <span>সর্বমোট প্রদেয় বিল:</span>
              <span className="text-base sm:text-lg font-black tracking-tight">৳ {Number(grandTotal || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold text-center">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {isOutOfStock ? (
              <>
                <button
                  type="button"
                  disabled
                  className="w-full bg-zinc-200 border border-zinc-300 text-zinc-400 font-black text-sm py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed select-none"
                >
                  <Lock className="w-4 h-4 text-zinc-400" />
                  <span>অর্ডার বন্ধ (স্টক শেষ)</span>
                </button>

                <a
                  href={`https://wa.me/88${STORE_SETTINGS.whatsapp}?text=Hello%20TAJ%20WATCH%2C%20is%20${encodeURIComponent(quickOrderProduct.name)}%20available%3F`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp-এ স্টক আসার খবর জানুন</span>
                </a>
              </>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm sm:text-base py-3.5 rounded-xl uppercase tracking-wider shadow-lg shadow-red-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'অর্ডার প্রসেস হচ্ছে...'
                    : `অর্ডার কনফার্ম করুন — ৳ ${Number(grandTotal || 0).toLocaleString('en-IN')}`}
                </span>
              </button>
            )}

            <p className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>কোনো অগ্রিম পেমেন্ট লাগবে না। পার্সেল চেক করে টাকা দেবেন।</span>
            </p>
          </div>

        </form>

      </div>
    </div>
  );
}
