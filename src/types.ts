export type Currency = 'USD' | 'GBP';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  category: string;
  image: string;
  description: string;
  longDescription: string;
  features: string[];
  stock: number;
  colors?: string[];
  badge?: string;
  isPopular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface CheckoutDetails {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  currency?: Currency;
  totalPaidFormatted?: string;
  bankRegion?: 'UK' | 'US';
  amazonProfileUrl?: string;
  paypalAccount?: string;
  paymentMethod?: string;
  paymentScreenshot?: string;
}
