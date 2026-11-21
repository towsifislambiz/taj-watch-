import React from 'react';
import {
  X,
  Printer,
  Download,
  Calendar,
  DollarSign,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { STORE_SETTINGS } from '../../data/products';

export default function MonthlyReportModal({ isOpen, onClose, orders = [], selectedMonth = 'current' }) {
  if (!isOpen) return null;

  // Filter orders by month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const filteredOrders = orders.filter((o) => {
    if (!o.createdAt) return true;
    const orderDate = new Date(
      o.createdAt.seconds ? o.createdAt.seconds * 1000 : o.createdAt
    );
    if (isNaN(orderDate.getTime())) return true;

    if (selectedMonth === 'current') {
      return (
        orderDate.getFullYear() === currentYear &&
        orderDate.getMonth() === currentMonth
      );
    } else if (selectedMonth === 'previous') {
      const prevDate = new Date(currentYear, currentMonth - 1, 1);
      return (
        orderDate.getFullYear() === prevDate.getFullYear() &&
        orderDate.getMonth() === prevDate.getMonth()
      );
    }
    return true; // 'all'
  });

  // Calculate Financials
  const totalOrders = filteredOrders.length;
  const deliveredOrders = filteredOrders.filter((o) => o.status === 'delivered');
  const pendingOrders = filteredOrders.filter(
    (o) => !o.status || o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipped'
  );
  const cancelledOrders = filteredOrders.filter((o) => o.status === 'cancelled');

  const totalGrossRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalDeliveryFee = filteredOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const reportMonthName =
    selectedMonth === 'current'
      ? `${monthNamesBn[currentMonth]} ${currentYear}`
      : selectedMonth === 'previous'
      ? `${monthNamesBn[(currentMonth + 11) % 12]} ${currentMonth === 0 ? currentYear - 1 : currentYear}`
      : 'বিগত ২ মাসের সামগ্রিক আর্কাইভ';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white text-zinc-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="bg-zinc-950 text-white px-6 py-4 flex items-center justify-between border-b border-zinc-800 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                মাসিক সেলস রিপোর্ট ও অডিট ইনভয়েস
              </h3>
              <p className="text-[11px] text-zinc-400">
                {reportMonthName} — অফিসিয়াল কম্পিউটার জেনারেটেড স্টেটমেন্ট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট / PDF ডাউনলোড</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Statement Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:space-y-4 print:text-xs">
          
          {/* Letterhead Header */}
          <div className="border-b-2 border-zinc-900 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 p-2 flex items-center justify-center border border-amber-500/40">
                <img
                  src="/assets/brand/logo.jpeg"
                  alt="TAJ WATCH"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-black tracking-wider text-zinc-950">
                  TAJ <span className="text-amber-600">WATCH</span>
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  LUXURY TIMEPIECES & SIGNATURE ACCESSORIES
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-zinc-600 space-y-0.5">
              <p className="font-bold text-zinc-900">হটলাইন: {STORE_SETTINGS.hotline}</p>
              <p>ইমেইল: {STORE_SETTINGS.email}</p>
              <p className="max-w-xs">{STORE_SETTINGS.showroomAddress}</p>
            </div>
          </div>

          {/* Statement Meta & Alert Notice */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-50 border border-zinc-200 p-4 rounded-2xl gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
                রিপোর্টের সময়কাল:
              </span>
              <h2 className="text-lg font-black text-zinc-900">
                {reportMonthName}
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                রিপোর্ট তৈরির তারিখ: {new Date().toLocaleString('bn-BD', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs max-w-md">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>২ মাসের ডেটা ব্যাকআপ পলিসি</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                প্রতি মাসের ২৫ তারিখের পর এই মাসিক স্টেটমেন্ট সংরক্ষণ করুন। ১ তারিখে অ্যাডমিন প্যানেল নতুন মাসের সেলস ফ্রেশভাবে প্রদর্শন করবে। বিগত ২ মাসের সম্পূর্ণ ডেটা ফায়ারবেস ক্লাউডে ব্যাকআপ সংরক্ষিত রয়েছে।
              </p>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-zinc-100 rounded-2xl border border-zinc-200">
              <span className="text-[11px] text-zinc-500 font-bold block">মোট অর্ডার সংখ্যা</span>
              <span className="text-xl sm:text-2xl font-black text-zinc-900 font-mono block mt-1">
                {totalOrders} টি
              </span>
              <span className="text-[10px] text-zinc-500">চলতি মাসের সকল অর্ডার</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
              <span className="text-[11px] font-bold block">সফলভাবে ডেলিভার্ড</span>
              <span className="text-xl sm:text-2xl font-black font-mono block mt-1 text-emerald-700">
                ৳ {deliveredRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">{deliveredOrders.length} টি সফল অর্ডার</span>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
              <span className="text-[11px] font-bold block">প্রসেসিং ও পেন্ডিং</span>
              <span className="text-xl sm:text-2xl font-black font-mono block mt-1 text-amber-700">
                {pendingOrders.length} টি
              </span>
              <span className="text-[10px] text-amber-600 font-semibold">কুরিয়ারে রানিং</span>
            </div>

            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-900">
              <span className="text-[11px] font-bold block">মোট সর্বমোট সেলস ভলিউম</span>
              <span className="text-xl sm:text-2xl font-black font-mono block mt-1 text-red-700">
                ৳ {totalGrossRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-red-600 font-semibold">ডেলিভারি ফি: ৳ {totalDeliveryFee.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Detailed Itemized Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
              অর্ডারসমূহের বিস্তারিত তালিকা ({filteredOrders.length} টি রেকর্ড):
            </h3>

            <div className="border border-zinc-300 rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-300 text-zinc-700 font-bold">
                    <th className="p-3">#</th>
                    <th className="p-3">অর্ডার আইডি</th>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">গ্রাহক ও ফোন</th>
                    <th className="p-3">ঠিকানা</th>
                    <th className="p-3">পণ্যের বিবরণ</th>
                    <th className="p-3">কুরিয়ার কোড</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3 text-right">মোট টাকা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, idx) => {
                      const orderDate = order.createdAt?.seconds
                        ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('bn-BD')
                        : new Date(order.createdAt || Date.now()).toLocaleDateString('bn-BD');

                      return (
                        <tr key={order.id || idx} className="hover:bg-zinc-50">
                          <td className="p-3 font-mono text-[11px] text-zinc-500">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-zinc-900">{order.id || 'N/A'}</td>
                          <td className="p-3 text-zinc-600">{orderDate}</td>
                          <td className="p-3">
                            <span className="font-bold block text-zinc-900">{order.customerName}</span>
                            <span className="font-mono text-[11px] text-zinc-500">{order.phone}</span>
                          </td>
                          <td className="p-3 text-[11px] text-zinc-600 max-w-xs truncate">{order.address}</td>
                          <td className="p-3 text-[11px]">
                            {(order.items || []).map((it, i) => (
                              <div key={i} className="text-zinc-800">
                                • {it.name} <span className="text-zinc-500">(x{it.quantity})</span>
                              </div>
                            ))}
                          </td>
                          <td className="p-3 font-mono text-[11px] font-bold text-zinc-700">
                            {order.courierTrackingId || '—'}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {order.status || 'pending'}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-sm text-zinc-900">
                            ৳ {(order.total || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-zinc-500">
                        এই মাসে কোনো অর্ডারের রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statement Footer */}
          <div className="pt-6 border-t border-zinc-300 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 gap-2">
            <div>
              <p>অফিসিয়াল স্বাক্ষর ও স্ট্যাম্প: ________________________</p>
            </div>
            <div className="text-right">
              <p>© {new Date().getFullYear()} TAJ WATCH BANGLADESH. All Rights Reserved.</p>
              <p className="text-[10px] text-zinc-400">Computer Generated Statement • Verified by Firebase Cloud Database</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
