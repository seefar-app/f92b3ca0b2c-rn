import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { differenceInDays } from 'date-fns';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Room } from '@/types';

export default function RoomSelectionScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { hotelId } = useLocalSearchParams<{ hotelId: string }>();
  const { hotels, rooms, searchFilters, selectRoom } = useStore();
  
  const hotel = hotels.find((h) => h.id === hotelId);
  const availableRooms = rooms.filter((r) => r.hotelId === hotelId);
  
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!hotel) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.errorContainer, { paddingTop: insets.top + 60 }]}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.textTertiary} />
          <Text style={[styles.errorText, { color: theme.text }]}>Hotel not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const nights = differenceInDays(
    new Date(searchFilters.checkOutDate),
    new Date(searchFilters.checkInDate)
  );

  const handleRoomSelect = async (room: Room) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRoomId(room.id);
  };

  const handleContinue = () => {
    const room = availableRooms.find((r) => r.id === selectedRoomId);
    if (room) {
      selectRoom(room);
      router.push('/booking/confirm');
    }
  };

  const renderRoomCard = (room: Room) => {
    const isSelected = selectedRoomId === room.id;
    const totalPrice = room.basePrice * nights;

    return (
      <Card
        key={room.id}
        variant="elevated"
        style={[
          styles.roomCard,
          isSelected && { borderWidth: 2, borderColor: '#059669' },
        ]}
        onPress={() => handleRoomSelect(room)}
      >
        <View style={styles.roomImageContainer}>
          <Image
            source={{ uri: room.images[0] }}
            style={styles.roomImage}
            contentFit="cover"
          />
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={28} color="#059669" />
            </View>
          )}
        </View>

        <View style={styles.roomContent}>
          <View style={styles.roomHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.roomName, { color: theme.text }]}>{room.name}</Text>
              <Text style={[styles.roomType, { color: theme.textSecondary }]}>
                {room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={[styles.roomPrice, { color: '#059669' }]}>
                ${room.basePrice}
              </Text>
              <Text style={[styles.perNight, { color: theme.textTertiary }]}>
                /night
              </Text>
            </View>
          </View>

          <View style={styles.roomDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                Up to {room.capacity} guests
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="bed-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {room.bedType}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="resize-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {room.size} m²
              </Text>
            </View>
          </View>

          <View style={styles.amenitiesList}>
            {room.amenities.slice(0, 4).map((amenity, index) => (
              <View key={index} style={[styles.amenityChip, { backgroundColor: '#d1fae5' }]}>
                <Text style={styles.amenityChipText}>
                  {amenity.replace('_', ' ')}
                </Text>
              </View>
            ))}
            {room.amenities.length > 4 && (
              <Text style={[styles.moreAmenities, { color: theme.textTertiary }]}>
                +{room.amenities.length - 4} more
              </Text>
            )}
          </View>

          <View style={styles.totalPriceRow}>
            <Text style={[styles.totalLabel, { color: theme.textTertiary }]}>
              Total for {nights} {nights === 1 ? 'night' : 'nights'}
            </Text>
            <Text style={[styles.totalPrice, { color: theme.text }]}>
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Select Room</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {hotel.name}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {availableRooms.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bed-outline" size={64} color={theme.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No rooms available
              </Text>
              <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
                Try adjusting your dates or search criteria
              </Text>
            </View>
          ) : (
            availableRooms.map(renderRoomCard)
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Bar */}
      {selectedRoomId && (
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: insets.bottom + 16,
              backgroundColor: theme.background,
            },
          ]}
        >
          <Button
            title="Continue to Booking"
            onPress={handleContinue}
            icon="arrow-forward"
            iconPosition="right"
            fullWidth
          />
        </View>
      )}
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  roomCard: {
    marginBottom: 16,
    padding: 0,
  },
  roomImageContainer: {
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 4,
  },
  roomContent: {
    padding: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '700',
  },
  roomType: {
    fontSize: 14,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  roomPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
  perNight: {
    fontSize: 12,
  },
  roomDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  amenityChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amenityChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
    textTransform: 'capitalize',
  },
  moreAmenities: {
    fontSize: 12,
    alignSelf: 'center',
  },
  totalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 14,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
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