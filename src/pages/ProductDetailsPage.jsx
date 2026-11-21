import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  ShoppingBag,
  MessageCircle,
  PhoneCall,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Zap,
  AlertOctagon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRODUCTS, STORE_SETTINGS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import ProductCard from '../components/ProductCard';
import { subscribeToProducts } from '../firebase/services';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, triggerOneClickOrder } = useCart();
  const { submitOrder, isSubmitting } = useOrder();

  const [productsList, setProductsList] = useState(PRODUCTS);

  // Subscribe to live Firestore products
  useEffect(() => {
    const unsub = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) {
        setProductsList(prods);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const product = productsList.find((p) => String(p.id) === String(id)) || productsList[0] || PRODUCTS[0];
  const isOutOfStock =
    product.inStock === false ||
    (typeof product.stock === 'number' && product.stock <= 0);
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors[0]?.name ? product.colors[0].name : 'Standard'
  );
  const [quantity, setQuantity] = useState(1);

  // In-page Fast Order Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [transactionId, setTransactionId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(product.image);
    setSelectedColor(product.colors && product.colors[0]?.name ? product.colors[0].name : 'Standard');
  }, [product]);

  const deliveryFee =
    deliveryZone === 'outside_dhaka'
      ? STORE_SETTINGS.deliveryOutsideDhaka
      : STORE_SETTINGS.deliveryInsideDhaka;

  const subtotal = product.price * quantity;
  const grandTotal = subtotal + deliveryFee;

  const handleFastOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('দয়া করে আপনার সম্পূর্ণ নাম লিখুন।');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMsg('দয়া করে ১১ ডিজিটের সঠিক মোবাইল নম্বর দিন।');
      return;
    }

    if (!address.trim() || address.trim().length < 6) {
      setErrorMsg('দয়া করে সম্পূর্ণ ঠিকানা বিস্তারিত লিখুন।');
      return;
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
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
      deliveryZone,
      deliveryFee,
      paymentMethod,
      transactionId: transactionId.trim(),
      subtotal,
      total: grandTotal,
      items: [
        {
          id: product.id,
          name: product.nameBn || product.name,
          price: product.price,
          quantity,
          selectedColor,
          image: activeImage || product.image,
        },
      ],
    };

    const placedOrder = await submitOrder(orderPayload);
    navigate(`/order-success/${placedOrder.orderId}`);
  };

  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="py-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link & Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-black flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> হোম পেজ
          </Link>
          <span>/</span>
          <span className="text-gray-400 uppercase">{product.category}</span>
          <span>/</span>
          <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Stage */}
            <div className="relative aspect-square bg-white border border-gray-200 rounded-3xl p-6 flex items-center justify-center overflow-hidden shadow-lg group">
              {product.discountPercent && !isOutOfStock && (
                <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                  {product.discountPercent}% বিশেষ ছাড়
                </div>
              )}

              {/* Stock Status Pill */}
              <div
                className={`absolute top-4 right-4 z-30 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm ${
                  isOutOfStock
                    ? 'bg-red-50 border border-red-200 text-red-600'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOutOfStock ? 'bg-red-500' : 'bg-emerald-500 animate-ping'
                  }`}
                />
                <span>{isOutOfStock ? 'স্টক শেষ (Out of Stock)' : `স্টকে আছে: ${product.stock || 5} টি`}</span>
              </div>

              <img
                src={activeImage}
                alt={product.name}
                className={`w-full h-full object-contain filter drop-shadow-sm transition-all duration-500 ${
                  isOutOfStock
                    ? 'grayscale opacity-35 contrast-75'
                    : 'group-hover:scale-108'
                }`}
              />

              {/* Big Prominent Out of Stock Overlay on Detail Page */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px] flex items-center justify-center p-6 z-20 animate-fadeIn">
                  <div className="max-w-xs w-full bg-gradient-to-b from-[#181a24]/95 via-[#0f1118]/95 to-[#090b10]/95 border-2 border-red-500/70 rounded-3xl p-6 text-center shadow-2xl shadow-red-950/90 transform -rotate-2">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-red-500/15 border border-red-500/40 text-red-500 flex items-center justify-center mb-3">
                      <AlertOctagon className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="font-mono text-xs font-black uppercase tracking-widest text-red-400 mb-1">
                      CURRENTLY SOLD OUT
                    </div>
                    <div className="text-white font-black text-xl sm:text-2xl tracking-wider uppercase drop-shadow mb-1">
                      STOCK OUT
                    </div>
                    <p className="text-xs text-zinc-300 font-bold border-t border-red-500/30 pt-2 mt-2">
                      দুঃখিত, এই ঘড়িটির স্টক শেষ হয়ে গেছে!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-20 h-20 rounded-2xl bg-white p-1.5 border-2 transition-all shrink-0 ${
                      activeImage === imgUrl
                        ? 'border-red-600 scale-105 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Guarantee Micro Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 text-center text-xs text-gray-700">
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <span className="font-bold block text-[11px] text-gray-900">১০০% অরিজিনাল</span>
                <span className="text-[9px] text-gray-500">প্রিমিয়াম ফিনিশ</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <Truck className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <span className="font-bold block text-[11px] text-gray-900">ক্যাশ অন ডেলিভারি</span>
                <span className="text-[9px] text-gray-500">চেক করে মূল্য দিন</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <RefreshCw className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <span className="font-bold block text-[11px] text-gray-900">৭ দিন রিপ্লেসমেন্ট</span>
                <span className="text-[9px] text-gray-500">সহজ রিটার্ন পলিসি</span>
              </div>
            </div>
          </div>

          {/* Right Column: Watch Details + In-Page Order Form */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Title & Brand */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded uppercase border border-amber-300">
                  {product.brand || 'LUXURY TIMEPIECE'}
                </span>
                <div className="flex items-center gap-1 text-amber-500 text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-gray-800">{product.rating || 5.0}</span>
                  <span className="text-gray-500">({product.reviewCount || 48} ভেরিফাইড রিভিউ)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 leading-tight">
                {product.name}
              </h1>
              <p className="text-sm sm:text-base font-bold text-red-600 mt-1">
                {product.nameBn}
              </p>
            </div>

            {/* Price Box */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs text-gray-500 font-medium">অফার মূল্য (সীমিত সময়):</p>
                <div className="flex items-baseline gap-3 mt-0.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight">
                    ৳ {Number(product.price || 0).toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm sm:text-base text-gray-400 line-through font-medium">
                      ৳ {Number(product.originalPrice || 0).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block bg-red-100 text-red-700 text-xs font-black px-3 py-1 rounded-full uppercase border border-red-200">
                  সেভ ৳ {Number((product.originalPrice || product.price) - product.price).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Color / Variant Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-800">
                  কালার অপশন নির্বাচন করুন: <span className="text-red-600 font-normal">({selectedColor})</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                        selectedColor === color.name
                          ? 'border-red-600 bg-red-50 text-red-700 ring-1 ring-red-500'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.nameBn || color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Specifications Table */}
            {product.specs && (
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider">
                  স্পেসিফিকেশন ও মেটেরিয়াল
                </div>
                <div className="divide-y divide-gray-100 text-xs">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 px-4 py-2.5">
                      <span className="text-gray-500 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="col-span-2 text-gray-900 font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fast 1-Click Embedded Order Form (Conversion Engine) */}
            <div className="bg-white border-2 border-red-500 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    সহজ ১-ক্লিক অর্ডার ফর্ম
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5 font-medium">
                    নিচের ফর্মটি পূরণ করলেই অর্ডার নিশ্চিত হয়ে যাবে (কোনো অগ্রিম টাকা লাগবে না)
                  </p>
                </div>
              </div>

              <form onSubmit={handleFastOrder} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    আপনার নাম <span className="text-red-500">*</span>
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
                    ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="বাসা নং, রোড, থানা, জেলা"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 focus:bg-white shadow-sm"
                  />
                </div>

                {/* Delivery Zone */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">ডেলিভারি লোকেশন:</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label
                      onClick={() => setDeliveryZone('inside_dhaka')}
                      className={`cursor-pointer p-2.5 rounded-xl border flex items-center justify-between ${
                        deliveryZone === 'inside_dhaka'
                          ? 'border-red-600 bg-red-50 text-gray-900 font-bold shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      }`}
                    >
                      <span>ঢাকার ভিতরে</span>
                      <strong className="text-red-600">৳{STORE_SETTINGS.deliveryInsideDhaka}</strong>
                    </label>

                    <label
                      onClick={() => setDeliveryZone('outside_dhaka')}
                      className={`cursor-pointer p-2.5 rounded-xl border flex items-center justify-between ${
                        deliveryZone === 'outside_dhaka'
                          ? 'border-red-600 bg-red-50 text-gray-900 font-bold shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      }`}
                    >
                      <span>ঢাকার বাইরে</span>
                      <strong className="text-red-600">৳{STORE_SETTINGS.deliveryOutsideDhaka}</strong>
                    </label>
                  </div>
                </div>

                {/* Stock Out Alert Notice OR Live Bill */}
                {isOutOfStock ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                    <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-red-700 text-sm">এই ঘড়িটি বর্তমানে স্টক আউট (Out of Stock)</p>
                      <p className="text-gray-600 leading-relaxed">
                        প্রিয় গ্রাহক, এই মডেলটির স্টক বর্তমানে শেষ হয়ে গেছে। খুব শীঘ্রই নতুন স্টক আসবে। স্টক আসার সাথে সাথে আপডেট পেতে বা অগ্রিম বুকিং করতে সরাসরি WhatsApp-এ মেসেজ দিন।
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>ঘড়ির দাম:</span>
                      <span className="font-bold text-gray-900">৳ {Number(subtotal || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>ডেলিভারি চার্জ:</span>
                      <span className="font-bold text-gray-900">৳ {Number(deliveryFee || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-black text-red-600 pt-1.5 border-t border-gray-200">
                      <span>মোট প্রদেয় টাকা:</span>
                      <span className="text-base sm:text-lg font-black tracking-tight">৳ {Number(grandTotal || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <p className="text-xs text-red-700 font-bold bg-red-50 p-2 rounded-lg text-center border border-red-200">
                    ⚠️ {errorMsg}
                  </p>
                )}

                {/* Big Red CTA OR Disabled Stock Out CTA */}
                {isOutOfStock ? (
                  <button
                    type="button"
                    disabled
                    className="w-full bg-zinc-200 border border-zinc-300 text-zinc-400 font-black text-sm sm:text-base py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed select-none"
                  >
                    <Lock className="w-4 h-4 text-zinc-400" />
                    <span>অর্ডার বন্ধ (স্টক শেষ)</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm sm:text-base py-3.5 rounded-xl uppercase tracking-wider shadow-lg shadow-red-500/30 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? 'অর্ডার নেওয়া হচ্ছে...'
                        : `অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)`}
                    </span>
                  </button>
                )}
              </form>

              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  disabled={isOutOfStock}
                  onClick={() => !isOutOfStock && addToCart(product, 1, selectedColor)}
                  className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border ${
                    isOutOfStock
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200 cursor-pointer'
                  }`}
                  title={isOutOfStock ? 'স্টক শেষ' : 'কার্টে যোগ করুন'}
                >
                  <ShoppingBag className="w-4 h-4 text-amber-700" />
                  <span>কার্টে যোগ করুন</span>
                </button>

                <a
                  href={`https://wa.me/88${STORE_SETTINGS.whatsapp}?text=Hello%20TAJ%20WATCH%2C%20is%20${encodeURIComponent(product.name)}%20back%20in%20stock%3F`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isOutOfStock ? 'WhatsApp-এ স্টক খবর নিন' : 'WhatsApp অর্ডার'}</span>
                </a>
              </div>
            </div>

            {/* Description Text */}
            <div className="space-y-3 pt-2">
              <h3 className="text-lg font-bold text-gray-950 border-b border-gray-200 pb-2">
                ঘড়ির বিবরণ ও বৈশিষ্ট্য
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans font-medium">
                {product.description}
              </p>
            </div>

          </div>

        </div>

        {/* Related Watches */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-gray-200">
            <h3 className="text-xl sm:text-2xl font-black text-gray-950 mb-6">
              আরও কিছু পছন্দনীয় ঘড়ি (Similar Collection)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
