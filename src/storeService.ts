import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Product,
  Order,
  Reseller,
  Wallet,
  Withdrawal,
  AuditLog,
  SupportTicket,
  StoreSettings,
  CommissionSettings,
  OrderStatus,
  PaymentStatus,
  WithdrawalStatus
} from '../types';
import {
  INITIAL_PRODUCTS,
  DEFAULT_STORE_SETTINGS,
  DEFAULT_COMMISSION_SETTINGS,
  BUSINESS_INFO
} from '../data/initialData';

// --- PRODUCTS ---

export async function fetchProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, 'products'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return INITIAL_PRODUCTS;
    }
    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
      products.push({ id: docSnap.id, ...docSnap.data() } as Product);
    });
    return products;
  } catch (error) {
    return INITIAL_PRODUCTS;
  }
}

export async function seedDefaultProducts(): Promise<void> {
  try {
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, 'products', prod.id), prod);
    }
    // Also seed default settings
    await setDoc(doc(db, 'settings', 'general'), DEFAULT_STORE_SETTINGS);
  } catch (error) {
    console.warn('Auto-seed products note:', error);
  }
}

export async function createProduct(product: Omit<Product, 'id'>, adminEmail: string = 'admin'): Promise<string> {
  return addProduct(product, adminEmail);
}

export async function addProduct(product: Omit<Product, 'id'>, adminEmail: string): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await logAdminAction(adminEmail, 'Create Product', 'Product', docRef.id, `Created product "${product.name}" with price ৳${product.price}`);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'products');
    throw error;
  }
}

