import { create } from 'zustand';
import { Hotel, Booking, Room, Review, SearchFilters, PaymentMethod, Notification } from '@/types';

interface StoreState {
  // Hotels
  hotels: Hotel[];
  featuredHotels: Hotel[];
  nearbyHotels: Hotel[];
  searchResults: Hotel[];
  selectedHotel: Hotel | null;
  
  // Rooms
  rooms: Room[];
  selectedRoom: Room | null;
  
  // Bookings
  bookings: Booking[];
  activeBooking: Booking | null;
  
  // Reviews
  reviews: Review[];
  
  // Search
  searchFilters: SearchFilters;
  recentSearches: string[];
  
  // Favorites
  favorites: string[];
  
  // Payment
  paymentMethods: PaymentMethod[];
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setHotels: (hotels: Hotel[]) => void;
  setFeaturedHotels: (hotels: Hotel[]) => void;
  setNearbyHotels: (hotels: Hotel[]) => void;
  setSearchResults: (hotels: Hotel[]) => void;
  selectHotel: (hotel: Hotel | null) => void;
  setRooms: (rooms: Room[]) => void;
  selectRoom: (room: Room | null) => void;
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  setActiveBooking: (booking: Booking | null) => void;
  setReviews: (reviews: Review[]) => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  addRecentSearch: (search: string) => void;
  toggleFavorite: (hotelId: string) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeMockData: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  hotels: [],
  featuredHotels: [],
  nearbyHotels: [],
  searchResults: [],
  selectedHotel: null,
  rooms: [],
  selectedRoom: null,
  bookings: [],
  activeBooking: null,
  reviews: [],
  searchFilters: {
    location: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: 2,
    rooms: 1,
    sortBy: 'popularity',
  },
  recentSearches: [],
  favorites: [],
  paymentMethods: [],
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Actions
  setHotels: (hotels) => set({ hotels }),
  setFeaturedHotels: (hotels) => set({ featuredHotels: hotels }),
  setNearbyHotels: (hotels) => set({ nearbyHotels: hotels }),
  setSearchResults: (hotels) => set({ searchResults: hotels }),
  selectHotel: (hotel) => set({ selectedHotel: hotel }),
  setRooms: (rooms) => set({ rooms }),
  selectRoom: (room) => set({ selectedRoom: room }),
  setBookings: (bookings) => set({ bookings }),
  
  addBooking: (booking) => set((state) => ({
    bookings: [booking, ...state.bookings],
  })),
  
  updateBookingStatus: (id, status) => set((state) => ({
    bookings: state.bookings.map((b) =>
      b.id === id ? { ...b, status, modifiedAt: new Date() } : b
    ),
  })),
  
  setActiveBooking: (booking) => set({ activeBooking: booking }),
  setReviews: (reviews) => set({ reviews }),
  
  setSearchFilters: (filters) => set((state) => ({
    searchFilters: { ...state.searchFilters, ...filters },
  })),
  
  addRecentSearch: (search) => set((state) => ({
    recentSearches: [search, ...state.recentSearches.filter((s) => s !== search)].slice(0, 5),
  })),
  
  toggleFavorite: (hotelId) => set((state) => ({
    favorites: state.favorites.includes(hotelId)
      ? state.favorites.filter((id) => id !== hotelId)
      : [...state.favorites, hotelId],
  })),
  
  addPaymentMethod: (method) => set((state) => ({
    paymentMethods: [...state.paymentMethods, method],
  })),
  
  removePaymentMethod: (id) => set((state) => ({
    paymentMethods: state.paymentMethods.filter((m) => m.id !== id),
  })),
  
