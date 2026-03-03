export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  preferredLanguage: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  starRating: number;
  imageUrls: string[];
  amenities: string[];
  contactPhone: string;
  checkInTime: string;
  checkOutTime: string;
  pricePerNight: number;
  currency: string;
  reviewCount: number;
  averageRating: number;
  isFavorite?: boolean;
}

export interface Room {
  id: string;
  hotelId: string;
  type: string;
  name: string;
  capacity: number;
  basePrice: number;
  currency: string;
  amenities: string[];
  images: string[];
  bedType: string;
  size: number;
}

export interface RoomAvailability {
  id: string;
  roomId: string;
  date: string;
  quantity: number;
  price: number;
  taxes: number;
  fees: number;
}

export type BookingStatus = 
  | 'pending_payment'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled_by_user'
  | 'cancelled_by_hotel'
  | 'no_show';

export interface Booking {
  id: string;
  userId: string;
  hotel: Hotel;
  room: Room;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  status: BookingStatus;
  totalPrice: number;
  taxes: number;
  fees: number;
  confirmationCode: string;
  qrCode?: string;
  createdAt: Date;
  modifiedAt?: Date;
  specialRequests?: string;
}

export interface Review {
  id: string;
  hotelId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  rating: number;
  title: string;
  comment: string;
  images: string[];
  createdAt: Date;
  helpfulCount: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface SearchFilters {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
  minPrice?: number;
  maxPrice?: number;
  starRating?: number[];
  amenities?: string[];
  sortBy: 'price' | 'rating' | 'distance' | 'popularity';
}

export interface Wishlist {
  id: string;
  userId: string;
  hotelId: string;
  addedAt: Date;
}

export interface Notification {
  id: string;
  type: 'booking' | 'promo' | 'reminder' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, unknown>;
}