export async function updateProduct(id: string, updates: Partial<Product>, adminEmail: string): Promise<void> {
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    await logAdminAction(adminEmail, 'Update Product', 'Product', id, `Updated product fields: ${Object.keys(updates).join(', ')}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    throw error;
  }
}

export async function deleteProduct(id: string, productName: string, adminEmail: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', id));
    await logAdminAction(adminEmail, 'Delete Product', 'Product', id, `Deleted product "${productName}"`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    throw error;
  }
}

// --- ORDERS ---

export async function fetchOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    // Sort descending by date
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'orders');
    return [];
  }
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), where('customerId', '==', userId));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'orders');
    return [];
  }
}

export async function fetchResellerOrders(resellerId: string): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'), where('resellerId', '==', resellerId));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'orders');
    return [];
  }
}

export async function createOrder(orderData: Omit<Order, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // If placed by a reseller or attributed to a reseller, update reseller pending stats
    if (orderData.resellerId && orderData.resellerCommission && orderData.resellerCommission > 0) {
      try {
        const walletRef = doc(db, 'wallets', orderData.resellerId);
        await updateDoc(walletRef, {
          pendingBalance: increment(orderData.resellerCommission),
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Could not update reseller pending wallet automatically:', e);
      }
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'orders');
    throw error;
  }
}

export async function updateOrderStatus(
  orderId: string,
  orderStatus: OrderStatus,
  trackingNumber?: string,
  courierName?: string,
  adminEmail: string = 'admin'
): Promise<void> {
  try {
    const docRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(docRef);
    const prevOrder = orderDoc.data() as Order;

    const updates: Partial<Order> = {
      orderStatus,
      updatedAt: new Date().toISOString(),
    };
    if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
    if (courierName !== undefined) updates.courierName = courierName;

    // If order transitioned to delivered, move commission from pending to available balance for reseller
    if (orderStatus === 'delivered' && prevOrder?.resellerId && prevOrder?.resellerCommission) {
      try {
        const walletRef = doc(db, 'wallets', prevOrder.resellerId);
        await updateDoc(walletRef, {
          balance: increment(prevOrder.resellerCommission),
          pendingBalance: increment(-prevOrder.resellerCommission),
          updatedAt: new Date().toISOString(),
        });
        const resellerRef = doc(db, 'resellers', prevOrder.resellerId);
        await updateDoc(resellerRef, {
          totalEarnings: increment(prevOrder.resellerCommission),
          pendingEarnings: increment(-prevOrder.resellerCommission),
        });
      } catch (e) {
        console.warn('Wallet balance shift error:', e);
      }
    }

    await updateDoc(docRef, updates);
    await logAdminAction(adminEmail, 'Update Order Status', 'Order', orderId, `Changed status to "${orderStatus}" (Tracking: ${trackingNumber || 'N/A'})`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    throw error;
  }
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  adminEmail: string = 'admin'
): Promise<void> {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      paymentStatus,
      updatedAt: new Date().toISOString(),
    });
    await logAdminAction(adminEmail, 'Update Payment Status', 'Order', orderId, `Changed payment status to "${paymentStatus}"`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    throw error;
  }
}

// --- RESELLERS & WALLETS ---

export async function fetchResellers(): Promise<Reseller[]> {
  try {
    const snapshot = await getDocs(collection(db, 'resellers'));
    const resellers: Reseller[] = [];
    snapshot.forEach((docSnap) => {
      resellers.push({ id: docSnap.id, ...docSnap.data() } as Reseller);
    });
    return resellers;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'resellers');
    return [];
  }
}

export async function fetchReseller(userId: string): Promise<Reseller | null> {
  try {
    const docRef = doc(db, 'resellers', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Reseller;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `resellers/${userId}`);
    return null;
  }
}

export async function updateResellerStatus(
  resellerId: string,
  status: 'active' | 'suspended' | 'pending',
  adminEmail: string
): Promise<void> {
  try {
    const docRef = doc(db, 'resellers', resellerId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
    await logAdminAction(adminEmail, 'Update Reseller Status', 'Reseller', resellerId, `Changed status to "${status}"`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `resellers/${resellerId}`);
    throw error;
  }
}

export async function updateResellerCommissionRate(
  resellerId: string,
  commissionRate: number,
  adminEmail: string
): Promise<void> {
  try {
    const docRef = doc(db, 'resellers', resellerId);
    await updateDoc(docRef, {
      commissionRate,
      updatedAt: new Date().toISOString(),
    });
    await logAdminAction(adminEmail, 'Set Reseller Commission Rate', 'Reseller', resellerId, `Set custom rate to ${commissionRate}%`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `resellers/${resellerId}`);
    throw error;
  }
}

export async function fetchWallet(userId: string): Promise<Wallet | null> {
  try {
    const docRef = doc(db, 'wallets', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Wallet;
    }
    // Create initial wallet if missing
    const initialWallet: Wallet = {
      id: userId,
      userId,
      balance: 0,
      pendingBalance: 0,
      totalWithdrawn: 0,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, initialWallet);
    return initialWallet;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `wallets/${userId}`);
    return null;
  }
}

export async function fetchAllWallets(): Promise<Wallet[]> {
  try {
    const snapshot = await getDocs(collection(db, 'wallets'));
    const wallets: Wallet[] = [];
    snapshot.forEach((docSnap) => {
      wallets.push({ id: docSnap.id, ...docSnap.data() } as Wallet);
    });
    return wallets;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'wallets');
    return [];
  }
}

export async function adjustWalletBalance(
  userId: string,
  amount: number,
  reason: string,
  adminEmail: string
): Promise<void> {
  try {
    const docRef = doc(db, 'wallets', userId);
    await updateDoc(docRef, {
      balance: increment(amount),
      updatedAt: new Date().toISOString(),
    });
    await logAdminAction(adminEmail, 'Manual Wallet Adjustment', 'Wallet', userId, `Adjusted balance by ৳${amount}. Reason: ${reason}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `wallets/${userId}`);
    throw error;
  }
}

// --- WITHDRAWALS ---

export async function createWithdrawalRequest(data: Omit<Withdrawal, 'id' | 'createdAt' | 'status'>): Promise<string> {
  return requestWithdrawal(data);
}

