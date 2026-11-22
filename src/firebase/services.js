import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { PRODUCTS, CUSTOMER_REVIEWS, STORE_SETTINGS, DEFAULT_BRANDS } from '../data/products';

// Collection references
const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';
const REVIEWS_COLLECTION = 'reviews';
const SETTINGS_COLLECTION = 'settings';
const BRANDS_COLLECTION = 'brands';

// ==========================================
// 1. ORDERS SERVICES
// ==========================================

export async function createFirestoreOrder(orderData) {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      status: orderData.status || 'pending',
      createdAt: serverTimestamp(),
      clientTimestamp: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.warn('Firestore createOrder warning, storing in local fallback:', error);
    const localOrders = JSON.parse(localStorage.getItem('tajwatch_orders') || '[]');
    const fallbackOrder = {
      ...orderData,
      id: `local_${Date.now()}`,
      status: orderData.status || 'pending',
      createdAt: new Date().toISOString(),
    };
    localOrders.unshift(fallbackOrder);
    localStorage.setItem('tajwatch_orders', JSON.stringify(localOrders));
    return { success: true, id: fallbackOrder.id, fallback: true };
  }
}

export function subscribeToOrders(callback) {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          firestoreId: doc.id,
          ...doc.data(),
        }));
        callback(orders);
      },
      (error) => {
        console.warn('Firestore subscription fallback to local cache:', error);
        const localOrders = JSON.parse(localStorage.getItem('tajwatch_orders') || '[]');
        callback(localOrders);
      }
    );
  } catch (error) {
    console.warn('subscribeToOrders error:', error);
    const localOrders = JSON.parse(localStorage.getItem('tajwatch_orders') || '[]');
    callback(localOrders);
    return () => {};
  }
}

export async function updateOrderStatus(orderDocId, newStatus) {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderDocId);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.warn('updateOrderStatus fallback:', error);
    const localOrders = JSON.parse(localStorage.getItem('tajwatch_orders') || '[]');
    const updated = localOrders.map((o) => (o.id === orderDocId || o.firestoreId === orderDocId ? { ...o, status: newStatus } : o));
    localStorage.setItem('tajwatch_orders', JSON.stringify(updated));
    return { success: true, fallback: true };
  }
}

export async function updateOrderCourier(orderDocId, courierData) {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderDocId);
    await updateDoc(docRef, {
      courierName: courierData.courierName,
      trackingId: courierData.trackingId,
      courierNotes: courierData.courierNotes,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.warn('updateOrderCourier fallback:', error);
    const localOrders = JSON.parse(localStorage.getItem('tajwatch_orders') || '[]');
    const updated = localOrders.map((o) => (o.id === orderDocId || o.firestoreId === orderDocId ? { ...o, ...courierData } : o));
    localStorage.setItem('tajwatch_orders', JSON.stringify(updated));
    return { success: true, fallback: true };
  }
}

export async function deleteOrder(orderDocId) {
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderDocId));
    return { success: true };
  } catch (error) {
    console.warn('deleteOrder fallback:', error);
    const localOrders = JSON.parse(localStorage.getItem('tajwatch_orders') || '[]');
    const filtered = localOrders.filter((o) => o.id !== orderDocId && o.firestoreId !== orderDocId);
    localStorage.setItem('tajwatch_orders', JSON.stringify(filtered));
    return { success: true, fallback: true };
  }
}

// ==========================================
// 2. PRODUCTS SERVICES
// ==========================================

export async function seedProductsIfEmpty() {
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (snapshot.empty) {
      console.log('Seeding initial products into Firebase...');
      for (const product of PRODUCTS) {
        await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), {
          ...product,
          createdAt: serverTimestamp(),
        });
      }
      return true;
    }
    return false;
  } catch (error) {
    console.warn('seedProducts warning:', error);
    return false;
  }
}

let cachedProducts = null;
const productListeners = new Set();
let unsubscribeProducts = null;

