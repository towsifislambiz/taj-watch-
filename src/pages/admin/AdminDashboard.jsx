import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Phone,
  MessageSquare,
  Printer,
  Trash2,
  Edit3,
  Plus,
  RefreshCw,
  LogOut,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  ShoppingBag,
  Eye,
  Star,
  Settings,
  Download,
  Send,
  Sparkles,
  Layers,
  MapPin,
  Save,
  X,
  Flame,
  Zap,
  Lock,
  KeyRound,
  User,
  Image as ImageIcon,
  Upload,
  Camera,
  Calendar,
  Building,
  Mail,
  Timer,
  Award,
  Tag,
  AlertTriangle,
  FileText
} from 'lucide-react';
import {
  subscribeToOrders,
  updateOrderStatus,
  updateOrderCourier,
  deleteOrder,
  subscribeToProducts,
  addFirestoreProduct,
  updateFirestoreProduct,
  deleteFirestoreProduct,
  seedProductsIfEmpty,
  subscribeToReviews,
  addFirestoreReview,
  deleteFirestoreReview,
  seedReviewsIfEmpty,
  getFirestoreStoreSettings,
  updateFirestoreStoreSettings,
  getFlashSaleConfig,
  updateFlashSaleConfig,
  subscribeToFlashSaleConfig,
  getAdminCredentials,
  updateAdminCredentials,
  subscribeToBrands,
  addFirestoreBrand,
  updateFirestoreBrand,
  deleteFirestoreBrand,
  seedBrandsIfEmpty,
  cleanupOrdersOlderThan2Months,
} from '../../firebase/services';
import { STORE_SETTINGS, DEFAULT_BRANDS } from '../../data/products';
import InvoiceModal from './InvoiceModal';
import MonthlyReportModal from './MonthlyReportModal';
import { convertFileToWebP } from '../../utils/imageOptimizer';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Auth protection check
  useEffect(() => {
    const isAuth = localStorage.getItem('tajwatch_admin_authenticated');
    if (isAuth !== 'true') {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Tab State: 'orders' | 'products' | 'brands' | 'flashsale' | 'reviews' | 'settings'
  const [activeTab, setActiveTab] = useState('orders');

  // Real-time State
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState(DEFAULT_BRANDS);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState(STORE_SETTINGS);
  const [flashSaleConfig, setFlashSaleConfig] = useState({
    active: true,
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    title: 'Flash Sale | ফ্ল্যাশ সেল',
    subtitle: 'সীমিত সময়ের বিশেষ স্টক ক্লিয়ারেন্স অফার',
  });

  // Admin Credentials State
  const [adminCreds, setAdminCreds] = useState({ username: 'admin@tajwatch.com', password: 'tajwatch2026' });

  // Loading & Sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Orders Tab filters & Month Archiving
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderMonthFilter, setOrderMonthFilter] = useState('current'); // 'current' | 'previous' | 'all'
  const [showMonthlyReportModal, setShowMonthlyReportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Flash Sale Timer presets & Live Countdown ticker
  const [selectedPresetHours, setSelectedPresetHours] = useState(null);
  const [flashRemaining, setFlashRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // Courier Modal
  const [courierModalOrder, setCourierModalOrder] = useState(null);
  const [courierName, setCourierName] = useState('Steadfast');
  const [trackingId, setTrackingId] = useState('');
  const [courierNotes, setCourierNotes] = useState('');

  // Product Add/Edit Modal with WebP Optimizer
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const productFileInputRef = useRef(null);
  const galleryFilesInputRef = useRef(null);
  const [isConvertingImage, setIsConvertingImage] = useState(false);
  const [imageCompressionInfo, setImageCompressionInfo] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    banglaName: '',
    category: 'wrist_watch',
    brand: 'Audemars Piguet',
    price: 3500,
    originalPrice: 5500,
    stock: 25,
    isFlashSale: false,
    inStock: true,
    image: '',
    gallery: [],
    description: '',
  });

  // Brand Add/Edit Modal
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandForm, setBrandForm] = useState({
    name: '',
    nameBn: '',
    origin: 'Switzerland',
    logo: '',
    featured: true,
  });
  const brandFileInputRef = useRef(null);

  // Review Add Modal with Image Picker
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    location: 'ঢাকা',
    rating: 5,
    product: '',
    comment: '',
    image: '',
    wristPhoto: '',
    verified: true,
  });
  const reviewFileInputRef = useRef(null);

  // Settings Form
  const [settingsForm, setSettingsForm] = useState(STORE_SETTINGS);

  // Trigger temporary toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. Subscribe to Firebase Firestore collections
  useEffect(() => {
    setIsSyncing(true);

    const unsubscribeOrders = subscribeToOrders((ordersData) => {
      setOrders(ordersData);
      setIsSyncing(false);
    });

    const unsubscribeProducts = subscribeToProducts((prodData) => {
      setProducts(prodData);
    });

    const unsubscribeBrands = subscribeToBrands((brandData) => {
      setBrands(brandData);
    });

    const unsubscribeReviews = subscribeToReviews((revData) => {
      setReviews(revData);
    });

    getFirestoreStoreSettings().then((setts) => {
      setSettings(setts);
      setSettingsForm(setts);
    });

    getFlashSaleConfig().then((cfg) => {
      if (cfg) setFlashSaleConfig(cfg);
    });

    getAdminCredentials().then((creds) => {
      if (creds) {
        setAdminCreds(creds);
      }
    });

    // Ensure database collections are seeded with initial data if empty
    seedProductsIfEmpty();
    seedBrandsIfEmpty();
    seedReviewsIfEmpty();

    // Auto-clean orders older than 2 months (60 days) to keep Firestore fast & preserve 2 months backup
    cleanupOrdersOlderThan2Months().catch(console.warn);

    return () => {
      if (typeof unsubscribeOrders === 'function') unsubscribeOrders();
      if (typeof unsubscribeProducts === 'function') unsubscribeProducts();
      if (typeof unsubscribeBrands === 'function') unsubscribeBrands();
      if (typeof unsubscribeReviews === 'function') unsubscribeReviews();
    };
  }, []);

  // Helper: Format Date to local HTML5 datetime-local string (eliminates 6-hour UTC offset glitch)
  const toLocalISOString = (dateInput) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Live Flash Sale Countdown Ticker for Preview
  useEffect(() => {
    const calcRemaining = () => {
      if (!flashSaleConfig?.endTime) return;
      const diff = new Date(flashSaleConfig.endTime).getTime() - Date.now();
      if (diff <= 0) {
        setFlashRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setFlashRemaining({ days, hours, minutes, seconds, isExpired: false });
    };

    calcRemaining();
    const interval = setInterval(calcRemaining, 1000);
    return () => clearInterval(interval);
  }, [flashSaleConfig?.endTime]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('tajwatch_admin_authenticated');
    localStorage.removeItem('tajwatch_admin_user');
    navigate('/admin/login');
  };

  // Seed default items into Firestore
  const handleSeedData = async () => {
    setIsSyncing(true);
    await seedProductsIfEmpty();
    await seedBrandsIfEmpty();
    await seedReviewsIfEmpty();
    setIsSyncing(false);
    showToast('ডিফল্ট প্রোডাক্ট, ব্র্যান্ড ও রিভিউ ফায়ারবেজে সিঙ্ক সম্পন্ন হয়েছে!');
  };

  // Status badge style helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return { label: 'কনফার্মড', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: CheckCircle2 };
      case 'shipped':
        return { label: 'কুরিয়ারে শিপড', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Truck };
      case 'delivered':
        return { label: 'ডেলিভার্ড', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 };
      case 'cancelled':
        return { label: 'বাতিল', bg: 'bg-red-500/10 text-red-400 border-red-500/30', icon: XCircle };
      case 'pending':
      default:
        return { label: 'নতুন পেন্ডিং', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Clock };
    }
  };

  // Update status handler
  const handleStatusChange = async (order, newStatus) => {
    const id = order.firestoreId || order.id;
    await updateOrderStatus(id, newStatus);
    showToast(`অর্ডার স্ট্যাটাস '${newStatus}' আপডেট হয়েছে!`);
  };

  // Save courier tracking
  const handleSaveCourier = async () => {
    if (!courierModalOrder) return;
    const id = courierModalOrder.firestoreId || courierModalOrder.id;
    await updateOrderCourier(id, {
      courierName,
      trackingId,
      courierNotes,
    });
    setCourierModalOrder(null);
    showToast('কুরিয়ার ট্র্যাকিং নম্বর সফলভাবে সেভ হয়েছে!');
  };

  // Delete Order
  const handleDeleteOrder = async (order) => {
    if (window.confirm('আপনি কি নিশ্চিতভাবে এই অর্ডারটি ডিলিট করতে চান?')) {
      const id = order.firestoreId || order.id;
      await deleteOrder(id);
      showToast('অর্ডার ডিলিট করা হয়েছে!');
    }
  };

  // Export orders to CSV for Steadfast / Pathao
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('এক্সপোর্ট করার মতো কোনো অর্ডার নেই');
      return;
    }

    const headers = ['Order ID,Customer Name,Phone,Address,Delivery Zone,Total Amount,Payment Method,Status,Date\n'];
    const rows = orders.map((o) => {
      const date = new Date(o.createdAt?.seconds ? o.createdAt.seconds * 1000 : o.createdAt || Date.now()).toLocaleDateString();
      const cleanAddress = (o.address || '').replace(/,/g, ' ');
      const cleanName = (o.customerName || '').replace(/,/g, ' ');
      return `"${o.orderId || o.id}","${cleanName}","${o.phone}","${cleanAddress}","${o.deliveryZone}","${o.total}","${o.paymentMethod || 'COD'}","${o.status}","${date}"\n`;
    });

    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tajwatch_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('অর্ডার CSV ফাইল ডাউনলোড সম্পন্ন হয়েছে!');
  };

  // Product Form Save
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      await updateFirestoreProduct(editingProduct.firestoreId || editingProduct.id, productForm);
      showToast('প্রোডাক্ট সফলভাবে আপডেট হয়েছে!');
    } else {
      const newProd = {
        ...productForm,
        id: `tw-${Date.now()}`,
        slug: productForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      };
      await addFirestoreProduct(newProd);
      showToast('নতুন প্রোডাক্ট সফলভাবে যোগ করা হয়েছে!');
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  // Delete Product
  const handleDeleteProduct = async (prod) => {
    if (window.confirm(`আপনি কি "${prod.banglaName || prod.name}" ডিলিট করতে চান?`)) {
      await deleteFirestoreProduct(prod.firestoreId || prod.id);
      showToast('প্রোডাক্ট মুছে ফেলা হয়েছে!');
    }
  };

  // ==========================================
  // BRAND MANAGEMENT HANDLERS
  // ==========================================
  const handleBrandImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('ছবির সাইজ ২ মেগাবাইট (MB) এর কম হতে হবে!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setBrandForm((prev) => ({
        ...prev,
        logo: uploadEvent.target.result,
      }));
      showToast('ব্র্যান্ড লোগো লোড হয়েছে!');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBrand = async (e) => {
    e.preventDefault();
    if (editingBrand) {
      await updateFirestoreBrand(editingBrand.firestoreId || editingBrand.id, brandForm);
      showToast(`"${brandForm.name}" ব্র্যান্ড আপডেট হয়েছে!`);
    } else {
      const newBrand = {
        ...brandForm,
        id: `brand-${Date.now()}`,
        logo: brandForm.logo || '/assets/brand/logo.jpeg',
      };
      await addFirestoreBrand(newBrand);
      showToast(`নতুন ব্র্যান্ড "${brandForm.name}" সফলভাবে যুক্ত হয়েছে!`);
    }
    setShowBrandModal(false);
    setEditingBrand(null);
  };

  const handleDeleteBrand = async (brand) => {
    if (window.confirm(`আপনি কি "${brand.name}" ব্র্যান্ডটি ডিলিট করতে চান?`)) {
      await deleteFirestoreBrand(brand.firestoreId || brand.id);
      showToast('ব্র্যান্ড ডিলিট করা হয়েছে!');
    }
  };

  // ==========================================
  // FLASH SALE MANAGER CONTROLS
  // ==========================================
  const handleToggleProductFlashSale = async (prod) => {
    const targetId = prod.firestoreId || prod.id;
    const newFlashState = !prod.isFlashSale;

    // 1. Instant Optimistic State Update for 0ms immediate UI check/uncheck
    setProducts((prev) =>
      prev.map((p) => {
        const idMatches =
          (p.firestoreId && p.firestoreId === targetId) ||
          p.id === targetId ||
          p.id === prod.id ||
          (p.firestoreId && prod.firestoreId && p.firestoreId === prod.firestoreId);
        return idMatches ? { ...p, isFlashSale: newFlashState } : p;
      })
    );

    showToast(
      `"${prod.banglaName || prod.name}" ফ্ল্যাশ সেলে ${
        newFlashState ? 'যুক্ত' : 'থেকে বাদ দেওয়া'
      } হয়েছে!`
    );

    // 2. Persist to Firestore with full merged payload
    const docData = {
      ...prod,
      isFlashSale: newFlashState,
    };
    delete docData.firestoreId;

    await updateFirestoreProduct(targetId, docData);
  };

  const handleQuickToggleStock = async (prod) => {
    const targetId = prod.firestoreId || prod.id;
    const isCurrentlyOut = prod.inStock === false || (prod.stock || 0) <= 0;
    const newInStock = isCurrentlyOut;
    const newStockCount = isCurrentlyOut ? (prod.stock > 0 ? prod.stock : 10) : 0;

    // 1. Instant Optimistic State Update
    setProducts((prev) =>
      prev.map((p) => {
        const idMatches =
          (p.firestoreId && p.firestoreId === targetId) ||
          p.id === targetId ||
          p.id === prod.id ||
          (p.firestoreId && prod.firestoreId && p.firestoreId === prod.firestoreId);
        return idMatches
          ? { ...p, inStock: newInStock, stock: newStockCount }
          : p;
      })
    );

    showToast(
      `"${prod.banglaName || prod.name}" এখন ${
        newInStock ? 'স্টকে আছে' : 'স্টক আউট'
      } হিসেবে সেট করা হয়েছে!`
    );

    // 2. Persist to Firestore
    const docData = {
      ...prod,
      inStock: newInStock,
      stock: newStockCount,
    };
    delete docData.firestoreId;

    await updateFirestoreProduct(targetId, docData);
  };

  const handleSaveFlashSaleConfig = async (e) => {
    if (e) e.preventDefault();
    await updateFlashSaleConfig(flashSaleConfig);
    showToast('ফ্ল্যাশ সেল সেটিংস ও সময় সফলভাবে আপডেট হয়েছে!');
  };

  const handleSetFlashDuration = (hours) => {
    setSelectedPresetHours(hours);
    const newEnd = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    setFlashSaleConfig((prev) => ({
      ...prev,
      active: true,
      endTime: newEnd,
    }));
    updateFlashSaleConfig({
      ...flashSaleConfig,
      active: true,
      endTime: newEnd,
    });
    showToast(`ফ্ল্যাশ সেল সময় ${hours >= 24 ? (hours / 24) + ' দিন' : hours + ' ঘন্টা'} সেট করা হয়েছে!`);
  };

  // ==========================================
  // PRODUCT IMAGE WEBP UPLOADER (Gallery / PC)
  // Auto-converts any image to high-perf WebP
  // ==========================================
  const handleProductMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsConvertingImage(true);
      const result = await convertFileToWebP(file, 1000, 0.85);
      setProductForm((prev) => ({
        ...prev,
        image: result.webpDataUrl,
      }));
      setImageCompressionInfo({
        original: result.originalSizeKB,
        webp: result.webpSizeKB,
        saved: result.savedPercent,
      });
      showToast(`ঘড়ির ছবি WebP ফরম্যাটে কনভার্ট সম্পন্ন! ${result.savedPercent}% সাইজ সেভ হয়েছে।`);
    } catch (err) {
      console.error('Image optimization failed:', err);
      showToast('ছবি কনভার্ট করতে সমস্যা হয়েছে, অন্য ছবি নির্বাচন করুন।');
    } finally {
      setIsConvertingImage(false);
    }
  };

  const handleProductGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setIsConvertingImage(true);
      const convertedUrls = [];
      for (const f of files) {
        const res = await convertFileToWebP(f, 900, 0.82);
        convertedUrls.push(res.webpDataUrl);
      }
      setProductForm((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), ...convertedUrls],
      }));
      showToast(`${files.length} টি অতিরিক্ত ছবি WebP ফরম্যাটে যুক্ত করা হয়েছে!`);
    } catch (err) {
      console.error('Gallery image optimization error:', err);
    } finally {
      setIsConvertingImage(false);
    }
  };

  // ==========================================
  // REVIEW IMAGE UPLOADER (Gallery / PC Picker)
  // ==========================================
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert('ছবির সাইজ ২.৫ মেগাবাইট (MB) এর কম হতে হবে!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      setReviewForm((prev) => ({
        ...prev,
        image: base64Data,
        wristPhoto: base64Data,
      }));
      showToast('ছবি সফলভাবে লোড হয়েছে!');
    };
    reader.readAsDataURL(file);
  };

  // Review Form Save
  const handleSaveReview = async (e) => {
    e.preventDefault();
    await addFirestoreReview({
      ...reviewForm,
      wristPhoto: reviewForm.image || reviewForm.wristPhoto || '',
      avatar: reviewForm.image || '',
      verified: true,
      timeAgo: 'এইমাত্র',
    });
    setShowReviewModal(false);
    setReviewForm({
      name: '',
      location: 'ঢাকা',
      rating: 5,
      product: '',
      comment: '',
      image: '',
      wristPhoto: '',
      verified: true,
    });
    showToast('নতুন রিভিউ সফলভাবে যুক্ত হয়েছে!');
  };

  // Delete Review
  const handleDeleteReview = async (rev) => {
    if (window.confirm('এই কাস্টমার রিভিউটি কি ডিলিট করতে চান?')) {
      await deleteFirestoreReview(rev.firestoreId || `rev-${rev.id}`);
      showToast('রিভিউ ডিলিট করা হয়েছে!');
    }
  };

  // Settings Save (Hotline, Email, Showroom Address, Delivery Fees, Telegram Bot)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('tajwatch_store_settings', JSON.stringify(settingsForm));
    } catch {
      // ignore
    }
    await updateFirestoreStoreSettings(settingsForm);
    setSettings(settingsForm);
    showToast('স্টোর সেটিংস সফলভাবে আপডেট হয়েছে!');
  };

  // Computed KPIs
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrdersCount = orders.filter((o) => !o.status || o.status === 'pending').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'delivered').length;
  const flashSaleProductsCount = products.filter((p) => p.isFlashSale).length;

  // Month calculation for Auto-Archiving & 25th Warning
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();
  const isEndOfMonthAlert = now.getDate() >= 25;

  const monthNamesBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  // Filtered orders list with monthly isolation
  const filteredOrders = orders.filter((order) => {
    // 1. Month filter:
    if (orderMonthFilter === 'current') {
      const oTime = order.createdAt?.seconds ? order.createdAt.seconds * 1000 : new Date(order.createdAt || 0).getTime();
      const d = new Date(oTime);
      if (!isNaN(d.getTime())) {
        if (d.getFullYear() !== currentYear || d.getMonth() !== currentMonth) {
          return false;
        }
      }
    } else if (orderMonthFilter === 'previous') {
      const oTime = order.createdAt?.seconds ? order.createdAt.seconds * 1000 : new Date(order.createdAt || 0).getTime();
      const d = new Date(oTime);
      if (!isNaN(d.getTime())) {
        if (d.getFullYear() !== prevYear || d.getMonth() !== prevMonth) {
          return false;
        }
      }
    }

    // 2. Status filter
    const matchesStatus = statusFilter === 'all' ? true : (order.status || 'pending') === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;
    const matchesSearch =
      (order.customerName && order.customerName.toLowerCase().includes(q)) ||
      (order.phone && order.phone.includes(q)) ||
      (order.orderId && order.orderId.toLowerCase().includes(q)) ||
      (order.trackingId && order.trackingId.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 font-sans pb-24 md:pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0d111a]/95 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Brand & Database Status */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-amber-500/40 shrink-0">
              <img
                src="/assets/brand/logo.jpeg"
                alt="TAJ WATCH"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-serif font-black text-sm sm:text-base tracking-wide text-white">
                  TAJ <span className="text-amber-500">WATCH</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                  Admin Hub
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold">Firebase Live</span>
                <span className="hidden md:inline text-zinc-500">• taj-watch-1c74b</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              onClick={() => navigate('/admin/security')}
              className="px-2.5 sm:px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-amber-500/50 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="ইউজারনেম ও পাসওয়ার্ড পরিবর্তন"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">পাসওয়ার্ড পরিবর্তন</span>
            </button>

            <button
              onClick={() => window.open('/', '_blank')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="ওয়েবসাইট দেখুন"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>স্টোর দেখুন</span>
            </button>

            <button
              onClick={handleSeedData}
              disabled={isSyncing}
              className="px-2.5 sm:px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ডিফল্ট ডেটা সিঙ্ক করুন"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">ফায়ারবেজ ডেটা সিঙ্ক</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-2.5 sm:px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="লগআউট"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        
        {/* Metric KPI Cards (4 Devices Optimized) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">সর্বমোট বিক্রয়</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-black text-amber-400 mt-2">
              ৳ {totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">সফল ও রানিং মোট বিল</p>
          </div>

          <div className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">মোট অর্ডার</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-black text-white mt-2">
              {orders.length} <span className="text-xs font-sans font-normal text-zinc-400">টি</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">সব চ্যানেলের অর্ডার</p>
          </div>

          <div className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">নতুন পেন্ডিং</span>
              <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-black text-red-400 mt-2">
              {pendingOrdersCount} <span className="text-xs font-sans font-normal text-zinc-400">টি</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">কল বা কনফার্মেশন অপেক্ষমান</p>
          </div>

          <div className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">ব্র্যান্ড ও ফ্ল্যাশ সেল</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Award className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-black text-amber-400 mt-2">
              {brands.length} <span className="text-xs font-sans font-normal text-zinc-400">টি ব্র্যান্ড</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">
              ফ্ল্যাশ সেলে: <strong className="text-red-400 font-mono">{flashSaleProductsCount} টি ঘড়ি</strong>
            </p>
          </div>

        </div>

        {/* Tab Navigation Switcher (6 Main Tabs + Security Link) */}
        <div className="flex items-center overflow-x-auto no-scrollbar gap-2 p-1.5 bg-[#0e131f] border border-zinc-800/80 rounded-2xl">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>অর্ডারসমূহ</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'orders' ? 'bg-black text-amber-400' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>প্রোডাক্ট ও স্টক</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'products' ? 'bg-black text-amber-400' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {products.length}
            </span>
          </button>

          {/* Brands Tab */}
          <button
            onClick={() => setActiveTab('brands')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'brands'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>ব্র্যান্ড ব্যবস্থাপনা</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'brands' ? 'bg-black text-amber-400' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {brands.length}
            </span>
          </button>

          {/* Flash Sale Tab */}
          <button
            onClick={() => setActiveTab('flashsale')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'flashsale'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Flame className="w-4 h-4 fill-current text-red-400" />
            <span>ফ্ল্যাশ সেল কন্ট্রোল</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'flashsale' ? 'bg-black text-red-400' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {flashSaleProductsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>৩ডি কাস্টমার রিভিউ</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'reviews' ? 'bg-black text-amber-400' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {reviews.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>স্টোর সেটিংস</span>
          </button>

          <button
            onClick={() => navigate('/admin/security')}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent hover:border-amber-500/40"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>পাসওয়ার্ড পরিবর্তন পেজ</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: ORDERS MANAGEMENT                                       */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* 25th of the Month PDF Warning Banner */}
            {isEndOfMonthAlert && (
              <div className="bg-gradient-to-r from-amber-950/70 via-red-950/50 to-amber-950/70 border-2 border-amber-500/70 rounded-2xl p-4 sm:p-5 shadow-xl shadow-amber-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-pulse-slow">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-red-600/40 text-red-300 border border-red-500/50 text-[10px] font-black uppercase tracking-wider">
                        জরুরী সতর্কতা • ২৫ তারিখ রিমাইন্ডার
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        চলতি মাস: {monthNamesBn[currentMonth]} {currentYear}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm sm:text-base mt-1">
                      চলতি মাসের সেলস ও অর্ডারের PDF রিপোর্ট এখনই ডাউনলোড করুন!
                    </h4>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      আজ মাসের {now.getDate()} তারিখ। আগামী ১ তারিখে অ্যাডমিন প্যানেলে চলতি মাসের অর্ডার তালিকা নতুন মাসের জন্য স্বয়ংক্রিয়ভাবে রিফ্রেশ হয়ে যাবে। ক্লাউড ফায়ারবেজ ডেটাবেজে বিগত ২ মাসের সব অর্ডার ব্যাকআপ হিসেবে জমা থাকবে। তবে আপনার ব্যক্তিগত ফাইলিং ও প্রিন্টের জন্য এখনই পূর্ণাঙ্গ PDF কপি সেভ করে নিন।
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setOrderMonthFilter('current');
                    setShowMonthlyReportModal(true);
                  }}
                  className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/30 shrink-0"
                >
                  <FileText className="w-4 h-4" />
                  <span>চলতি মাসের PDF ডাউনলোড করুন</span>
                </button>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
              
              {/* Month Archiving Filter Pills & PDF Download */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">মাস নির্বাচন:</span>
                  {[
                    { id: 'current', label: `চলতি মাস (${monthNamesBn[currentMonth]})` },
                    { id: 'previous', label: `বিগত মাস (${monthNamesBn[prevMonth]})` },
                    { id: 'all', label: 'সব অর্ডার (২ মাসের ব্যাকআপ)' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setOrderMonthFilter(m.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                        orderMonthFilter === m.id
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowMonthlyReportModal(true)}
                  className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                  title="মাসিক রিপোর্ট প্রিন্ট অথবা PDF সংরক্ষণ করুন"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>মাসিক হিসাব PDF প্রিন্ট</span>
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="নাম, ফোন নম্বর, বা অর্ডার আইডি দিয়ে খুঁজুন..."
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs cursor-pointer"
                    >
                      মুছুন
                    </button>
                  )}
                </div>

                {/* Export CSV Button */}
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>কুরিয়ার CSV এক্সপোর্ট (Steadfast/Pathao)</span>
                </button>

              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-zinc-800/60 text-xs">
                {[
                  { id: 'all', label: 'সব অর্ডার' },
                  { id: 'pending', label: 'নতুন পেন্ডিং' },
                  { id: 'confirmed', label: 'কনফার্মড' },
                  { id: 'shipped', label: 'শিপড' },
                  { id: 'delivered', label: 'ডেলিভার্ড' },
                  { id: 'cancelled', label: 'বাতিল' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setStatusFilter(chip.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      statusFilter === chip.id
                        ? 'bg-zinc-200 text-black'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Feed */}
            {filteredOrders.length === 0 ? (
              <div className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-12 text-center text-zinc-500">
                <ShoppingBag className="w-12 h-12 mx-auto text-zinc-700 mb-3" />
                <p className="text-base font-bold text-zinc-400">কোনো অর্ডার পাওয়া যায়নি</p>
                <p className="text-xs text-zinc-600 mt-1">
                  নতুন অর্ডার আসার সাথে সাথে রিয়েল-টাইমে এখানে দৃশ্যমান হবে।
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const BadgeIcon = badge.icon;
                  const orderDate = new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt || Date.now());

                  return (
                    <div
                      key={order.firestoreId || order.id}
                      className="bg-[#0e131f] border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-4 sm:p-5 transition-all shadow-md"
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-zinc-800/60 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span className="font-mono font-black text-amber-400 text-sm sm:text-base tracking-wider">
                            {order.orderId || `#TW-${order.id?.slice(0, 8)}`}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {orderDate.toLocaleDateString('en-GB')} • {orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                            <BadgeIcon className="w-3.5 h-3.5" />
                            <span>{badge.label}</span>
                          </span>
                        </div>

                        {/* Status Change Dropdown */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                          <span className="text-xs font-bold text-zinc-400">স্ট্যাটাস:</span>
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm"
                          >
                            <option value="pending">পেন্ডিং (Pending)</option>
                            <option value="confirmed">কনফার্মড (Confirmed)</option>
                            <option value="shipped">শিপড (Shipped)</option>
                            <option value="delivered">ডেলিভার্ড (Delivered)</option>
                            <option value="cancelled">বাতিল (Cancelled)</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer Details & Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3.5">
                        
                        {/* Column 1: Customer & Phone */}
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-1">গ্রাহক বিবরণী:</p>
                          <p className="font-bold text-white text-sm sm:text-base tracking-wide">{order.customerName}</p>
                          <p className="font-mono font-black text-amber-400 text-xs sm:text-sm mt-0.5 tracking-wider">{order.phone}</p>
                          <div className="text-xs text-zinc-300 mt-2 leading-relaxed bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/80 break-words">
                            <span className="text-[10px] font-bold text-zinc-500 block mb-0.5">ডেলিভারি ঠিকানা:</span>
                            {order.address}
                          </div>

                          {/* 1-Tap Quick Communication Buttons (Mobile & Desktop) */}
                          <div className="flex items-center gap-2 mt-3">
                            <a
                              href={`tel:${order.phone}`}
                              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow shadow-red-600/30"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>কল দিন</span>
                            </a>
                            <a
                              href={`https://wa.me/88${order.phone?.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow shadow-emerald-600/30"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>

                        {/* Column 2: Items Purchased */}
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-1">অর্ডারকৃত পণ্য:</p>
                          <div className="space-y-1.5">
                            {(order.items || []).map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-xs bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800/80">
                                <div>
                                  <p className="font-bold text-zinc-100 line-clamp-1">{item.name}</p>
                                  {item.selectedColor && (
                                    <span className="inline-block text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded mt-1">
                                      কালার: {item.selectedColor}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                  <span className="font-mono text-zinc-400 text-xs">{item.quantity} x </span>
                                  <span className="font-mono font-bold text-amber-400 text-xs">৳ {Number(item.price || 0).toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {order.notes && (
                            <p className="text-[11px] text-zinc-400 italic mt-2 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800/50">
                              &ldquo;{order.notes}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Column 3: Billing & Courier Info */}
                        <div className="flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-1">বিল ও মূল্য বিবরণী:</p>
                            <div className="space-y-2 text-xs bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                              <div className="flex justify-between items-center text-zinc-400">
                                <span>সাবটোটাল:</span>
                                <span className="font-mono font-bold text-zinc-200">৳ {Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between items-center text-zinc-400">
                                <span>ডেলিভারি চার্জ:</span>
                                <span className="font-mono font-bold text-zinc-200">৳ {Number(order.deliveryFee || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm font-black text-amber-400 border-t border-zinc-800 pt-2 mt-1">
                                <span>সর্বমোট প্রদেয়:</span>
                                <span className="font-mono text-base font-black text-amber-400">৳ {Number(order.total || 0).toLocaleString('en-IN')}</span>
                              </div>
                            </div>

                            {/* Courier Info Badge */}
                            {order.trackingId ? (
                              <div className="mt-2.5 p-2 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs">
                                <p className="text-[10px] uppercase font-bold text-purple-300">
                                  {order.courierName || 'Steadfast'} কুরিয়ার কোড:
                                </p>
                                <p className="font-mono font-bold text-white">{order.trackingId}</p>
                              </div>
                            ) : null}
                          </div>

                          {/* Bottom Action Buttons (Invoice & Courier Code buttons hidden as requested) */}
                          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800/60">
                            {/* 
                              // Hidden by request: "ইনভয়েস" ও "কুরিয়ার কোড" বাটন দুটি ক্লায়েন্টের জন্য পরবর্তীতে অতিরিক্ত চার্জের সুবিধার অংশ হিসেবে আপাতত বন্ধ/হাইড রাখা হলো
                              <button
                                onClick={() => setSelectedInvoiceOrder(order)}
                                className="flex-1 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-400" />
                                <span>ইনভয়েস</span>
                              </button>

                              <button
                                onClick={() => {
                                  setCourierModalOrder(order);
                                  setCourierName(order.courierName || 'Steadfast');
                                  setTrackingId(order.trackingId || '');
                                  setCourierNotes(order.courierNotes || '');
                                }}
                                className="flex-1 py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5 text-purple-400" />
                                <span>কুরিয়ার কোড</span>
                              </button>
                            */}

                            <button
                              onClick={() => handleDeleteOrder(order)}
                              className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                              title="অর্ডার ডিলিট"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>অর্ডার মুছুন</span>
                            </button>
                          </div>

                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PRODUCTS & INVENTORY                                    */}
        {/* ============================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Action Bar with 50-Product Capacity Indicator */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-bold text-white text-base">প্রোডাক্ট ও স্টক ব্যবস্থাপনা</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    products.length >= 50
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}>
                    স্টোর ধারণক্ষমতা: {products.length} / ৫০ টি ঘড়ি
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  সরাসরি স্টক পরিবর্তন, ব্র্যান্ড নির্ধারণ এবং নতুন ঘড়ি যোগ করুন। (ওয়েবসাইটে সর্বোচ্চ ৫০টি পণ্য প্রদর্শিত হবে)।
                </p>
              </div>

              <button
                onClick={() => {
                  if (products.length >= 50) {
                    alert('ওয়েবসাইটে সর্বোচ্চ ৫০টি ঘড়ি প্রদর্শনের সীমা পূর্ণ হয়েছে! নতুন প্রোডাক্ট যোগ করতে কোনো পুরাতন প্রোডাক্ট ডিলিট করুন।');
                    return;
                  }
                  setEditingProduct(null);
                  setImageCompressionInfo(null);
                  setProductForm({
                    name: '',
                    banglaName: '',
                    category: 'wrist_watch',
                    brand: brands[0]?.name || 'Audemars Piguet',
                    price: 3500,
                    originalPrice: 5500,
                    stock: 25,
                    isFlashSale: false,
                    inStock: true,
                    image: '',
                    gallery: [],
                    description: '',
                  });
                  setShowProductModal(true);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন প্রোডাক্ট যোগ করুন</span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <div
                  key={prod.firestoreId || prod.id}
                  className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                      <img
                        src={prod.image || '/assets/brand/logo.jpeg'}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/assets/brand/logo.jpeg'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                          {prod.category}
                        </span>
                        {prod.brand && (
                          <span className="text-[10px] font-bold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
                            {prod.brand}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1 truncate">{prod.banglaName || prod.name}</h4>
                      <p className="text-xs text-zinc-500 truncate">{prod.name}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-amber-400 text-sm">৳{prod.price}</span>
                        {prod.originalPrice && (
                          <span className="text-xs text-zinc-500 line-through">৳{prod.originalPrice}</span>
                        )}
                        {prod.isFlashSale && (
                          <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded">
                            🔥 ফ্ল্যাশ সেল
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock & Controls */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-zinc-400">স্টক:</span>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        prod.inStock === false || (prod.stock || 0) <= 0
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : (prod.stock || 0) > 5
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {prod.stock || 0} টি
                      </span>

                      <button
                        type="button"
                        onClick={() => handleQuickToggleStock(prod)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer border ${
                          prod.inStock === false || (prod.stock || 0) <= 0
                            ? 'bg-red-600/20 text-red-400 border-red-500/40 hover:bg-red-600/30'
                            : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-600/30'
                        }`}
                        title="ক্লিক করে স্টক স্ট্যাটাস পরিবর্তন করুন"
                      >
                        {prod.inStock === false || (prod.stock || 0) <= 0 ? 'স্টক আউট' : 'ইন স্টক'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleProductFlashSale(prod)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          prod.isFlashSale
                            ? 'bg-red-600 text-white'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                        }`}
                        title={prod.isFlashSale ? 'ফ্ল্যাশ সেল থেকে সরান' : 'ফ্ল্যাশ সেলে যুক্ত করুন'}
                      >
                        <Flame className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setProductForm({
                            name: prod.name || '',
                            banglaName: prod.banglaName || '',
                            category: prod.category || 'wrist_watch',
                            brand: prod.brand || brands[0]?.name || 'Audemars Piguet',
                            price: prod.price || 0,
                            originalPrice: prod.originalPrice || 0,
                            stock: prod.stock || 0,
                            isFlashSale: !!prod.isFlashSale,
                            inStock: prod.inStock !== false,
                            image: prod.image || '',
                            description: prod.description || '',
                          });
                          setShowProductModal(true);
                        }}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors cursor-pointer"
                        title="এডিট"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(prod)}
                        className="p-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="ডিলিট"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: BRAND MANAGEMENT (NEW WATCH BRANDS HUB)                 */}
        {/* ============================================================== */}
        {activeTab === 'brands' && (
          <div className="space-y-4">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-base">ঘড়ির ব্র্যান্ড ব্যবস্থাপনা (Watch Brands Hub)</h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  এখানে ক্লায়েন্ট যেকোনো নতুন ঘড়ির ব্র্যান্ড যোগ করতে পারবে এবং প্রোডাক্ট আপলোড করার সময় সেই ব্র্যান্ডটি সিলেক্ট করতে পারবে।
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingBrand(null);
                  setBrandForm({
                    name: '',
                    nameBn: '',
                    origin: 'Switzerland',
                    logo: '',
                    featured: true,
                  });
                  setShowBrandModal(true);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন ব্র্যান্ড যোগ করুন</span>
              </button>
            </div>

            {/* Brands Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {brands.map((brand) => {
                const brandProductsCount = products.filter(
                  (p) => p.brand && p.brand.toLowerCase() === brand.name.toLowerCase()
                ).length;

                return (
                  <div
                    key={brand.firestoreId || brand.id}
                    className="bg-[#0e131f] border border-zinc-800/80 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700/80 overflow-hidden flex items-center justify-center p-1">
                          <img
                            src={brand.logo || '/assets/brand/logo.jpeg'}
                            alt={brand.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => { e.target.src = '/assets/brand/logo.jpeg'; }}
                          />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {brand.origin || 'International'}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm sm:text-base">{brand.name}</h4>
                      {brand.nameBn && (
                        <p className="text-xs text-zinc-400 mt-0.5">{brand.nameBn}</p>
                      )}

                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          {brandProductsCount} টি ঘড়ি তালিকায়
                        </span>
                        {brand.featured && (
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            ★ ফিচার্ড
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2 text-xs">
                      <button
                        onClick={() => {
                          setEditingBrand(brand);
                          setBrandForm({
                            name: brand.name || '',
                            nameBn: brand.nameBn || '',
                            origin: brand.origin || 'Switzerland',
                            logo: brand.logo || '',
                            featured: brand.featured !== false,
                          });
                          setShowBrandModal(true);
                        }}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>এডিট</span>
                      </button>

                      <button
                        onClick={() => handleDeleteBrand(brand)}
                        className="p-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="ডিলিট"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: FLASH SALE MANAGER                                      */}
        {/* ============================================================== */}
        {activeTab === 'flashsale' && (
          <div className="space-y-6">
            
            {/* Flash Sale Control Box */}
            <div className="bg-[#0e131f] border border-red-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-zinc-800/80 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
                      <Flame className="w-5 h-5 fill-white" />
                    </div>
                    <h3 className="font-black text-lg sm:text-xl text-white">ফ্ল্যাশ সেল অফার ও টাইমার নিয়ন্ত্রণ</h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    কখন ফ্ল্যাশ সেল শেষ হবে, কোন কোন ঘড়ি অফারে থাকবে তা এখান থেকে নির্ধারণ করুন। সময় শেষ হলে অফার স্বয়ংক্রিয়ভাবে সাধারণ সেকশনে রূপান্তরিত হবে।
                  </p>
                </div>

                {/* Main Toggle Switch */}
                <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-700 p-2 rounded-2xl">
                  <span className="text-xs font-bold text-zinc-300">ফ্ল্যাশ সেল স্ট্যাটাস:</span>
                  <button
                    onClick={() => {
                      const newActive = !flashSaleConfig.active;
                      setFlashSaleConfig((prev) => ({ ...prev, active: newActive }));
                      updateFlashSaleConfig({ ...flashSaleConfig, active: newActive });
                      showToast(`ফ্ল্যাশ সেল অফার ${newActive ? 'চালু' : 'বন্ধ'} করা হয়েছে!`);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      flashSaleConfig.active
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {flashSaleConfig.active ? '🔥 সক্রিয় (Active)' : 'অফ (Inactive)'}
                  </button>
                </div>
              </div>

              {/* Countdown Time Presets & Custom Picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                
                {/* Left: Quick Duration Buttons */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-zinc-300">
                    ⏱️ দ্রুত সময় নির্বাচন করুন (Quick Durations):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { hours: 6, label: '৬ ঘন্টা' },
                      { hours: 12, label: '১২ ঘন্টা' },
                      { hours: 24, label: '২৪ ঘন্টা (১ দিন)' },
                      { hours: 48, label: '৪৮ ঘন্টা (২ দিন)' },
                      { hours: 72, label: '৩ দিন' },
                      { hours: 168, label: '৭ দিন' },
                    ].map((preset) => (
                      <button
                        key={preset.hours}
                        onClick={() => handleSetFlashDuration(preset.hours)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          selectedPresetHours === preset.hours
                            ? 'bg-red-600 text-white border-2 border-red-400 shadow-lg shadow-red-600/40 ring-2 ring-red-500/20'
                            : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-red-500/50 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 opacity-70" />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Manual Datetime Picker with Local Timezone Accuracy */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-zinc-400 mb-1">
                      নির্দিষ্ট তারিখ ও সময় নির্ধারণ:
                    </label>
                    <input
                      type="datetime-local"
                      value={toLocalISOString(flashSaleConfig.endTime)}
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const localDate = new Date(e.target.value);
                        const val = localDate.toISOString();
                        setSelectedPresetHours(null);
                        setFlashSaleConfig((prev) => ({ ...prev, endTime: val }));
                      }}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Right: Live Countdown Status Box */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                      লাইভ কাউন্টডাউন প্রিভিউ (Live Preview):
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1">{flashSaleConfig.title}</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{flashSaleConfig.subtitle}</p>

                    <div className="mt-4 p-3.5 bg-black/60 border border-red-500/30 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>অফার সমাপ্তির লাইভ কাউন্টার:</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          flashRemaining.isExpired ? 'bg-zinc-800 text-zinc-400' : 'bg-red-600 text-white animate-pulse'
                        }`}>
                          {flashRemaining.isExpired ? 'সমাপ্ত' : 'চলমান'}
                        </span>
                      </div>

                      {/* Realtime Ticking Countdown Display */}
                      <div className="grid grid-cols-4 gap-1.5 text-center py-1">
                        <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-1.5">
                          <p className="font-mono text-base font-black text-white">{flashRemaining.days}</p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase">দিন</p>
                        </div>
                        <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-1.5">
                          <p className="font-mono text-base font-black text-red-400">
                            {String(flashRemaining.hours).padStart(2, '0')}
                          </p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase">ঘন্টা</p>
                        </div>
                        <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-1.5">
                          <p className="font-mono text-base font-black text-amber-400">
                            {String(flashRemaining.minutes).padStart(2, '0')}
                          </p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase">মিনিট</p>
                        </div>
                        <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-1.5">
                          <p className="font-mono text-base font-black text-emerald-400 animate-pulse">
                            {String(flashRemaining.seconds).padStart(2, '0')}
                          </p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase">সেকেন্ড</p>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500">অফার শেষ হবে:</span>
                        <span className="font-mono text-xs font-bold text-red-400">
                          {new Date(flashSaleConfig.endTime).toLocaleString('bn-BD', {
                            dateStyle: 'medium',
                            timeStyle: 'medium',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveFlashSaleConfig}
                    className="mt-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/30"
                  >
                    <Save className="w-4 h-4" />
                    <span>ফ্ল্যাশ সেল সেটিংস সংরক্ষণ করুন</span>
                  </button>
                </div>

              </div>

            </div>

            {/* Flash Sale Product Picker List */}
            <div className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-5">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <h4 className="font-bold text-white text-base">ফ্ল্যাশ সেলে অন্তর্ভুক্ত ঘড়ি নির্বাচন করুন</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    যেসব ঘড়িতে টিক দেওয়া থাকবে সেগুলো সরাসরি হোমপেজের ফ্ল্যাশ সেল অফার সেকশনে শো করবে।
                  </p>
                </div>
                <span className="font-bold text-xs bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full">
                  {flashSaleProductsCount} টি ঘড়ি অফারে যুক্ত
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                {products.map((prod) => (
                  <div
                    key={prod.firestoreId || prod.id}
                    onClick={() => handleToggleProductFlashSale(prod)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      prod.isFlashSale
                        ? 'bg-red-950/20 border-red-500/60 shadow-lg shadow-red-950/30'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                        <img
                          src={prod.image || '/assets/brand/logo.jpeg'}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/assets/brand/logo.jpeg'; }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-white truncate">{prod.banglaName || prod.name}</h5>
                        <p className="font-mono text-xs font-bold text-amber-400 mt-0.5">৳{prod.price}</p>
                        <span className="text-[10px] text-zinc-400">স্টক: {prod.stock || 0} টি</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs border ${
                        prod.isFlashSale
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-zinc-800 text-transparent border-zinc-700'
                      }`}>
                        ✓
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: 3D REVIEWS MANAGEMENT                                   */}
        {/* ============================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-4">
              <div>
                <h3 className="font-bold text-white text-base">৩ডি কভারফ্লো কাস্টমার রিভিউ</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  হোমপেজের ৩ডি স্লাইডারে থাকা কাস্টমারদের হাতের ছবি ও মতামত যোগ বা পরিবর্তন করুন। (ছবি ছাড়া দিলে ডিফল্ট প্রোফাইল আইকন থাকবে)
                </p>
              </div>
              <button
                onClick={() => {
                  setReviewForm({
                    name: '',
                    location: 'ঢাকা',
                    rating: 5,
                    product: products[0]?.name || 'Audemars Piguet Royal Oak',
                    comment: '',
                    image: '',
                    wristPhoto: '',
                    verified: true,
                  });
                  setShowReviewModal(true);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন রিভিউ যোগ করুন</span>
              </button>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.firestoreId || rev.id}
                  className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {rev.wristPhoto || rev.avatar ? (
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 overflow-hidden shrink-0">
                          <img
                            src={rev.wristPhoto || rev.avatar}
                            alt={rev.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/assets/brand/logo.jpeg'; }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600/30 to-zinc-900 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-base shrink-0 shadow-inner">
                          {rev.name ? rev.name.slice(0, 1) : 'U'}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-xs truncate">{rev.name}</h4>
                          <span className="text-[10px] text-emerald-400">✓ ভেরিফাইড</span>
                        </div>
                        <p className="text-[10px] text-zinc-400">{rev.location || 'ঢাকা'}</p>
                        <div className="flex items-center gap-1 text-amber-400 text-xs mt-0.5">
                          {'★'.repeat(rev.rating || 5)}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 italic line-clamp-3 bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/60">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-zinc-500 truncate max-w-[170px]">{rev.product}</span>
                    <button
                      onClick={() => handleDeleteReview(rev)}
                      className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ডিলিট</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: STORE & ACCOUNT SETTINGS                                */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Box 1: Store Contact, Email & Showroom Info */}
            <div className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <h3 className="font-bold text-white text-base">স্টোর, শোরুম ও কুরিয়ার সেটিংস</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  ওয়েবসাইটে প্রদর্শিত হটলাইন, অফিসিয়াল ইমেইল এবং শোরুমের ঠিকানা পরিবর্তন করুন।
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">কাস্টমার কেয়ার হটলাইন নম্বর</label>
                  <input
                    type="text"
                    value={settingsForm.hotline || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hotline: e.target.value })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">WhatsApp নম্বর</label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">অফিসিয়াল ইমেইল এড্রেস (Store Email)</label>
                  <input
                    type="email"
                    value={settingsForm.email || 'tajwatchbangladesh@gmail.com'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">শোরুম / অফিসের পূর্ণাঙ্গ ঠিকানা (Showroom Address)</label>
                  <textarea
                    rows={2}
                    value={settingsForm.showroomAddress || 'লেভেল ৪, ব্লক সি, যমুনা ফিউচার পার্ক / বসুন্ধরা সিটি, ঢাকা'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, showroomAddress: e.target.value })}
                    placeholder="আপনার শোরুমের পূর্ণাঙ্গ ঠিকানা দিন..."
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">শোরুম খোলা থাকার সময়সূচি (Showroom Schedule)</label>
                  <input
                    type="text"
                    value={settingsForm.showroomSchedule || 'প্রতিদিন সকাল ১০:০০ - রাত ৯:০০'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, showroomSchedule: e.target.value })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-zinc-300 mb-1">ঢাকার ভিতরের ডেলিভারি চার্জ (৳)</label>
                    <input
                      type="number"
                      value={settingsForm.deliveryFeeDhaka || 80}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeDhaka: Number(e.target.value) })}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-300 mb-1">ঢাকার বাইরের ডেলিভারি চার্জ (৳)</label>
                    <input
                      type="number"
                      value={settingsForm.deliveryFeeOutside || 150}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeOutside: Number(e.target.value) })}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>

                {/* Telegram Bot Notification Config */}
                <div className="pt-3 border-t border-zinc-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="font-bold text-white text-xs">টেলিগ্রাম বট নোটিফিকেশন কনফিগ:</h4>
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-300 mb-1">Telegram Bot Token</label>
                    <input
                      type="text"
                      value={settingsForm.telegramBotToken || '9089494454:AAEK_zfJdsDfY-9RdxOE9JxszxEXflxVP1M'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, telegramBotToken: e.target.value })}
                      placeholder="9089494454:AAEK_zfJdsDfY-..."
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-300 mb-1">Telegram Chat ID</label>
                    <input
                      type="text"
                      value={settingsForm.telegramChatId || '8896683647'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, telegramChatId: e.target.value })}
                      placeholder="8896683647"
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>স্টোর সেটিংস সংরক্ষণ করুন</span>
                </button>
              </form>
            </div>

            {/* Box 2: Dedicated Security & Password Page Card */}
            <div className="bg-[#0e131f] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">এডমিন ইউজারনেম ও পাসওয়ার্ড পরিবর্তন</h3>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      নিরাপত্তার স্বার্থে পাসওয়ার্ড পরিবর্তনের জন্য আলাদা পূর্ণাঙ্গ সিকিউরিটি পেজ তৈরি করা হয়েছে।
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>ইউজারনেম ও পাসওয়ার্ড সরাসরি Firebase Firestore-এ নিরাপদে সেভ হয়।</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>বর্তমান পাসওয়ার্ড যাচাই করে নতুন পাসওয়ার্ড সেট করার ফুল সিকিউরিটি সুবিধা।</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/admin/security')}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <KeyRound className="w-4 h-4" />
                <span>পাসওয়ার্ড পরিবর্তন পেজে প্রবেশ করুন →</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* MODALS: COURIER TRACKING ID                                    */}
      {/* ============================================================== */}
      {courierModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#0d111a] border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="font-bold text-white text-sm">কুরিয়ার ট্র্যাকিং কোড যুক্ত করুন</h3>
              <button
                onClick={() => setCourierModalOrder(null)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">কুরিয়ার সার্ভিস</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold"
                >
                  <option value="Steadfast">Steadfast Courier</option>
                  <option value="Pathao">Pathao Courier</option>
                  <option value="RedX">RedX</option>
                  <option value="Paperfly">Paperfly</option>
                  <option value="Sundarban">সুন্দরবন কুরিয়ার</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">কনসাইনমেন্ট / ট্র্যাকিং আইডি</label>
                <input
                  type="text"
                  placeholder="যেমন: ST-9823412"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl font-mono text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">কুরিয়ার নোট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: পার্সেল বুকিং সম্পন্ন"
                  value={courierNotes}
                  onChange={(e) => setCourierNotes(e.target.value)}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSaveCourier}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow"
              >
                সংরক্ষণ করুন
              </button>
              <button
                onClick={() => setCourierModalOrder(null)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODALS: ADD / EDIT PRODUCT                                     */}
      {/* ============================================================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0d111a] border border-zinc-800 rounded-3xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="font-bold text-white text-sm">
                {editingProduct ? 'প্রোডাক্ট তথ্য এডিট করুন' : 'নতুন ঘড়ি / প্রোডাক্ট যোগ করুন'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-300 mb-1">প্রোডাক্টের নাম (বাংলা)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ওডেমার্স পিগে রয়্যাল ওক অটোমেটিক"
                  value={productForm.banglaName}
                  onChange={(e) => setProductForm({ ...productForm, banglaName: e.target.value })}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">প্রোডাক্টের নাম (ইংরেজি)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Audemars Piguet Royal Oak Skeleton"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">ক্যাটাগরি</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold"
                  >
                    <option value="wrist_watch">হাতের ঘড়ি (Wrist Watch)</option>
                    <option value="wall_clock">দেয়াল ঘড়ি (Wall Clock)</option>
                    <option value="smart_watch">স্মার্ট ওয়াচ</option>
                    <option value="table_clock">টেবিল ঘড়ি</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">ব্র্যান্ড (Brand)</label>
                  <select
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold"
                  >
                    {brands.map((b) => (
                      <option key={b.id || b.name} value={b.name}>
                        {b.name} ({b.nameBn || b.origin || 'Brand'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">বিক্রয় মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">আসল/পূর্বমূল্য (৳)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">স্টক পরিমাণ</label>
                <input
                  type="number"
                  required
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-mono"
                />
              </div>

              {/* Product Main Image Uploader (Gallery / PC with Auto-WebP) */}
              <div className="space-y-2 pt-1 border-t border-zinc-800">
                <label className="block font-bold text-zinc-300">
                  ঘড়ির মূল ছবি (গ্যালারি / পিসি থেকে আপলোড করুন)
                </label>
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={productFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleProductMainImageUpload}
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => productFileInputRef.current?.click()}
                    disabled={isConvertingImage}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border-2 border-dashed border-amber-500/50 hover:border-amber-400 rounded-2xl text-white text-xs font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer group shadow"
                  >
                    <Upload className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>
                      {isConvertingImage ? 'WebP রূপান্তর চলছে...' : '📁 গ্যালারি / পিসি থেকে ছবি সিলেক্ট করুন'}
                    </span>
                  </button>

                  <span className="text-[11px] text-zinc-400">
                    স্বয়ংক্রিয়ভাবে <strong>WebP</strong> ফরম্যাটে রূপান্তর হবে (সাইজ ৭০-৯০% সাশ্রয়)।
                  </span>
                </div>

                {/* Uploaded WebP Image Preview & Compression Stats */}
                {productForm.image && (
                  <div className="mt-2 p-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-black border border-amber-500/30 overflow-hidden shrink-0">
                        <img
                          src={productForm.image}
                          alt="Watch preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                            ⚡ WebP অপটিমাইজড
                          </span>
                          <span className="text-[10px] text-zinc-400">রেডি</span>
                        </div>
                        {imageCompressionInfo && (
                          <p className="text-[11px] text-zinc-300 font-mono mt-1">
                            মূল: {imageCompressionInfo.original} KB ➔ <strong className="text-emerald-400">WebP: {imageCompressionInfo.webp} KB</strong> ({imageCompressionInfo.saved}% কম)
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setProductForm((prev) => ({ ...prev, image: '' }));
                        setImageCompressionInfo(null);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 transition-colors cursor-pointer"
                      title="ছবি মুছুন"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Additional Gallery Angle Photos (PC / Gallery Multi-Upload) */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-zinc-300">
                    ঘড়ির বিভিন্ন কোণের ছবি (Angle Gallery - ঐচ্ছিক)
                  </label>
                  <button
                    type="button"
                    onClick={() => galleryFilesInputRef.current?.click()}
                    disabled={isConvertingImage}
                    className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ গ্যালারি ছবি যোগ করুন</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={galleryFilesInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleProductGalleryUpload}
                />

                {productForm.gallery && productForm.gallery.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {productForm.gallery.map((imgUrl, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-xl bg-black border border-zinc-700 overflow-hidden shrink-0 group">
                        <img src={imgUrl} alt={`angle-${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setProductForm((prev) => ({
                              ...prev,
                              gallery: prev.gallery.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFlashSale}
                    onChange={(e) => setProductForm({ ...productForm, isFlashSale: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                  />
                  <span className="font-bold text-white">🔥 ফ্ল্যাশ সেলে রাখুন</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                  />
                  <span className="font-bold text-white">ইন স্টক সচল</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {editingProduct ? 'পরিবর্তন সংরক্ষণ করুন' : 'প্রোডাক্ট প্রকাশ করুন'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODALS: ADD / EDIT BRAND (WATCH BRANDS)                         */}
      {/* ============================================================== */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-md bg-[#0d111a] border border-zinc-800 rounded-3xl p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">
                  {editingBrand ? 'ব্র্যান্ড তথ্য এডিট করুন' : 'নতুন ঘড়ির ব্র্যান্ড যোগ করুন'}
                </h3>
              </div>
              <button
                onClick={() => setShowBrandModal(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="py-4 space-y-3.5 text-xs">
              
              {/* Brand Logo Picker */}
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex items-center gap-3">
                <input
                  type="file"
                  ref={brandFileInputRef}
                  onChange={handleBrandImageChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-xl bg-zinc-950 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={brandForm.logo || '/assets/brand/logo.jpeg'}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/assets/brand/logo.jpeg'; }}
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => brandFileInputRef.current?.click()}
                    className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>লোগো আপলোড (Gallery/PC)</span>
                  </button>
                  <p className="text-[10px] text-zinc-500">
                    বা নিচে ছবির ডিরেক্ট লিংক দিতে পারেন।
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">ব্র্যান্ডের নাম (ইংরেজি)</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Rolex, Tissot, Casio, Hublot"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">ব্র্যান্ডের নাম (বাংলা)</label>
                <input
                  type="text"
                  placeholder="যেমন: রোলেক্স, টিসোট, ক্যাসিও"
                  value={brandForm.nameBn}
                  onChange={(e) => setBrandForm({ ...brandForm, nameBn: e.target.value })}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">ব্র্যান্ডের দেশ / টাইপ (Origin)</label>
                <input
                  type="text"
                  placeholder="যেমন: Switzerland, Japan, Luxury Quartz"
                  value={brandForm.origin}
                  onChange={(e) => setBrandForm({ ...brandForm, origin: e.target.value })}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">লোগো ছবির URL (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="https://... অথবা /assets/..."
                  value={brandForm.logo}
                  onChange={(e) => setBrandForm({ ...brandForm, logo: e.target.value })}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brandForm.featured}
                    onChange={(e) => setBrandForm({ ...brandForm, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                  />
                  <span className="font-bold text-white">ফিচার্ড ব্র্যান্ড হিসেবে হাইলাইট করুন</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {editingBrand ? 'পরিবর্তন সংরক্ষণ করুন' : 'ব্র্যান্ড সংরক্ষণ করুন'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODALS: ADD REVIEW WITH GALLERY / PC IMAGE PICKER              */}
      {/* ============================================================== */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0d111a] border border-zinc-800 rounded-3xl p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">নতুন কাস্টমার রিভিউ যুক্ত করুন</h3>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="py-4 space-y-3.5 text-xs">
              
              {/* Photo Upload from PC or Mobile Gallery */}
              <div className="p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-2.5">
                <label className="block font-bold text-zinc-200">
                  📸 কাস্টমারের হাতের ছবি (ঐচ্ছিক — গ্যালারি বা পিসি থেকে দিন):
                </label>
                
                <input
                  type="file"
                  ref={reviewFileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-zinc-950 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                    {reviewForm.image ? (
                      <img
                        src={reviewForm.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-zinc-600">
                        <User className="w-6 h-6" />
                        <span className="text-[9px]">ছবি নেই</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => reviewFileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-700"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>গ্যালারি / পিসি থেকে ছবি পছন্দ করুন</span>
                    </button>
                    {reviewForm.image && (
                      <button
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, image: '', wristPhoto: '' })}
                        className="text-red-400 hover:text-red-300 text-[11px] font-semibold cursor-pointer"
                      >
                        ছবি মুছে ফেলুন (রিমুভ)
                      </button>
                    )}
                    <p className="text-[10px] text-zinc-500">
                      * ছবি না দিলে স্বয়ংক্রিয়ভাবে একটি মার্জিত ডিফল্ট প্রোফাইল আইকন শো করবে।
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">কাস্টমারের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">গ্রাহকের শহর / ঠিকানা</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ধানমন্ডি, ঢাকা"
                    value={reviewForm.location}
                    onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">রেটিং (স্টার)</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold"
                  >
                    <option value={5}>৫ স্টার (★★★★★)</option>
                    <option value={4}>৪ স্টার (★★★★☆)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">ক্রয়কৃত ঘড়ির মডেল</label>
                <select
                  value={reviewForm.product}
                  onChange={(e) => setReviewForm({ ...reviewForm, product: e.target.value })}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-bold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.banglaName || p.name}>
                      {p.banglaName || p.name}
                    </option>
                  ))}
                  <option value="custom">অন্যান্য মডেল...</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-300 mb-1">কাস্টমার মতামত (বাংলা রিভিউ টেক্সট)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="ঘড়িটা হাতে পাওয়ার পর প্রিমিয়াম ফিনিশিং দেখে খুবই মুগ্ধ হয়েছি..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  রিভিউ পাবলিশ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODALS: A4 INVOICE PRINT MODAL                                 */}
      {/* ============================================================== */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* ============================================================== */}
      {/* MODALS: MONTHLY PDF REPORT & STATEMENT MODAL                   */}
      {/* ============================================================== */}
      <MonthlyReportModal
        isOpen={showMonthlyReportModal}
        onClose={() => setShowMonthlyReportModal(false)}
        orders={orders}
        selectedMonth={orderMonthFilter}
      />

    </div>
  );
}