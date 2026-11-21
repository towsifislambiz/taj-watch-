import React from 'react';
import { X, Printer, CheckCircle2, PhoneCall, Truck, ShieldCheck } from 'lucide-react';
import { STORE_SETTINGS } from '../../data/products';

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Action Bar (Hidden during print) */}
        <div className="bg-gray-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="font-bold text-sm">অর্ডার ইনভয়েস ও ডেলিভারি স্লিপ</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন (Print A4)</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice" className="p-6 sm:p-10 space-y-6 text-gray-900 bg-white">
          
          {/* Header: Brand & Invoice Meta */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-gray-900 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-500 shrink-0">
                <img
                  src="/assets/brand/logo.jpeg"
                  alt="TAJ WATCH"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-black tracking-wider text-gray-950">
                  TAJ <span className="text-amber-600">WATCH</span>
                </h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                  {STORE_SETTINGS.tagline}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">হটলাইন: {STORE_SETTINGS.hotline}</p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-0.5">
              <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                INVOICE
              </span>
              <p className="font-mono text-base font-black text-gray-950 mt-1">
                {order.orderId || `#TW-${order.id?.slice(0, 8)}`}
              </p>
              <p className="text-xs text-gray-500">
                তারিখ: {new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt || Date.now()).toLocaleDateString('bn-BD')}
              </p>
              <span className="inline-block mt-1 bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'বিকাশ / নগদ পেইড'}
              </span>
            </div>
          </div>

          {/* Customer & Delivery Address Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
            <div>
              <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mb-1">
                গ্রাহকের তথ্য (CUSTOMER INFO):
              </p>
              <p className="font-bold text-gray-950 text-sm">{order.customerName}</p>
              <p className="font-mono font-bold text-red-600 mt-0.5">{order.phone}</p>
              <p className="text-gray-600 mt-1 leading-relaxed">{order.address}</p>
            </div>

            <div>
              <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mb-1">
                ডেলিভারি জোন ও নির্দেশনা:
              </p>
              <p className="font-semibold text-gray-900">
                {order.deliveryZone === 'outside_dhaka' ? 'ঢাকার বাইরে (সারা দেশ)' : 'ঢাকার ভিতরে (হোম ডেলিভারি)'}
              </p>
              {order.trackingId && (
                <p className="font-mono text-emerald-700 font-bold mt-1">
                  কুরিয়ার ট্র্যাকিং: {order.trackingId} ({order.courierName || 'Steadfast'})
                </p>
              )}
              {order.notes && (
                <p className="text-gray-500 italic mt-1.5">নোট: &ldquo;{order.notes}&rdquo;</p>
              )}
            </div>
          </div>

          {/* Itemized Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                  <th className="py-2.5">আইটেম বিবরণী</th>
                  <th className="py-2.5 text-center">পরিমাণ</th>
                  <th className="py-2.5 text-right">একক মূল্য</th>
                  <th className="py-2.5 text-right">মোট মূল্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(order.items || []).map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-3">
                      <p className="font-bold text-gray-950 text-xs">{item.name}</p>
                      {item.selectedColor && (
                        <p className="text-[10px] text-gray-500">কালার: {item.selectedColor}</p>
                      )}
                    </td>
                    <td className="py-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-600">৳{item.price?.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-bold text-gray-950">
                      ৳{(item.price * item.quantity).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bill Calculation Box */}
          <div className="border-t-2 border-gray-900 pt-4 flex flex-col items-end text-xs space-y-1.5">
            <div className="w-64 flex justify-between text-gray-600">
              <span>সাবটোটাল (Subtotal):</span>
              <span className="font-bold text-gray-900">৳{order.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-64 flex justify-between text-gray-600">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-bold text-gray-900">৳{order.deliveryFee?.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-64 flex justify-between text-base font-black border-t border-gray-200 pt-2 text-red-600">
              <span>সর্বমোট প্রদেয় বিল:</span>
              <span className="font-mono font-black text-base text-gray-950">৳ {Number(order.total || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Guarantee & Courier Signature Footer */}
          <div className="pt-6 border-t border-dashed border-gray-300 grid grid-cols-2 gap-4 items-end text-[10px] text-gray-500">
            <div>
              <p className="font-bold text-gray-700">শর্তাবলী ও নিশ্চয়তা:</p>
              <p className="mt-0.5">১. ডেলিভারিম্যানের সামনে পণ্য চেক করে মূল্য পরিশোধ করুন।</p>
              <p>২. ২ বছরের অফিসিয়াল মেকানিজম ওয়ারেন্টি কার্ড সংরক্ষিত রাখুন।</p>
            </div>
            <div className="text-right">
              <div className="w-36 h-10 border-b border-gray-400 ml-auto mb-1" />
              <p className="font-bold text-gray-700">কুরিয়ার ডেলিভারিম্যানের স্বাক্ষর</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