export function subscribeToProducts(callback) {
  productListeners.add(callback);
  if (cachedProducts) {
    callback(cachedProducts);
  }

  if (!unsubscribeProducts) {
    try {
      unsubscribeProducts = onSnapshot(
        collection(db, PRODUCTS_COLLECTION),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({
              firestoreId: d.id,
              ...d.data(),
            }));
            cachedProducts = list;
            productListeners.forEach((cb) => {
              try { cb(list); } catch (e) { console.warn(e); }
            });
          } else {
            cachedProducts = PRODUCTS;
            productListeners.forEach((cb) => {
              try { cb(PRODUCTS); } catch (e) { console.warn(e); }
            });
          }
        },
        () => {
          cachedProducts = PRODUCTS;
          productListeners.forEach((cb) => {
            try { cb(PRODUCTS); } catch (e) { console.warn(e); }
          });
        }
      );
    } catch {
      cachedProducts = PRODUCTS;
      callback(PRODUCTS);
    }
  }

  return () => {
    productListeners.delete(callback);
    if (productListeners.size === 0 && unsubscribeProducts) {
      try { unsubscribeProducts(); } catch {}
      unsubscribeProducts = null;
    }
  };
}

export async function addFirestoreProduct(productData) {
  try {
    const id = productData.id || `taj-custom-${Date.now()}`;
    await setDoc(doc(db, PRODUCTS_COLLECTION, id), {
      ...productData,
      id,
      createdAt: serverTimestamp(),
    });
    return { success: true, id };
  } catch (error) {
    console.warn('addFirestoreProduct fallback:', error);
    return { success: false, error: error.message };
  }
}

