import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format, differenceInDays } from 'date-fns';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Booking } from '@/types';

export default function BookingConfirmScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useAuthStore();
  const {
    selectedHotel,
    selectedRoom,
    searchFilters,
    paymentMethods,
    addBooking,
  } = useStore();

  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState(
    paymentMethods.find((pm) => pm.isDefault)?.id || paymentMethods[0]?.id || ''
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!selectedHotel || !selectedRoom) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.errorContainer, { paddingTop: insets.top + 60 }]}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.textTertiary} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            Booking information missing
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const nights = differenceInDays(
    new Date(searchFilters.checkOutDate),
    new Date(searchFilters.checkInDate)
  );

  const subtotal = selectedRoom.basePrice * nights;
  const taxes = subtotal * 0.1; // 10% tax
  const serviceFee = 25;
  const total = subtotal + taxes + serviceFee;

  const handleConfirmBooking = async () => {
    if (!selectedPaymentId) {
      Alert.alert('Payment Required', 'Please select a payment method');
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsProcessing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newBooking: Booking = {
      id: 'b' + Date.now(),
      userId: user?.id || 'guest',
      hotel: selectedHotel,
      room: selectedRoom,
      checkInDate: searchFilters.checkInDate,
      checkOutDate: searchFilters.checkOutDate,
      guestCount: searchFilters.guests,
      status: 'confirmed',
      totalPrice: total,
      taxes,
      fees: serviceFee,
      confirmationCode: `NH-${Date.now().toString().slice(-8).toUpperCase()}`,
      createdAt: new Date(),
      specialRequests: specialRequests || undefined,
    };

    addBooking(newBooking);
    setIsProcessing(false);

    router.replace(`/booking/success?bookingId=${newBooking.id}`);
  };

  const selectedPayment = paymentMethods.find((pm) => pm.id === selectedPaymentId);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Confirm Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Hotel Summary */}
          <Card variant="elevated" style={styles.section}>
            <View style={styles.hotelSummary}>
              <Image
                source={{ uri: selectedHotel.imageUrls[0] }}
                style={styles.hotelImage}
                contentFit="cover"
              />
              <View style={styles.hotelInfo}>
                <Text style={[styles.hotelName, { color: theme.text }]} numberOfLines={2}>
                  {selectedHotel.name}
                </Text>
                <Text style={[styles.roomName, { color: theme.textSecondary }]}>
                  {selectedRoom.name}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={[styles.rating, { color: theme.text }]}>
                    {selectedHotel.averageRating}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Booking Details */}
          <Card variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Booking Details
            </Text>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={20} color="#059669" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>
                    Check-in
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {format(new Date(searchFilters.checkInDate), 'MMM d, yyyy')}
                  </Text>
                  <Text style={[styles.detailTime, { color: theme.textSecondary }]}>
                    After {selectedHotel.checkInTime}
                  </Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={20} color="#059669" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>
                    Check-out
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {format(new Date(searchFilters.checkOutDate), 'MMM d, yyyy')}
                  </Text>
                  <Text style={[styles.detailTime, { color: theme.textSecondary }]}>
                    Before {selectedHotel.checkOutTime}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="moon-outline" size={20} color="#059669" />
                <View>
                  <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>
                    Duration
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {nights} {nights === 1 ? 'night' : 'nights'}
                  </Text>
                </View>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={20} color="#059669" />
                <View>
                  <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>
                    Guests
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {searchFilters.guests} {searchFilters.guests === 1 ? 'guest' : 'guests'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Guest Information */}
          <Card variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Guest Information
            </Text>
            <View style={styles.guestInfo}>
              <View style={styles.guestRow}>
                <Ionicons name="person-outline" size={20} color={theme.textSecondary} />
                <Text style={[styles.guestText, { color: theme.text }]}>
                  {user?.firstName} {user?.lastName}
                </Text>
              </View>
              <View style={styles.guestRow}>
                <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
                <Text style={[styles.guestText, { color: theme.text }]}>
                  {user?.email}
                </Text>
              </View>
              {user?.phone && (
                <View style={styles.guestRow}>
                  <Ionicons name="call-outline" size={20} color={theme.textSecondary} />
                  <Text style={[styles.guestText, { color: theme.text }]}>
                    {user.phone}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Special Requests */}
          <Card variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Special Requests (Optional)
            </Text>
            <Input
              placeholder="e.g., Late check-in, high floor, extra pillows..."
              value={specialRequests}
              onChangeText={setSpecialRequests}
              multiline
              numberOfLines={4}
              style={{ height: 100, textAlignVertical: 'top' }}
            />
          </Card>

          {/* Payment Method */}
          <Card variant="elevated" style={styles.section}>
            <View style={styles.paymentHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Payment Method
              </Text>
              <Pressable onPress={() => router.push('/profile/payment-methods')}>
                <Text style={styles.addPaymentText}>Add new</Text>
              </Pressable>
            </View>
            {paymentMethods.length === 0 ? (
              <View style={styles.noPayment}>
                <Ionicons name="card-outline" size={32} color={theme.textTertiary} />
                <Text style={[styles.noPaymentText, { color: theme.textSecondary }]}>
                  No payment methods added
                </Text>
                <Button
                  title="Add Payment Method"
                  onPress={() => router.push('/profile/payment-methods')}
                  variant="outline"
                  size="small"
                />
              </View>
            ) : (
              paymentMethods.map((method) => (
                <Pressable
                  key={method.id}
                  onPress={() => setSelectedPaymentId(method.id)}
                  style={[
                    styles.paymentMethod,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      borderWidth: selectedPaymentId === method.id ? 2 : 0,
                      borderColor: '#059669',
                    },
                  ]}
                >
                  <View style={styles.paymentInfo}>
                    <Ionicons name="card" size={24} color={theme.text} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.paymentBrand, { color: theme.text }]}>
                        {method.brand} •••• {method.last4}
                      </Text>
                      <Text style={[styles.paymentExpiry, { color: theme.textSecondary }]}>
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </Text>
                    </View>
                    {selectedPaymentId === method.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#059669" />
                    )}
                  </View>
                </Pressable>
              ))
            )}
          </Card>

          {/* Price Breakdown */}
          <Card variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Price Breakdown
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                ${selectedRoom.basePrice} × {nights} {nights === 1 ? 'night' : 'nights'}
              </Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                Taxes & fees
              </Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>
                ${taxes.toFixed(2)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                Service fee
              </Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>
                ${serviceFee.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
              <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: '#059669' }]}>
                ${total.toFixed(2)}
              </Text>
            </View>
          </Card>

          {/* Cancellation Policy */}
          <Card variant="outlined" style={styles.section}>
            <View style={styles.policyHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#3b82f6" />
              <Text style={[styles.policyTitle, { color: theme.text }]}>
                Cancellation Policy
              </Text>
            </View>
            <Text style={[styles.policyText, { color: theme.textSecondary }]}>
              Free cancellation up to 48 hours before check-in. After that, 50% of the
              total amount will be charged.
            </Text>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: theme.background,
          },
        ]}
      >
        <View style={styles.bottomInfo}>
          <Text style={[styles.bottomLabel, { color: theme.textTertiary }]}>Total</Text>
          <Text style={[styles.bottomPrice, { color: '#059669' }]}>
            ${total.toFixed(2)}
          </Text>
        </View>
        <Button
          title={isProcessing ? 'Processing...' : 'Confirm & Pay'}
          onPress={handleConfirmBooking}
          loading={isProcessing}
          disabled={isProcessing || !selectedPaymentId}
          icon="checkmark-circle"
          iconPosition="right"
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  hotelSummary: {
    flexDirection: 'row',
    gap: 12,
  },
  hotelImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  hotelInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  hotelName: {
    fontSize: 16,
    fontWeight: '700',
  },
  roomName: {
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  detailTime: {
    fontSize: 12,
    marginTop: 2,
  },
  guestInfo: {
    gap: 12,
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guestText: {
    fontSize: 15,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addPaymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  paymentMethod: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentBrand: {
    fontSize: 15,
    fontWeight: '600',
  },
  paymentExpiry: {
    fontSize: 13,
    marginTop: 2,
  },
  noPayment: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  noPaymentText: {
    fontSize: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 15,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  policyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomInfo: {
    flex: 0.6,
  },
  bottomLabel: {
    fontSize: 12,
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
});