export async function requestWithdrawal(data: Omit<Withdrawal, 'id' | 'createdAt' | 'status'>): Promise<string> {
  try {
    // Check wallet balance first
    const wallet = await fetchWallet(data.userId);
    if (!wallet || wallet.balance < data.amount) {
      throw new Error('Insufficient wallet balance to withdraw this amount.');
    }

    const docRef = await addDoc(collection(db, 'withdrawals'), {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Deduct available balance and hold it
    const walletRef = doc(db, 'wallets', data.userId);
    await updateDoc(walletRef, {
      balance: increment(-data.amount),
      updatedAt: new Date().toISOString(),
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'withdrawals');
    throw error;
  }
}

export async function fetchWithdrawals(): Promise<Withdrawal[]> {
  try {
    const snapshot = await getDocs(collection(db, 'withdrawals'));
    const list: Withdrawal[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Withdrawal);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'withdrawals');
    return [];
  }
}

export async function fetchUserWithdrawals(userId: string): Promise<Withdrawal[]> {
  try {
    const q = query(collection(db, 'withdrawals'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const list: Withdrawal[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Withdrawal);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'withdrawals');
    return [];
  }
}

export async function updateWithdrawalStatus(
  id: string,
  status: WithdrawalStatus,
  adminEmail: string,
  transactionId?: string,
  adminNotes?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'withdrawals', id);
    const snap = await getDoc(docRef);
    const withdrawal = snap.data() as Withdrawal;

    const updates: Partial<Withdrawal> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (transactionId) updates.transactionId = transactionId;
    if (adminNotes) updates.adminNotes = adminNotes;

    await updateDoc(docRef, updates);

    // If approved, add to totalWithdrawn & paidEarnings
    if (status === 'approved') {
      const walletRef = doc(db, 'wallets', withdrawal.userId);
      await updateDoc(walletRef, {
        totalWithdrawn: increment(withdrawal.amount),
        updatedAt: new Date().toISOString(),
      });
      const resellerRef = doc(db, 'resellers', withdrawal.userId);
      await updateDoc(resellerRef, {
        paidEarnings: increment(withdrawal.amount),
      });
    } else if (status === 'rejected') {
      // Refund balance to wallet
      const walletRef = doc(db, 'wallets', withdrawal.userId);
      await updateDoc(walletRef, {
        balance: increment(withdrawal.amount),
        updatedAt: new Date().toISOString(),
      });
    }

    await logAdminAction(adminEmail, `Process Withdrawal (${status})`, 'Withdrawal', id, `Amount: ৳${withdrawal.amount}, Method: ${withdrawal.paymentMethod}, TrxID: ${transactionId || 'N/A'}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `withdrawals/${id}`);
    throw error;
  }
}

export async function updateWalletBalance(
  userId: string,
  balanceDelta: number,
  pendingDelta: number,
  adminEmail: string,
  reason: string
): Promise<void> {
  try {
    const walletRef = doc(db, 'wallets', userId);
    const snap = await getDoc(walletRef);
    if (snap.exists()) {
      await updateDoc(walletRef, {
        balance: increment(balanceDelta),
        pendingBalance: increment(pendingDelta),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(walletRef, {
        id: userId,
        userId,
        balance: Math.max(0, balanceDelta),
        pendingBalance: Math.max(0, pendingDelta),
        totalWithdrawn: 0,
        updatedAt: new Date().toISOString(),
      });
    }
    await logAdminAction(adminEmail, 'Manual Wallet Balance Adjustment', 'Wallet', userId, reason);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `wallets/${userId}`);
    throw error;
  }
}

// --- SETTINGS ---

export async function fetchStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, 'settings', 'general');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as StoreSettings;
    }
    return DEFAULT_STORE_SETTINGS;
  } catch (error) {
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function updateStoreSettings(settings: Partial<StoreSettings>, adminEmail: string): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'general');
    await updateDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    await logAdminAction(adminEmail, 'Update Store Settings', 'Settings', 'general', `Modified website configurations`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'settings/general');
    throw error;
  }
}

// --- AUDIT LOGS ---

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    const q = query(collection(db, 'audit_logs'), limit(100));
    const snapshot = await getDocs(q);
    const logs: AuditLog[] = [];
    snapshot.forEach((docSnap) => {
      logs.push({ id: docSnap.id, ...docSnap.data() } as AuditLog);
    });
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'audit_logs');
    return [];
  }
}

export async function logAdminAction(
  adminEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  details: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      adminEmail,
      action,
      targetType,
      targetId,
      details,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Could not write audit log:', e);
  }
}

// --- SUPPORT TICKETS ---

export async function createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'status'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'support_tickets'), {
      ...ticket,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'support_tickets');
    throw error;
  }
}

export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  try {
    const snapshot = await getDocs(collection(db, 'support_tickets'));
    const tickets: SupportTicket[] = [];
    snapshot.forEach((docSnap) => {
      tickets.push({ id: docSnap.id, ...docSnap.data() } as SupportTicket);
    });
    return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'support_tickets');
    return [];
  }
}

export async function replySupportTicket(
  ticketId: string,
  reply: string,
  status: 'open' | 'in_progress' | 'resolved',
  adminEmail: string
): Promise<void> {
  try {
    const docRef = doc(db, 'support_tickets', ticketId);
    await updateDoc(docRef, {
      reply,
      status,
      updatedAt: new Date().toISOString(),
    });
    await logAdminAction(adminEmail, 'Reply Support Ticket', 'SupportTicket', ticketId, `Replied and set status to "${status}"`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `support_tickets/${ticketId}`);
    throw error;
  }
}

// --- USERS & RBAC ---

export async function fetchUsers(): Promise<import('../types').UserProfile[]> {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const users: import('../types').UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        id: docSnap.id,
        uid: docSnap.id,
        email: data.email || '',
        displayName: data.displayName || '',
        phone: data.phone || '',
        role: data.role || 'customer',
        status: data.status || 'active',
        resellerCode: data.resellerCode,
        commissionTier: data.commissionTier,
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'users');
    return [];
  }
}

export async function updateUserRole(
  userId: string,
  role: import('../types').UserRole,
  status: import('../types').AccountStatus,
  adminEmail: string
): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      role,
      status,
      updatedAt: new Date().toISOString(),
    });
    await logAdminAction(adminEmail, 'Update User Role / Status', 'User', userId, `Changed role to "${role}", status to "${status}"`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    throw error;
  }
}

// --- CATEGORIES ---

export async function fetchCategories(): Promise<import('../types').Category[]> {
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    if (snapshot.empty) {
      // Return default category list if empty
      const defaults: import('../types').Category[] = [
        { id: 'cat-1', name: 'Electronics', status: 'active', displayOrder: 1, createdAt: new Date().toISOString() },
        { id: 'cat-2', name: 'Gadgets', status: 'active', displayOrder: 2, createdAt: new Date().toISOString() },
        { id: 'cat-3', name: 'Fashion & Apparel', status: 'active', displayOrder: 3, createdAt: new Date().toISOString() },
        { id: 'cat-4', name: 'Beauty & Care', status: 'active', displayOrder: 4, createdAt: new Date().toISOString() },
        { id: 'cat-5', name: 'Home & Living', status: 'active', displayOrder: 5, createdAt: new Date().toISOString() },
      ];
      return defaults;
    }
    const categories: import('../types').Category[] = [];
    snapshot.forEach((docSnap) => {
      categories.push({ id: docSnap.id, ...docSnap.data() } as import('../types').Category);
    });
    return categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'categories');
    return [];
  }
}

export async function createCategory(category: Omit<import('../types').Category, 'id' | 'createdAt'>, adminEmail: string): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...category,
      createdAt: new Date().toISOString(),
    });
    await logAdminAction(adminEmail, 'Create Category', 'Category', docRef.id, `Created category "${category.name}"`);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'categories');
    throw error;
  }
}

export async function updateCategory(id: string, updates: Partial<import('../types').Category>, adminEmail: string): Promise<void> {
  try {
    const docRef = doc(db, 'categories', id);
    await updateDoc(docRef, { ...updates });
    await logAdminAction(adminEmail, 'Update Category', 'Category', id, `Updated category`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `categories/${id}`);
    throw error;
  }
}

export async function deleteCategory(id: string, name: string, adminEmail: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'categories', id));
    await logAdminAction(adminEmail, 'Delete Category', 'Category', id, `Deleted category "${name}"`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    throw error;
  }
}

// --- 5-GENERATION REFERRALS ---

export async function fetchReferrals(): Promise<import('../types').ReferralNode[]> {
  try {
    const snapshot = await getDocs(collection(db, 'referrals'));
    const nodes: import('../types').ReferralNode[] = [];
    snapshot.forEach((docSnap) => {
      nodes.push({ id: docSnap.id, ...docSnap.data() } as import('../types').ReferralNode);
    });
    return nodes;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'referrals');
    return [];
  }
}

export async function createReferralRecord(node: Omit<import('../types').ReferralNode, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'referrals'), {
      ...node,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'referrals');
    throw error;
  }
}

// --- NOTIFICATIONS & ANNOUNCEMENTS ---

export async function fetchNotifications(): Promise<import('../types').StoreNotification[]> {
  try {
    const snapshot = await getDocs(collection(db, 'notifications'));
    const list: import('../types').StoreNotification[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as import('../types').StoreNotification);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'notifications');
    return [];
  }
}

export async function createNotification(
  notification: Omit<import('../types').StoreNotification, 'id' | 'createdAt'>,
  adminEmail: string
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notification,
      createdAt: new Date().toISOString(),
    });
    await logAdminAction(adminEmail, 'Create Broadcast Notification', 'Notification', docRef.id, `Broadcasted: "${notification.title}" to ${notification.targetType}`);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'notifications');
    throw error;
  }
}

export async function deleteNotification(id: string, adminEmail: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'notifications', id));
    await logAdminAction(adminEmail, 'Delete Notification', 'Notification', id, `Removed broadcast announcement`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `notifications/${id}`);
    throw error;
  }
}