export async function updateFirestoreProduct(productId, productData) {
  try {
    await setDoc(
      doc(db, PRODUCTS_COLLECTION, productId),
      {
        ...productData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.warn('updateFirestoreProduct fallback:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteFirestoreProduct(productId) {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// 3. REVIEWS SERVICES
// ==========================================

export async function seedReviewsIfEmpty() {
  try {
    const snapshot = await getDocs(collection(db, REVIEWS_COLLECTION));
    if (snapshot.empty) {
      for (const rev of CUSTOMER_REVIEWS) {
        await setDoc(doc(db, REVIEWS_COLLECTION, `rev-${rev.id}`), {
          ...rev,
          createdAt: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    console.warn('seedReviews warning:', err);
  }
}

let cachedReviews = null;
const reviewListeners = new Set();
let unsubscribeReviews = null;

export function subscribeToReviews(callback) {
  reviewListeners.add(callback);
  if (cachedReviews) {
    callback(cachedReviews);
  }

  if (!unsubscribeReviews) {
    try {
      unsubscribeReviews = onSnapshot(
        collection(db, REVIEWS_COLLECTION),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({
              firestoreId: d.id,
              ...d.data(),
            }));
            cachedReviews = list;
            reviewListeners.forEach((cb) => {
              try { cb(list); } catch (e) { console.warn(e); }
            });
          } else {
            cachedReviews = CUSTOMER_REVIEWS;
            reviewListeners.forEach((cb) => {
              try { cb(CUSTOMER_REVIEWS); } catch (e) { console.warn(e); }
            });
          }
        },
        () => {
          cachedReviews = CUSTOMER_REVIEWS;
          reviewListeners.forEach((cb) => {
            try { cb(CUSTOMER_REVIEWS); } catch (e) { console.warn(e); }
          });
        }
      );
    } catch {
      cachedReviews = CUSTOMER_REVIEWS;
      callback(CUSTOMER_REVIEWS);
    }
  }

  return () => {
    reviewListeners.delete(callback);
    if (reviewListeners.size === 0 && unsubscribeReviews) {
      try { unsubscribeReviews(); } catch {}
      unsubscribeReviews = null;
    }
  };
}

export async function addFirestoreReview(reviewData) {
  try {
    const id = `rev-${Date.now()}`;
    await setDoc(doc(db, REVIEWS_COLLECTION, id), {
      ...reviewData,
      id: Date.now(),
      createdAt: serverTimestamp(),
    });
    return { success: true, id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteFirestoreReview(reviewDocId) {
  try {
    await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewDocId));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 4. STORE SETTINGS (General, Email, Showroom)
// ==========================================

export async function getFirestoreStoreSettings() {
  try {
    const docSnap = await getDoc(doc(db, SETTINGS_COLLECTION, 'general'));
    if (docSnap.exists()) {
      return { ...STORE_SETTINGS, ...docSnap.data() };
    }
    return STORE_SETTINGS;
  } catch {
    return STORE_SETTINGS;
  }
}

let cachedStoreSettings = null;
const settingsListeners = new Set();
let unsubscribeSettings = null;

export function subscribeToStoreSettings(callback) {
  settingsListeners.add(callback);
  if (cachedStoreSettings) {
    callback(cachedStoreSettings);
  }

  if (!unsubscribeSettings) {
    try {
      unsubscribeSettings = onSnapshot(
        doc(db, SETTINGS_COLLECTION, 'general'),
        (docSnap) => {
          const data = docSnap.exists() ? { ...STORE_SETTINGS, ...docSnap.data() } : STORE_SETTINGS;
          cachedStoreSettings = data;
          settingsListeners.forEach((cb) => {
            try { cb(data); } catch (e) { console.warn(e); }
          });
        },
        () => {
          cachedStoreSettings = STORE_SETTINGS;
          settingsListeners.forEach((cb) => {
            try { cb(STORE_SETTINGS); } catch (e) { console.warn(e); }
          });
        }
      );
    } catch {
      cachedStoreSettings = STORE_SETTINGS;
      callback(STORE_SETTINGS);
    }
  }

  return () => {
    settingsListeners.delete(callback);
    if (settingsListeners.size === 0 && unsubscribeSettings) {
      try { unsubscribeSettings(); } catch {}
      unsubscribeSettings = null;
    }
  };
}

export async function updateFirestoreStoreSettings(settingsData) {
  try {
    await setDoc(
      doc(db, SETTINGS_COLLECTION, 'general'),
      {
        ...settingsData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 5. FLASH SALE CONFIG
// ==========================================

export const DEFAULT_FLASH_SALE_CONFIG = {
  active: true,
  endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  title: 'Flash Sale | ফ্ল্যাশ সেল',
  subtitle: 'সীমিত সময়ের বিশেষ স্টক ক্লিয়ারেন্স অফার',
};

export async function getFlashSaleConfig() {
  try {
    const docSnap = await getDoc(doc(db, SETTINGS_COLLECTION, 'flash_sale'));
    if (docSnap.exists()) {
      return { ...DEFAULT_FLASH_SALE_CONFIG, ...docSnap.data() };
    }
    return DEFAULT_FLASH_SALE_CONFIG;
  } catch {
    return DEFAULT_FLASH_SALE_CONFIG;
  }
}

let cachedFlashConfig = null;
const flashConfigListeners = new Set();
let unsubscribeFlashConfig = null;

export function subscribeToFlashSaleConfig(callback) {
  flashConfigListeners.add(callback);
  if (cachedFlashConfig) {
    callback(cachedFlashConfig);
  }

  if (!unsubscribeFlashConfig) {
    try {
      unsubscribeFlashConfig = onSnapshot(
        doc(db, SETTINGS_COLLECTION, 'flash_sale'),
        (docSnap) => {
          const data = docSnap.exists() ? { ...DEFAULT_FLASH_SALE_CONFIG, ...docSnap.data() } : DEFAULT_FLASH_SALE_CONFIG;
          cachedFlashConfig = data;
          flashConfigListeners.forEach((cb) => {
            try { cb(data); } catch (e) { console.warn(e); }
          });
        },
        () => {
          cachedFlashConfig = DEFAULT_FLASH_SALE_CONFIG;
          flashConfigListeners.forEach((cb) => {
            try { cb(DEFAULT_FLASH_SALE_CONFIG); } catch (e) { console.warn(e); }
          });
        }
      );
    } catch {
      cachedFlashConfig = DEFAULT_FLASH_SALE_CONFIG;
      callback(DEFAULT_FLASH_SALE_CONFIG);
    }
  }

  return () => {
    flashConfigListeners.delete(callback);
    if (flashConfigListeners.size === 0 && unsubscribeFlashConfig) {
      try { unsubscribeFlashConfig(); } catch {}
      unsubscribeFlashConfig = null;
    }
  };
}

export async function updateFlashSaleConfig(configData) {
  try {
    await setDoc(
      doc(db, SETTINGS_COLLECTION, 'flash_sale'),
      {
        ...configData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 6. ADMIN CREDENTIALS SERVICES
// ==========================================

const DEFAULT_ADMIN_CREDS = {
  username: 'admin@tajwatch.com',
  password: 'tajwatch2026',
};

export async function getAdminCredentials() {
  try {
    const docSnap = await getDoc(doc(db, SETTINGS_COLLECTION, 'admin_credentials'));
    if (docSnap.exists()) {
      return { ...DEFAULT_ADMIN_CREDS, ...docSnap.data() };
    }
    const local = localStorage.getItem('tajwatch_admin_custom_creds');
    return local ? JSON.parse(local) : DEFAULT_ADMIN_CREDS;
  } catch {
    const local = localStorage.getItem('tajwatch_admin_custom_creds');
    return local ? JSON.parse(local) : DEFAULT_ADMIN_CREDS;
  }
}

export async function updateAdminCredentials(newCreds) {
  try {
    // 1. Save to Firestore
    await setDoc(
      doc(db, SETTINGS_COLLECTION, 'admin_credentials'),
      {
        username: newCreds.username,
        password: newCreds.password,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    // 2. Cache in localStorage
    localStorage.setItem('tajwatch_admin_custom_creds', JSON.stringify(newCreds));
    return { success: true };
  } catch (err) {
    // Fallback cache
    localStorage.setItem('tajwatch_admin_custom_creds', JSON.stringify(newCreds));
    return { success: true, fallback: true };
  }
}

// ==========================================
// 7. BRANDS SERVICES (Brand Management)
// ==========================================

export async function seedBrandsIfEmpty() {
  try {
    const snapshot = await getDocs(collection(db, BRANDS_COLLECTION));
    if (snapshot.empty) {
      for (const b of DEFAULT_BRANDS) {
        await setDoc(doc(db, BRANDS_COLLECTION, b.id), {
          ...b,
          createdAt: serverTimestamp(),
        });
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn('seedBrands warning:', err);
    return false;
  }
}

export function subscribeToBrands(callback) {
  try {
    return onSnapshot(
      collection(db, BRANDS_COLLECTION),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({
            firestoreId: d.id,
            ...d.data(),
          }));
          callback(list);
        } else {
          callback(DEFAULT_BRANDS);
        }
      },
      () => {
        callback(DEFAULT_BRANDS);
      }
    );
  } catch {
    callback(DEFAULT_BRANDS);
    return () => {};
  }
}

export async function addFirestoreBrand(brandData) {
  try {
    const id = brandData.id || `brand-${Date.now()}`;
    await setDoc(doc(db, BRANDS_COLLECTION, id), {
      ...brandData,
      id,
      createdAt: serverTimestamp(),
    });
    return { success: true, id };
  } catch (err) {
    console.warn('addFirestoreBrand error:', err);
    return { success: false, error: err.message };
  }
}

export async function updateFirestoreBrand(brandId, brandData) {
  try {
    await updateDoc(doc(db, BRANDS_COLLECTION, brandId), {
      ...brandData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteFirestoreBrand(brandId) {
  try {
    await deleteDoc(doc(db, BRANDS_COLLECTION, brandId));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ==========================================
// 6. DATA RETENTION & 2-MONTH BACKUP POLICY
// ==========================================

/**
 * Automatically purges orders older than 60 days (2 months) from Firestore,
 * ensuring past 2 months data is preserved for backup while keeping database fast.
 */
export async function cleanupOrdersOlderThan2Months() {
  try {
    const twoMonthsAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
    const snap = await getDocs(collection(db, ORDERS_COLLECTION));
    let deletedCount = 0;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const orderTime = data.createdAt?.seconds
        ? data.createdAt.seconds * 1000
        : new Date(data.createdAt || 0).getTime();

      if (orderTime > 0 && orderTime < twoMonthsAgo) {
        await deleteDoc(doc(db, ORDERS_COLLECTION, docSnap.id));
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`Auto-cleaned ${deletedCount} orders older than 2 months for storage optimization.`);
    }
    return { success: true, deletedCount };
  } catch (err) {
    console.warn('cleanupOrdersOlderThan2Months warning:', err);
    return { success: false, error: err.message };
  }
}
