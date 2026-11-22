import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { STORE_SETTINGS } from '../data/products';

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryZone,
    setDeliveryZone,
    deliveryFee,
    grandTotal,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 flex justify-end animate-fadeIn">
      {/* Off-canvas panel - Clean White */}
      <div className="w-full max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col h-full animate-slideIn">
        
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-gray-900">
              আপনার শপিং কার্ট ({cartItems.length})
            </h3>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-black flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8FAFC]">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-white border border-gray-200 rounded-2xl p-3 flex gap-3 items-center shadow-sm"
              >
                {/* Thumb */}
                <div className="w-16 h-16 bg-[#F1F5F9] rounded-xl overflow-hidden shrink-0 p-1 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                    {item.nameBn || item.name}
                  </h4>
                  {item.selectedColor && (
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      কালার: {item.selectedColor}
                    </span>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-black text-red-600">
                      ৳{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>

                    {/* Stepper */}
                    <div className="flex items-center border border-gray-300 bg-gray-50 rounded-lg">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="px-1.5 py-0.5 text-gray-600 hover:text-black"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="px-1.5 py-0.5 text-gray-600 hover:text-black"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove Trash */}
                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  title="রিমুভ করুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 text-gray-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-gray-800">আপনার কার্ট বর্তমানে খালি আছে</p>
              <p className="text-xs text-gray-500">পছন্দের ঘড়ি বেছে নিয়ে কার্টে যুক্ত করুন</p>
              <button
                onClick={closeCart}
                className="mt-2 px-5 py-2.5 bg-black text-white font-bold text-xs rounded-xl shadow-sm"
              >
                কালেকশন ঘুরে দেখুন
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer with calculation & checkout button */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-5 bg-white space-y-3 shadow-lg">
            {/* Delivery Zone switcher */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-red-600" /> ডেলিভারি লোকেশন:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDeliveryZone('inside_dhaka')}
                  className={`py-2 px-2.5 rounded-xl border text-left transition-all ${
                    deliveryZone === 'inside_dhaka'
                      ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-sm'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  <span>ঢাকার ভিতরে: </span>
                  <strong className="text-red-600">৳{STORE_SETTINGS.deliveryInsideDhaka}</strong>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryZone('outside_dhaka')}
                  className={`py-2 px-2.5 rounded-xl border text-left transition-all ${
                    deliveryZone === 'outside_dhaka'
                      ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-sm'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
                  <span>ঢাকার বাইরে: </span>
                  <strong className="text-red-600">৳{STORE_SETTINGS.deliveryOutsideDhaka}</strong>
                </button>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1 text-xs text-gray-600 pt-1">
              <div className="flex justify-between">
                <span>সাবটোটাল:</span>
                <span className="font-bold text-gray-900">৳ {Number(subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ:</span>
                <span className="font-bold text-gray-900">৳ {Number(deliveryFee || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black text-red-600 pt-2 border-t border-gray-200">
                <span>সর্বমোট বিল:</span>
                <span className="text-base font-black tracking-tight">৳ {Number(grandTotal || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm py-3.5 rounded-xl uppercase tracking-wider shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
            >
              <span>ক্যাশ অন ডেলিভারিতে চেকআউট</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>পণ্য হাতে পেয়ে চেক করে টাকা পরিশোধের গ্যারান্টি</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
