import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import MapView, { Marker } from 'react-native-maps';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { format, differenceInDays } from 'date-fns';

const { width, height } = Dimensions.get('window');

export default function HotelDetailScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { hotels, rooms, reviews, favorites, toggleFavorite, searchFilters, selectHotel, setRooms } = useStore();
  
  const hotel = hotels.find((h) => h.id === id);
  const hotelRooms = rooms.filter((r) => r.hotelId === id);
  const hotelReviews = reviews.filter((r) => r.hotelId === id);
  const isFavorite = favorites.includes(id || '');
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hotel) {
      selectHotel(hotel);
      // Mock room data for this hotel
      if (hotelRooms.length === 0) {
        setRooms([
          {
            id: `r${id}1`,
            hotelId: id!,
            type: 'standard',
            name: 'Standard Room',
            capacity: 2,
            basePrice: hotel.pricePerNight,
            currency: hotel.currency,
            amenities: ['queen_bed', 'wifi', 'tv', 'safe'],
            images: [hotel.imageUrls[0]],
            bedType: 'Queen',
            size: 28,
          },
          {
            id: `r${id}2`,
            hotelId: id!,
            type: 'deluxe',
            name: 'Deluxe Room',
            capacity: 2,
            basePrice: hotel.pricePerNight * 1.3,
            currency: hotel.currency,
            amenities: ['king_bed', 'balcony', 'mini_bar', 'safe', 'coffee_maker'],
            images: [hotel.imageUrls[1] || hotel.imageUrls[0]],
            bedType: 'King',
            size: 35,
          },
          {
            id: `r${id}3`,
            hotelId: id!,
            type: 'suite',
            name: 'Executive Suite',
            capacity: 4,
            basePrice: hotel.pricePerNight * 1.8,
            currency: hotel.currency,
            amenities: ['king_bed', 'living_room', 'jacuzzi', 'balcony', 'mini_bar'],
            images: [hotel.imageUrls[2] || hotel.imageUrls[0]],
            bedType: 'King + Sofa Bed',
            size: 55,
          },
        ]);
      }
    }
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [hotel, id]);

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

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.3, 1],
    extrapolate: 'clamp',
  });

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Check out ${hotel.name} on Nature Hotels! ${hotel.description}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleFavorite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(hotel.id);
  };

  const handleBookNow = () => {
    router.push(`/booking/rooms?hotelId=${hotel.id}`);
  };

  const nights = differenceInDays(
    new Date(searchFilters.checkOutDate),
    new Date(searchFilters.checkInDate)
  );

  const renderAmenity = (amenity: string) => {
    const amenityIcons: Record<string, string> = {
      wifi: 'wifi',
      pool: 'water',
      spa: 'fitness',
      restaurant: 'restaurant',
      gym: 'barbell',
      parking: 'car',
      room_service: 'room-service',
      bar: 'wine',
      garden: 'leaf',
      bike_rental: 'bicycle',
      organic_food: 'nutrition',
      hiking: 'trail-sign',
      nature_walks: 'walk',
      bird_watching: 'eye',
      kayaking: 'boat',
      fishing: 'fish',
      fireplace: 'flame',
      mountain_views: 'mountain',
      rooftop: 'business',
      yoga: 'body',
      organic_spa: 'flower',
    };

    return (
      <View key={amenity} style={[styles.amenityItem, { backgroundColor: '#d1fae5' }]}>
        <Ionicons 
          name={amenityIcons[amenity] as any || 'checkmark-circle'} 
          size={18} 
          color="#059669" 
        />
        <Text style={styles.amenityText}>
          {amenity.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </Text>
      </View>
    );
  };

  const displayedAmenities = showAllAmenities ? hotel.amenities : hotel.amenities.slice(0, 6);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image Gallery */}
        <Animated.View style={{ transform: [{ scale: imageScale }] }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(index);
            }}
          >
            {hotel.imageUrls.map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                style={styles.heroImage}
                contentFit="cover"
              />
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {hotel.imageUrls.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === activeImageIndex ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    width: index === activeImageIndex ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header Info */}
          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.hotelName, { color: theme.text }]}>{hotel.name}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={16} color="#059669" />
                  <Text style={[styles.location, { color: theme.textSecondary }]}>
                    {hotel.city}, {hotel.country}
                  </Text>
                </View>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={18} color="#f59e0b" />
                <Text style={[styles.ratingText, { color: theme.text }]}>
                  {hotel.averageRating}
                </Text>
              </View>
            </View>

            <View style={styles.stars}>
              {Array.from({ length: 5 }, (_, i) => (
                <Ionicons
                  key={i}
                  name={i < hotel.starRating ? 'star' : 'star-outline'}
                  size={16}
                  color="#f59e0b"
                  style={{ marginRight: 4 }}
                />
              ))}
              <Text style={[styles.reviewCount, { color: theme.textTertiary }]}>
                ({hotel.reviewCount} reviews)
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={handleFavorite}
            >
              <Ionicons 
                name={isFavorite ? 'heart' : 'heart-outline'} 
                size={22} 
                color={isFavorite ? '#ef4444' : theme.text} 
              />
            </Pressable>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={22} color={theme.text} />
            </Pressable>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => setShowMap(true)}
            >
              <Ionicons name="map-outline" size={22} color={theme.text} />
            </Pressable>
          </View>

          {/* Description */}
          <Card variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {hotel.description}
            </Text>
          </Card>

          {/* Amenities */}
          <Card variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {displayedAmenities.map(renderAmenity)}
            </View>
            {hotel.amenities.length > 6 && (
              <Pressable onPress={() => setShowAllAmenities(!showAllAmenities)}>
                <Text style={styles.showMoreText}>
                  {showAllAmenities ? 'Show less' : `Show all ${hotel.amenities.length} amenities`}
                </Text>
              </Pressable>
            )}
          </Card>

          {/* Check-in/out Info */}
          <Card variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Check-in Information</Text>
            <View style={styles.checkInOutRow}>
              <View style={styles.checkInOutItem}>
                <Ionicons name="log-in-outline" size={24} color="#059669" />
                <Text style={[styles.checkInOutLabel, { color: theme.textTertiary }]}>
                  Check-in
                </Text>
                <Text style={[styles.checkInOutTime, { color: theme.text }]}>
                  {hotel.checkInTime}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={styles.checkInOutItem}>
                <Ionicons name="log-out-outline" size={24} color="#059669" />
                <Text style={[styles.checkInOutLabel, { color: theme.textTertiary }]}>
                  Check-out
                </Text>
                <Text style={[styles.checkInOutTime, { color: theme.text }]}>
                  {hotel.checkOutTime}
                </Text>
              </View>
            </View>
          </Card>

          {/* Reviews Preview */}
          {hotelReviews.length > 0 && (
            <Card variant="elevated" style={styles.section}>
              <View style={styles.reviewsHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Guest Reviews
                </Text>
                <Pressable>
                  <Text style={styles.seeAllReviews}>See all</Text>
                </Pressable>
              </View>
              
              {hotelReviews.slice(0, 2).map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Image
                      source={{ uri: review.user.avatar }}
                      style={styles.reviewAvatar}
                      contentFit="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reviewerName, { color: theme.text }]}>
                        {review.user.name}
                      </Text>
                      <View style={styles.reviewStars}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Ionicons
                            key={i}
                            name={i < review.rating ? 'star' : 'star-outline'}
                            size={12}
                            color="#f59e0b"
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={[styles.reviewDate, { color: theme.textTertiary }]}>
                      {format(review.createdAt, 'MMM d')}
                    </Text>
                  </View>
                  <Text style={[styles.reviewTitle, { color: theme.text }]}>
                    {review.title}
                  </Text>
                  <Text 
                    style={[styles.reviewComment, { color: theme.textSecondary }]}
                    numberOfLines={3}
                  >
                    {review.comment}
                  </Text>
                </View>
              ))}
            </Card>
          )}

          {/* Location Map */}
          <Card variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Location</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: hotel.latitude,
                  longitude: hotel.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: hotel.latitude,
                    longitude: hotel.longitude,
                  }}
                  title={hotel.name}
                  pinColor="#059669"
                />
              </MapView>
              <Pressable 
                style={styles.expandMapButton}
                onPress={() => setShowMap(true)}
              >
                <Ionicons name="expand-outline" size={20} color="#ffffff" />
              </Pressable>
            </View>
            <Text style={[styles.address, { color: theme.textSecondary }]}>
              {hotel.address}
            </Text>
          </Card>

          <View style={{ height: 120 }} />
        </Animated.View>
      </Animated.ScrollView>

      {/* Floating Header */}
      <Animated.View
        style={[
          styles.floatingHeader,
          {
            paddingTop: insets.top + 8,
            opacity: headerOpacity,
          },
        ]}
      >
        <BlurView intensity={80} style={StyleSheet.absoluteFillObject} />
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {hotel.name}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </Animated.View>

      {/* Back Button (visible when header hidden) */}
      <Animated.View
        style={[
          styles.backButtonContainer,
          {
            paddingTop: insets.top + 8,
            opacity: headerOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ]}
        pointerEvents={headerOpacity.interpolate({
          inputRange: [0, 0.5],
          outputRange: ['auto', 'none'],
        }) as any}
      >
        <Pressable onPress={() => router.back()} style={styles.backButtonCircle}>
          <BlurView intensity={80} style={StyleSheet.absoluteFillObject} />
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
      </Animated.View>

      {/* Bottom Booking Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: theme.background,
          },
        ]}
      >
        <View style={styles.priceInfo}>
          <Text style={[styles.priceLabel, { color: theme.textTertiary }]}>From</Text>
          <Text style={[styles.price, { color: '#059669' }]}>
            ${hotel.pricePerNight}
            <Text style={{ fontSize: 16, color: theme.textSecondary }}> /night</Text>
          </Text>
          {nights > 0 && (
            <Text style={[styles.totalPrice, { color: theme.textSecondary }]}>
              ${(hotel.pricePerNight * nights).toFixed(0)} for {nights} {nights === 1 ? 'night' : 'nights'}
            </Text>
          )}
        </View>
        <Button
          title="Select Room"
          onPress={handleBookNow}
          icon="arrow-forward"
          iconPosition="right"
          style={{ flex: 1 }}
        />
      </View>

      {/* Full Screen Map Modal */}
      {showMap && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.background }]}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: hotel.latitude,
              longitude: hotel.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation
          >
            <Marker
              coordinate={{
                latitude: hotel.latitude,
                longitude: hotel.longitude,
              }}
              title={hotel.name}
              description={hotel.address}
              pinColor="#059669"
            />
          </MapView>
          
          <View style={[styles.mapHeader, { paddingTop: insets.top + 12 }]}>
            <Pressable
              style={[styles.closeMapButton, { backgroundColor: theme.background }]}
              onPress={() => setShowMap(false)}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <View style={[styles.mapInfo, { paddingBottom: insets.bottom + 16 }]}>
            <Card variant="elevated" padding="medium">
              <Text style={[styles.mapInfoTitle, { color: theme.text }]}>
                {hotel.name}
              </Text>
              <Text style={[styles.mapInfoAddress, { color: theme.textSecondary }]}>
                {hotel.address}
              </Text>
              <Button
                title="Get Directions"
                icon="navigate"
                onPress={() => {}}
                style={{ marginTop: 12 }}
              />
            </Card>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroImage: {
    width,
    height: height * 0.45,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
  content: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  headerInfo: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  hotelName: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 15,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    fontSize: 14,
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#059669',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginTop: 12,
  },
  checkInOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkInOutItem: {
    flex: 1,
    alignItems: 'center',
  },
  checkInOutLabel: {
    fontSize: 13,
    marginTop: 8,
  },
  checkInOutTime: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 60,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllReviews: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  reviewItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  map: {
    flex: 1,
  },
  expandMapButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  address: {
    fontSize: 14,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
  },
  totalPrice: {
    fontSize: 13,
    marginTop: 2,
  },
  mapHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  closeMapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  mapInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  mapInfoAddress: {
    fontSize: 14,
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