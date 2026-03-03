import { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Animated,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Booking, BookingStatus } from '@/types';

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { bookings } = useStore();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const upcomingBookings = bookings.filter(b => 
    ['confirmed', 'checked_in', 'pending_payment'].includes(b.status)
  );
  
  const pastBookings = bookings.filter(b => 
    ['checked_out', 'cancelled_by_user', 'cancelled_by_hotel', 'no_show'].includes(b.status)
  );

  const getStatusBadge = (status: BookingStatus) => {
    const config = {
      pending_payment: { label: 'Pending Payment', variant: 'warning' as const },
      confirmed: { label: 'Confirmed', variant: 'success' as const },
      checked_in: { label: 'Checked In', variant: 'info' as const },
      checked_out: { label: 'Completed', variant: 'default' as const },
      cancelled_by_user: { label: 'Cancelled', variant: 'error' as const },
      cancelled_by_hotel: { label: 'Cancelled by Hotel', variant: 'error' as const },
      no_show: { label: 'No Show', variant: 'error' as const },
    };
    return config[status];
  };

  const renderBookingCard = (booking: Booking) => {
    const nights = differenceInDays(
      new Date(booking.checkOutDate),
      new Date(booking.checkInDate)
    );
    const statusConfig = getStatusBadge(booking.status);

    return (
      <Card 
        key={booking.id}
        variant="elevated"
        onPress={() => router.push(`/hotel/${booking.hotel.id}`)}
        style={styles.bookingCard}
        padding="none"
      >
        <View style={styles.bookingImageContainer}>
          <Image
            source={{ uri: booking.hotel.imageUrls[0] }}
            style={styles.bookingImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.imageOverlay}
          >
            <Badge 
              label={statusConfig.label} 
              variant={statusConfig.variant}
              size="small"
            />
          </LinearGradient>
        </View>

        <View style={styles.bookingContent}>
          <View style={styles.bookingHeader}>
            <Text style={[styles.hotelName, { color: theme.text }]} numberOfLines={1}>
              {booking.hotel.name}
            </Text>
            <View style={styles.confirmationCode}>
              <Ionicons name="qr-code-outline" size={14} color={theme.textTertiary} />
              <Text style={[styles.codeText, { color: theme.textTertiary }]}>
                {booking.confirmationCode}
              </Text>
            </View>
          </View>

          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#059669" />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {format(new Date(booking.checkInDate), 'MMM d')} - {format(new Date(booking.checkOutDate), 'MMM d, yyyy')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="moon-outline" size={16} color="#059669" />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {nights} {nights === 1 ? 'night' : 'nights'} • {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="bed-outline" size={16} color="#059669" />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {booking.room.name}
              </Text>
            </View>
          </View>

          <View style={styles.bookingFooter}>
            <View>
              <Text style={[styles.priceLabel, { color: theme.textTertiary }]}>Total</Text>
              <Text style={[styles.price, { color: '#059669' }]}>
                ${booking.totalPrice.toFixed(2)}
              </Text>
            </View>
            <View style={styles.actionButtons}>
              {booking.status === 'confirmed' && (
                <>
                  <Pressable style={[styles.actionButton, { backgroundColor: '#d1fae5' }]}>
                    <Ionicons name="document-text-outline" size={18} color="#059669" />
                  </Pressable>
                  <Pressable style={[styles.actionButton, { backgroundColor: '#dbeafe' }]}>
                    <Ionicons name="call-outline" size={18} color="#3b82f6" />
                  </Pressable>
                </>
              )}
              <Pressable style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}>
                <Ionicons name="chevron-forward" size={18} color={theme.text} />
              </Pressable>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#059669', '#10b981']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>
          {upcomingBookings.length} upcoming • {pastBookings.length} past
        </Text>
      </LinearGradient>

      {/* Tab Switcher */}
      <Animated.View 
        style={[
          styles.tabContainer,
          { 
            backgroundColor: theme.background,
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.tabSwitcher, { backgroundColor: theme.backgroundSecondary }]}>
          <Pressable
            onPress={() => setActiveTab('upcoming')}
            style={[
              styles.tab,
              activeTab === 'upcoming' && styles.activeTab,
            ]}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'upcoming' ? '#ffffff' : theme.textSecondary },
            ]}>
              Upcoming ({upcomingBookings.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('past')}
            style={[
              styles.tab,
              activeTab === 'past' && styles.activeTab,
            ]}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'past' ? '#ffffff' : theme.textSecondary },
            ]}>
              Past ({pastBookings.length})
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />
        }
      >
        {displayedBookings.length === 0 ? (
          <Animated.View 
            style={[
              styles.emptyState,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={[styles.emptyIcon, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="calendar-outline" size={48} color="#059669" />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No {activeTab} bookings
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
              {activeTab === 'upcoming' 
                ? "Ready for your next adventure? Start exploring nature retreats!"
                : "Your completed stays will appear here."
              }
            </Text>
            {activeTab === 'upcoming' && (
              <Pressable 
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)')}
              >
                <LinearGradient
                  colors={['#059669', '#10b981']}
                  style={styles.exploreButtonGradient}
                >
                  <Text style={styles.exploreButtonText}>Explore Hotels</Text>
                  <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                </LinearGradient>
              </Pressable>
            )}
          </Animated.View>
        ) : (
          <Animated.View 
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            {displayedBookings.map(renderBookingCard)}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tabSwitcher: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#059669',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  bookingCard: {
    marginBottom: 16,
  },
  bookingImageContainer: {
    position: 'relative',
  },
  bookingImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  bookingContent: {
    padding: 16,
  },
  bookingHeader: {
    marginBottom: 12,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  confirmationCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookingDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceLabel: {
    fontSize: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  exploreButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});