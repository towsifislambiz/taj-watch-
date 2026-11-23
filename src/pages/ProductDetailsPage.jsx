import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
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
  Plus,
  Minus,
} from 'lucide-react';
import { fireConfetti } from '../utils/confetti';
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
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState('inside_dhaka');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImage(product.image);
    setSelectedColor(product.colors && product.colors[0]?.name ? product.colors[0].name : 'Standard');
    setQuantity(1);
    setShowInlineForm(false);
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

    fireConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const orderPayload = {
      customerName: customerName.trim(),
      phone: cleanPhone,
      address: address.trim(),
      deliveryZone,
      paymentMethod: 'cod',
      items: [
        {
          id: product.id,
          name: product.name,
          nameBn: product.nameBn || product.name,
          price: product.price,
          quantity,
          selectedColor,
          image: product.image,
        },
      ],
      subtotal,
      deliveryFee,
      total: grandTotal,
      notes: `অর্ডারকৃত কালার: ${selectedColor}`,
    };

    const res = await submitOrder(orderPayload);
    if (res.success) {
      navigate(`/order-success/${res.orderId}`);
    } else {
      setErrorMsg('অর্ডার সাবমিট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
    }
  };

  const relatedProducts = productsList
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="py-6 sm:py-10 bg-[#FAF7F5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Minimal Breadcrumb */}
        <div className="mb-4 sm:mb-6 flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-black flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> হোম পেজ
          </Link>
          <span>/</span>
          <span className="text-gray-400 uppercase">{product.brand || 'WATCH'}</span>
          <span>/</span>
          <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Showcase Container */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-4 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-3.5">
            {/* Main Stage Image in Luxury Dark Box */}
            <div className="relative aspect-square bg-[#0c1019] rounded-2xl sm:rounded-3xl p-4 flex items-center justify-center overflow-hidden border border-zinc-800">
              {product.discountPercent && !isOutOfStock && (
                <div className="absolute top-3.5 left-3.5 z-10 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
                  -{product.discountPercent}% OFF
                </div>
              )}

              {/* Stock Status Badge */}
              <div className="absolute top-3.5 right-3.5 z-10">
                {isOutOfStock ? (
                  <span className="bg-zinc-800/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                    স্টক শেষ
                  </span>
                ) : (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>ইন স্টক ({product.stock || 5} টি)</span>
                  </span>
                )}
              </div>

              <img
                src={activeImage}
                alt={product.name}
                className={`w-full h-full object-cover rounded-xl transition-all duration-300 ${
                  isOutOfStock ? 'grayscale opacity-30 contrast-75' : ''
                }`}
                loading="eager"
              />

              {/* Minimal Stock Out Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-4 z-20">
                  <div className="border border-red-500/80 bg-red-950/80 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl text-center shadow-lg">
                    <span>CURRENTLY SOLD OUT</span>
                    <span className="block text-[10px] text-zinc-300 font-normal mt-0.5">এই ঘড়িটির স্টক শেষ হয়ে গেছে</span>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery (if multiple) */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#0c1019] p-1 border-2 transition-all shrink-0 cursor-pointer ${
                      activeImage === imgUrl ? 'border-red-600 shadow' : 'border-zinc-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}

            {/* Micro Trust Strip */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-gray-700">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-amber-600 mx-auto mb-0.5" />
                <span className="font-bold block text-[10px] text-gray-900">১০০% আসল</span>
                <span className="text-[9px] text-gray-500">প্রিমিয়াম ফিনিশ</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <Truck className="w-4 h-4 text-amber-600 mx-auto mb-0.5" />
                <span className="font-bold block text-[10px] text-gray-900">ক্যাশ অন ডেলিভারি</span>
                <span className="text-[9px] text-gray-500">চেক করে মূল্য দিন</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <RefreshCw className="w-4 h-4 text-amber-600 mx-auto mb-0.5" />
                <span className="font-bold block text-[10px] text-gray-900">৭ দিন রিপ্লেসমেন্ট</span>
                <span className="text-[9px] text-gray-500">সহজ পলিসি</span>
              </div>
            </div>
          </div>

          {/* Right Column: Watch Details & Instant Checkout */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            
            {/* Header info */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-1">
                {product.brand || 'LUXURY TIMEPIECE'}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-950 leading-tight">
                {product.name}
              </h1>
              {product.nameBn && (
                <p className="text-sm font-bold text-gray-600 mt-1">
                  {product.nameBn}
                </p>
              )}
            </div>

            {/* Price Box */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-500 font-medium block">অফার প্রাইস:</span>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                    ৳ {Number(product.price || 0).toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through font-medium">
                      ৳ {Number(product.originalPrice || 0).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {product.discountPercent && (
                <span className="bg-red-100 text-red-700 text-xs font-black px-3 py-1 rounded-full uppercase border border-red-200">
                  {product.discountPercent}% ছাড়
                </span>
              )}
            </div>

            {/* Variants (Colors) */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  কালার নির্বাচন করুন: <span className="text-red-600">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedColor === c.name
                          ? 'border-red-600 bg-red-50 text-red-700 ring-1 ring-red-500'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                      <span>{c.nameBn || c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-700">পরিমাণ:</span>
              <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-black text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Primary Action Buttons (High Conversion, Minimal Clutter) */}
            <div className="space-y-2.5 pt-2">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full bg-zinc-200 text-zinc-400 font-black text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed select-none"
                >
                  <Lock className="w-4 h-4 text-zinc-400" />
                  <span>স্টক শেষ (OUT OF STOCK)</span>
                </button>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() =>
                      triggerOneClickOrder({
                        ...product,
                        selectedColor,
                        quantity,
                        price: product.price,
                      })
                    }
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-sm py-3.5 px-4 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>১-ক্লিকে এখনই অর্ডার করুন</span>
                  </button>

                  <button
                    onClick={() => addToCart(product, quantity, selectedColor)}
                    className="w-full bg-gray-950 hover:bg-gray-800 text-white font-bold text-sm py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>কার্টে যোগ করুন</span>
                  </button>
                </div>
              )}

              {/* Direct WhatsApp Callout */}
              <div className="flex items-center justify-between text-xs pt-1 text-gray-500">
                <a
                  href={`https://wa.me/88${STORE_SETTINGS.whatsapp}?text=Hello%20TAJ%20WATCH%2C%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp-এ বিস্তারিত জানুন</span>
                </a>

                <button
                  onClick={() => setShowInlineForm(!showInlineForm)}
                  className="text-gray-600 hover:text-black underline font-semibold cursor-pointer"
                >
                  {showInlineForm ? 'অর্ডার ফর্ম লুকান ▲' : 'অথবা সরাসরি এখানে ফর্ম পূরণ করুন ▼'}
                </button>
              </div>
            </div>

            {/* Optional Collapsible Inline Fast Order Form */}
            {showInlineForm && !isOutOfStock && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 animate-fadeIn">
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>ডেলিভারি ঠিকানা ও অর্ডার ফর্ম (ক্যাশ অন ডেলিভারি)</span>
                </h3>

                <form onSubmit={handleFastOrder} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">আপনার নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="সম্পূর্ণ নাম লিখুন"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">মোবাইল নম্বর *</label>
                    <input
                      type="tel"
                      required
                      placeholder="017xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">ডেলিভারি ঠিকানা *</label>
                    <input
                      type="text"
                      required
                      placeholder="বাসা নং, রোড, থানা, জেলা"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">ডেলিভারি লোকেশন:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryZone('inside_dhaka')}
                        className={`p-2 rounded-xl border text-xs flex justify-between font-bold ${
                          deliveryZone === 'inside_dhaka' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <span>ঢাকার ভিতরে</span>
                        <span>৳{STORE_SETTINGS.deliveryInsideDhaka}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryZone('outside_dhaka')}
                        className={`p-2 rounded-xl border text-xs flex justify-between font-bold ${
                          deliveryZone === 'outside_dhaka' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <span>ঢাকার বাইরে</span>
                        <span>৳{STORE_SETTINGS.deliveryOutsideDhaka}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
                    <span className="text-gray-600">সর্বমোট প্রদেয় বিল:</span>
                    <span className="text-base font-black text-red-600">৳ {Number(grandTotal).toLocaleString('en-IN')}</span>
                  </div>

                  {errorMsg && <p className="text-xs text-red-600 font-bold">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase shadow transition-all active:scale-95 cursor-pointer"
                  >
                    {isSubmitting ? 'প্রসেসিং...' : 'অর্ডার নিশ্চিত করুন (ক্যাশ অন ডেলিভারি)'}
                  </button>
                </form>
              </div>
            )}

            {/* Description & Specs Cards */}
            <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">বিবরণ:</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'প্রিমিয়াম কোয়ালিটি সুইজারল্যান্ড ইন্সপায়ার্ড মাস্টারপিস টাইমপিস।'}
                </p>
              </div>

              {product.specs && (
                <div className="pt-2">
                  <h3 className="font-bold text-gray-900 mb-2">স্পেসিফিকেশন:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">{key}</span>
                        <span className="font-bold text-gray-900 text-xs">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Related Watches */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-lg sm:text-2xl font-black text-gray-950 mb-4 sm:mb-6">
              আরও কিছু জনপ্রিয় ঘড়ি কালেকশন
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={`rel-${p.id}`} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
