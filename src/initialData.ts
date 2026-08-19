import { Product, StoreSettings, CommissionSettings } from '../types';

export const SUPER_ADMIN_EMAIL = 'mdomrfaruk111@gmail.com';
export const ADMIN_ACCESS_PASSWORD = 'MdOmrFaruk22333';

export const BUSINESS_INFO = {
  phone: '01331993380',
  email: 'mdomrfaruk111@gmail.com',
  adminEmail: 'mdomrfaruk111@gmail.com',
  companyName: 'NexShop & Reseller Hub',
  address: 'Level 4, Trade Center, Motijheel C/A, Dhaka - 1000, Bangladesh',
  supportHours: 'Saturday – Thursday: 9:00 AM – 10:00 PM (Friday: 2:00 PM – 9:00 PM)',
  whatsappNumber: '01331993380',
  currency: 'BDT',
  currencySymbol: '৳',
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  id: 'general',
  storeName: 'NexShop Bangladesh',
  contactPhone: '01331993380',
  contactEmail: 'mdomrfaruk111@gmail.com',
  currency: 'BDT',
  currencySymbol: '৳',
  announcementBanner: '🔥 Special Reseller Offer: Earn up to 25% commission on all electronics & lifestyle items! Fast delivery nationwide.',
  deliveryFeeInside: 70,
  deliveryFeeOutside: 130,
  freeShippingThreshold: 3000,
  defaultCommissionRate: 15,
  heroHeadline: 'Premium Products, Unbeatable Reseller Margins',
  heroSubheadline: 'Shop top quality lifestyle & tech products at wholesale rates or start your online reseller business with zero initial investment.',
  address: 'Level 4, Trade Center, Motijheel C/A, Dhaka - 1000, Bangladesh',
  businessHours: 'Sat - Thu: 9:00 AM - 10:00 PM',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_COMMISSION_SETTINGS: CommissionSettings = {
  baseRate: 15,
  tierBronzeThreshold: 10000,
  tierBronzeBonus: 2,
  tierSilverThreshold: 30000,
  tierSilverBonus: 5,
  tierGoldThreshold: 75000,
  tierGoldBonus: 8,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Wireless ANC Bluetooth Headphones Pro',
    description: 'Active Noise Cancellation, 40-hour battery life, high-fidelity deep bass audio, and memory foam ear cushions. Perfect for music lovers, gamers, and remote workers.',
    category: 'Electronics',
    price: 2450,
    resellerPrice: 1950,
    stock: 45,
    sku: 'ANC-HP-01',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    featured: true,
    rating: 4.8,
    salesCount: 142,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Ultra AMOLED Smartwatch with SpO2 & Calling',
    description: '1.96-inch HD AMOLED Always-On Display, Bluetooth calling, heart rate, blood oxygen monitor, 100+ sports modes, and IP68 water resistance.',
    category: 'Gadgets',
    price: 3200,
    resellerPrice: 2500,
    stock: 32,
    sku: 'SW-AMO-02',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    featured: true,
    rating: 4.9,
    salesCount: 215,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'RGB Mechanical Gaming Keyboard (Hot-Swappable)',
    description: 'Compact 75% layout, custom blue switches, double-shot PBT keycaps, dynamic RGB backlight with 18 customizable patterns.',
    category: 'Electronics',
    price: 2850,
    resellerPrice: 2200,
    stock: 28,
    sku: 'KB-MECH-03',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    featured: true,
    rating: 4.7,
    salesCount: 89,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Genuine Leather Minimalist Bifold Wallet',
    description: 'Handcrafted top-grain cowhide leather with RFID blocking technology, 8 card slots, 2 cash compartments, and ultra-slim profile.',
    category: 'Fashion & Apparel',
    price: 1150,
    resellerPrice: 850,
    stock: 60,
    sku: 'WL-LTHR-04',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    featured: false,
    rating: 4.6,
    salesCount: 178,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Fast Wireless Magnetic Power Bank (10,000mAh)',
    description: '20W PD fast charging with 15W MagSafe wireless support. Compact pocket design with LED digital percentage indicator.',
    category: 'Gadgets',
    price: 1950,
    resellerPrice: 1500,
    stock: 50,
    sku: 'PB-MAG-05',
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    featured: true,
    rating: 4.8,
    salesCount: 160,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    name: 'Hydrating Botanical Facial Serum & Glow Elixir',
    description: 'Formulated with Hyaluronic Acid, Vitamin C, and Niacinamide to restore skin radiance, moisture barrier, and even out complexion.',
    category: 'Beauty & Care',
    price: 950,
    resellerPrice: 680,
    stock: 40,
    sku: 'BT-SRM-06',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    featured: false,
    rating: 4.9,
    salesCount: 310,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    name: 'Ergonomic Memory Foam Lumbar Support Pillow',
    description: 'Breathable 3D mesh cover with high-density orthopaedic memory foam. Reduces back pressure for office chairs and car seats.',
    category: 'Home & Living',
    price: 1450,
    resellerPrice: 1100,
    stock: 35,
    sku: 'HM-LMB-07',
    images: [
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    featured: false,
    rating: 4.6,
    salesCount: 75,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    name: 'True Wireless Earbuds with ENC Quad Mic',
    description: 'Environmental Noise Cancellation for ultra-clear calls, 8mm dynamic drivers, low latency gaming mode, and 30 hours playback.',
    category: 'Electronics',
    price: 1650,
    resellerPrice: 1250,
    stock: 80,
    sku: 'TWS-ENC-08',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'active',
    featured: true,
    rating: 4.7,
    salesCount: 290,
    createdAt: new Date().toISOString(),
  }
];

export const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Gadgets',
  'Fashion & Apparel',
  'Beauty & Care',
  'Home & Living',
];

export const FAQS = [
  {
    question: 'How do I start as a Reseller on this platform?',
    answer: 'Simply sign up as a Reseller from the top navigation. Once registered, you will get immediate access to wholesale prices, reseller marketing tools, custom customer order placement, and your personal earnings wallet.'
  },
  {
    question: 'How do reseller commissions and profit margins work?',
    answer: 'Every product has a Wholesale (Reseller) Price and a Recommended Retail Price. When you place an order for your customer, you can charge the customer the retail price. The margin is credited straight to your Reseller Wallet as soon as the order is verified!'
  },
  {
    question: 'How and when can I withdraw my reseller earnings?',
    answer: 'You can request a withdrawal directly through your Reseller Dashboard via bKash, Nagad, Rocket, or Bank Transfer once your balance reaches ৳500. Our finance team processes payouts promptly.'
  },
  {
    question: 'What are the delivery charges and delivery times?',
    answer: 'Inside Dhaka delivery fee is ৳70 (typically 24-48 hours), and Outside Dhaka is ৳130 (typically 2-4 business days). Free delivery is applicable on orders exceeding ৳3,000.'
  },
  {
    question: 'How can I contact customer or reseller support?',
    answer: 'You can reach us directly at phone: 01331993380 or email: mdomrfaruk111@gmail.com during business hours. You can also submit a live support ticket through the Customer or Reseller Support section.'
  }
];