  setDefaultPaymentMethod: (id) => set((state) => ({
    paymentMethods: state.paymentMethods.map((m) => ({
      ...m,
      isDefault: m.id === id,
    })),
  })),
  
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: state.notifications.filter((n) => !n.read && n.id !== id).length,
  })),
  
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  initializeMockData: () => {
    const mockHotels: Hotel[] = [
      {
        id: '1',
        name: 'Forest Haven Resort & Spa',
        description: 'Nestled in the heart of nature, Forest Haven Resort offers a tranquil escape with luxurious amenities. Wake up to the sound of birds and the scent of pine trees.',
        address: '123 Woodland Drive',
        city: 'Mountain View',
        country: 'United States',
        latitude: 37.3861,
        longitude: -122.0839,
        starRating: 5,
        imageUrls: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        ],
        amenities: ['spa', 'pool', 'wifi', 'restaurant', 'gym', 'parking', 'room_service', 'bar'],
        contactPhone: '+1 555-0123',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        pricePerNight: 299,
        currency: 'USD',
        reviewCount: 847,
        averageRating: 4.8,
      },
      {
        id: '2',
        name: 'Emerald Garden Hotel',
        description: 'A sustainable boutique hotel surrounded by lush gardens. Experience eco-luxury at its finest with farm-to-table dining and organic spa treatments.',
        address: '456 Green Valley Road',
        city: 'San Francisco',
        country: 'United States',
        latitude: 37.7749,
        longitude: -122.4194,
        starRating: 4,
        imageUrls: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        ],
        amenities: ['wifi', 'restaurant', 'parking', 'garden', 'bike_rental', 'organic_food'],
        contactPhone: '+1 555-0456',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        pricePerNight: 189,
        currency: 'USD',
        reviewCount: 523,
        averageRating: 4.6,
      },
      {
        id: '3',
        name: 'Treehouse Retreat',
        description: 'Unique treehouse accommodations offering an unforgettable experience. Sleep among the treetops and reconnect with nature.',
        address: '789 Canopy Lane',
        city: 'Portland',
        country: 'United States',
        latitude: 45.5152,
        longitude: -122.6784,
        starRating: 4,
        imageUrls: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
        ],
        amenities: ['wifi', 'breakfast', 'hiking', 'nature_walks', 'bird_watching'],
        contactPhone: '+1 555-0789',
        checkInTime: '16:00',
        checkOutTime: '10:00',
        pricePerNight: 245,
        currency: 'USD',
        reviewCount: 312,
        averageRating: 4.9,
      },
      {
        id: '4',
        name: 'Lakeside Wilderness Lodge',
        description: 'A rustic yet refined lodge on the shores of Crystal Lake. Perfect for nature enthusiasts seeking comfort in the wild.',
        address: '321 Lakeshore Boulevard',
        city: 'Lake Tahoe',
        country: 'United States',
        latitude: 39.0968,
        longitude: -120.0324,
        starRating: 5,
        imageUrls: [
          'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
          'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        ],
        amenities: ['spa', 'pool', 'wifi', 'restaurant', 'kayaking', 'fishing', 'fireplace'],
        contactPhone: '+1 555-0321',
        checkInTime: '15:00',
        checkOutTime: '11:00',
        pricePerNight: 379,
        currency: 'USD',
        reviewCount: 689,
        averageRating: 4.7,
      },
      {
        id: '5',
        name: 'Mountain Mist Inn',
        description: 'Cozy mountain inn with breathtaking views. Enjoy complimentary breakfast and afternoon tea by the fireplace.',
        address: '567 Summit Road',
        city: 'Aspen',
        country: 'United States',
        latitude: 39.1911,
        longitude: -106.8175,
        starRating: 3,
        imageUrls: [
          'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
        ],
        amenities: ['wifi', 'breakfast', 'parking', 'fireplace', 'mountain_views'],
        contactPhone: '+1 555-0567',
        checkInTime: '14:00',
        checkOutTime: '11:00',
        pricePerNight: 149,
        currency: 'USD',
        reviewCount: 421,
        averageRating: 4.4,
      },
      {
        id: '6',
        name: 'Botanical Suites',
        description: 'Urban oasis with rooftop gardens and plant-filled rooms. Each suite features a unique botanical theme.',
        address: '890 Garden Street',
        city: 'Los Angeles',
        country: 'United States',
        latitude: 34.0522,
        longitude: -118.2437,
        starRating: 4,
        imageUrls: [
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
          'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800',
        ],
        amenities: ['wifi', 'restaurant', 'rooftop', 'gym', 'yoga', 'organic_spa'],
        contactPhone: '+1 555-0890',
        checkInTime: '15:00',
        checkOutTime: '12:00',
        pricePerNight: 219,
        currency: 'USD',
        reviewCount: 567,
        averageRating: 4.5,
      },
    ];

    const mockRooms: Room[] = [
      {
        id: 'r1',
        hotelId: '1',
        type: 'deluxe',
        name: 'Forest View Deluxe',
        capacity: 2,
        basePrice: 299,
        currency: 'USD',
        amenities: ['king_bed', 'balcony', 'mini_bar', 'safe', 'coffee_maker'],
        images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'],
        bedType: 'King',
        size: 45,
      },
      {
        id: 'r2',
        hotelId: '1',
        type: 'suite',
        name: 'Treehouse Suite',
        capacity: 4,
        basePrice: 499,
        currency: 'USD',
        amenities: ['king_bed', 'living_room', 'jacuzzi', 'balcony', 'mini_bar', 'safe'],
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
        bedType: 'King + Sofa Bed',
        size: 75,
      },
      {
        id: 'r3',
        hotelId: '1',
        type: 'standard',
        name: 'Garden Room',
        capacity: 2,
        basePrice: 199,
        currency: 'USD',
        amenities: ['queen_bed', 'garden_view', 'safe', 'coffee_maker'],
        images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'],
        bedType: 'Queen',
        size: 32,
      },
    ];

    const mockReviews: Review[] = [
      {
        id: 'rev1',
        hotelId: '1',
        user: {
          id: 'u1',
          name: 'Sarah Mitchell',
          avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        },
        rating: 5,
        title: 'Absolutely magical experience!',
        comment: 'The Forest Haven Resort exceeded all expectations. The spa treatments were divine, and waking up to nature sounds was incredibly peaceful. Will definitely return!',
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'],
        createdAt: new Date('2024-01-15'),
        helpfulCount: 24,
      },
      {
        id: 'rev2',
        hotelId: '1',
        user: {
          id: 'u2',
          name: 'James Chen',
          avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        },
        rating: 4,
        title: 'Great getaway spot',
        comment: 'Beautiful property with excellent service. The restaurant food was outstanding. Only minor issue was slow wifi in the rooms, but who needs wifi when surrounded by nature?',
        images: [],
        createdAt: new Date('2024-01-10'),
        helpfulCount: 12,
      },
      {
        id: 'rev3',
        hotelId: '1',
        user: {
          id: 'u3',
          name: 'Emily Rodriguez',
          avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
        },
        rating: 5,
        title: 'Perfect anniversary celebration',
        comment: 'We celebrated our 10th anniversary here and it was perfect. The staff arranged a surprise dinner by the lake. Unforgettable memories!',
        images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400'],
        createdAt: new Date('2024-01-05'),
        helpfulCount: 31,
      },
    ];

    const mockBookings: Booking[] = [
      {
        id: 'b1',
        userId: 'user1',
        hotel: mockHotels[0],
        room: mockRooms[0],
        checkInDate: '2024-02-15',
        checkOutDate: '2024-02-18',
        guestCount: 2,
        status: 'confirmed',
        totalPrice: 897,
        taxes: 89.70,
        fees: 25,
        confirmationCode: 'FDH-2024-0215',
        createdAt: new Date('2024-01-20'),
        specialRequests: 'Late check-in requested',
      },
      {
        id: 'b2',
        userId: 'user1',
        hotel: mockHotels[2],
        room: mockRooms[2],
        checkInDate: '2024-01-10',
        checkOutDate: '2024-01-12',
        guestCount: 2,
        status: 'checked_out',
        totalPrice: 398,
        taxes: 39.80,
        fees: 15,
        confirmationCode: 'FDH-2024-0110',
        createdAt: new Date('2024-01-05'),
      },
    ];

    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: 'pm1',
        type: 'card',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true,
      },
      {
        id: 'pm2',
        type: 'card',
        last4: '8888',
        brand: 'Mastercard',
        expiryMonth: 6,
        expiryYear: 2025,
        isDefault: false,
      },
    ];

    const mockNotifications: Notification[] = [
      {
        id: 'n1',
        type: 'booking',
        title: 'Booking Confirmed!',
        message: 'Your reservation at Forest Haven Resort has been confirmed.',
        read: false,
        createdAt: new Date('2024-01-20'),
      },
      {
        id: 'n2',
        type: 'promo',
        title: '🌲 Spring Sale: 20% Off!',
        message: 'Book now and save 20% on all nature retreats this spring.',
        read: false,
        createdAt: new Date('2024-01-18'),
      },
      {
        id: 'n3',
        type: 'reminder',
        title: 'Check-in Tomorrow',
        message: 'Your stay at Treehouse Retreat starts tomorrow. Get ready for adventure!',
        read: true,
        createdAt: new Date('2024-01-09'),
      },
    ];

    set({
      hotels: mockHotels,
      featuredHotels: mockHotels.slice(0, 3),
      nearbyHotels: mockHotels.slice(2, 6),
      rooms: mockRooms,
      reviews: mockReviews,
      bookings: mockBookings,
      paymentMethods: mockPaymentMethods,
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter((n) => !n.read).length,
      favorites: ['1', '3'],
    });
  },
}));