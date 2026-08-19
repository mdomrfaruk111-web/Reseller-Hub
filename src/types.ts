export type UserRole = 'admin' | 'reseller' | 'customer';
export type AccountStatus = 'active' | 'suspended' | 'pending';

export interface UserProfile {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  resellerCode?: string;
  commissionTier?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminRecord {
  email: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;              // Retail price in BDT
  resellerPrice: number;      // Wholesale / reseller price in BDT
  stock: number;
  sku: string;
  images: string[];
  status: 'active' | 'draft' | 'archived';
  featured?: boolean;
  rating?: number;
  salesCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;              // Price charged to customer
  resellerPrice?: number;     // Reseller cost if ordered via reseller
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'bank';

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  resellerId?: string;
  resellerCommission?: number;
  trackingNumber?: string;
  courierName?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Reseller {
  id: string;
  userId: string;
  businessName: string;
  phone: string;
  email: string;
  status: AccountStatus;
  commissionRate: number;     // e.g., 15 for 15%
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  bankDetails?: string;
  paymentMethod?: string;
  accountNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  totalWithdrawn: number;
  updatedAt?: string;
}

export type WithdrawalMethod = 'bKash' | 'Nagad' | 'Rocket' | 'Bank';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface Withdrawal {
  id: string;
  userId: string;
  resellerName: string;
  amount: number;
  paymentMethod: WithdrawalMethod;
  accountDetails: string;
  status: WithdrawalStatus;
  transactionId?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  adminId?: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: string;
  createdAt: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved';

export interface SupportTicket {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userType: 'customer' | 'reseller' | 'guest';
  subject: string;
  message: string;
  status: TicketStatus;
  reply?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StoreSettings {
  id?: string;
  storeName?: string;
  contactPhone?: string;
  contactEmail?: string;
  currency?: string;
  currencySymbol?: string;
  announcementBanner?: string;
  deliveryFeeInside?: number;
  deliveryFeeOutside?: number;
  freeShippingThreshold?: number;
  defaultCommissionRate?: number;
  defaultResellerMargin?: number;
  minWithdrawalLimit?: number;
  heroHeadline?: string;
  heroSubheadline?: string;
  address?: string;
  businessHours?: string;
  updatedAt?: string;
}

export interface CommissionSettings {
  baseRate: number;
  tierBronzeThreshold: number;
  tierBronzeBonus: number;
  tierSilverThreshold: number;
  tierSilverBonus: number;
  tierGoldThreshold: number;
  tierGoldBonus: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  status: 'active' | 'hidden';
  displayOrder?: number;
  createdAt: string;
}

export interface ReferralNode {
  id: string;
  resellerId: string;
  resellerName: string;
  sponsorId?: string;
  sponsorName?: string;
  generationLevel: number;
  teamCount: number;
  teamSalesVolume: number;
  referralCode: string;
  totalReferralEarnings: number;
  createdAt: string;
}

export interface StoreNotification {
  id: string;
  title: string;
  message: string;
  targetType: 'all' | 'resellers' | 'customers';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'active' | 'archived';
  createdAt: string;
}

