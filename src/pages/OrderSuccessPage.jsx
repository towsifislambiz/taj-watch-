import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, PhoneCall, Home, Package, ShieldCheck } from 'lucide-react';
import { fireConfetti } from '../utils/confetti';
import { useOrder } from '../context/OrderContext';
import { STORE_SETTINGS } from '../data/products';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const { lastPlacedOrder } = useOrder();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fire celebratory confetti on mount
    fireConfetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#DC2626', '#F59E0B', '#10B981', '#000000'],
    });
  }, []);

  const orderId = id || lastPlacedOrder?.orderId || 'TW-CONFIRMED';
  const order = lastPlacedOrder || {
    orderId,
    customerName: 'সম্মানিত গ্রাহক',
    phone: STORE_SETTINGS.hotline,
    total: 4950,
    items: [],
  };

  const whatsappMessage = encodeURIComponent(
    `Hello TAJ WATCH! I just placed an order on your website. Order ID: #${orderId}. Please confirm my order.`
  );

  return (
    <div className="py-12 bg-[#F8FAFC] min-h-[80vh] flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4 bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
        
        {/* Success Icon */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase border border-emerald-200">
            অর্ডার স্ট্যাটাস: কনফার্মেশন অপেক্ষমাণ
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950">
            অভিনন্দন! আপনার অর্ডার সফল হয়েছে
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto font-medium">
            আপনার অর্ডারটি আমাদের সিস্টেমে নিরাপদে গৃহীত হয়েছে। আমাদের কাস্টমার রিলেশন প্রতিনিধি শীঘ্রই কল দিয়ে আপনার ডেলিভারি কনফার্ম করবেন।
          </p>
        </div>

        {/* Order ID Pill */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 inline-block mx-auto">
          <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">আপনার অর্ডার ট্র্যাকিং আইডি</p>
          <p className="font-mono text-xl sm:text-2xl font-black text-red-600 tracking-wider mt-0.5">
            #{orderId}
          </p>
        </div>

        {/* Order Details Preview */}
        {order.items && order.items.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
            <p className="font-bold text-gray-800 border-b border-gray-200 pb-1.5 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-600" />
              <span>অর্ডারকৃত ঘড়ি সমূহ:</span>
            </p>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-gray-700">
                <span className="truncate pr-2 font-medium">
                  {idx + 1}. {item.name} ({item.quantity} টি)
                </span>
                <span className="font-bold text-gray-900 shrink-0">
                  ৳{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-bold text-red-600 text-sm">
              <span>সর্বমোট প্রদেয় (ক্যাশ অন ডেলিভারি):</span>
              <span className="text-base sm:text-lg font-black tracking-tight text-red-600">৳ {Number(order.total || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={`https://wa.me/88${STORE_SETTINGS.whatsapp}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>হোয়াটসঅ্যাপে অর্ডার কনফার্ম করুন</span>
          </a>

          <a
            href={`tel:${STORE_SETTINGS.hotline}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border border-gray-200"
          >
            <PhoneCall className="w-4 h-4 text-amber-700" />
            <span>হটলাইনে কল দিন ({STORE_SETTINGS.hotline})</span>
          </a>
        </div>

        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black font-semibold transition-colors pt-2"
          >
            <Home className="w-3.5 h-3.5" /> হোম পেজে ফিরে যান
          </Link>
        </div>

        {/* Security badge */}
        <div className="pt-4 border-t border-gray-200 text-[11px] text-gray-500 flex items-center justify-center gap-2 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>প্যাকেট খুলে ঘড়ি দেখে পছন্দ হলে ডেলিভারিম্যানকে টাকা পরিশোধ করবেন।</span>
        </div>

      </div>
    </div>
  );
}
