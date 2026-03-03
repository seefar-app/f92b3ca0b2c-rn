import { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  TextInput,
  FlatList,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';
import { useLocation } from '@/hooks/useLocation';
import { HotelCard } from '@/components/shared/HotelCard';
import { DatePicker } from '@/components/shared/DatePicker';
import { Hotel } from '@/types';
import { addDays } from 'date-fns';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { 
    featuredHotels, 
    nearbyHotels, 
    hotels,
    searchFilters, 
    setSearchFilters,
    addRecentSearch,
  } = useStore();
  const { location } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(addDays(new Date(), 1));
  
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      setSearchFilters({ 
        location: searchQuery,
        checkInDate: checkIn.toISOString().split('T')[0],
        checkOutDate: checkOut.toISOString().split('T')[0],
      });
      router.push('/search/results');
    }
  };

  const handleHotelPress = (hotel: Hotel) => {
    router.push(`/hotel/${hotel.id}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderFeaturedItem = ({ item }: { item: Hotel }) => (
    <HotelCard 
      hotel={item} 
      onPress={() => handleHotelPress(item)} 
      variant="featured"
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />
        }
      >
        {/* Hero Header */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200' }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(6, 78, 59, 0.4)', 'rgba(5, 150, 105, 0.95)']}
            style={styles.heroGradient}
          >
            <View style={[styles.heroContent, { paddingTop: insets.top + 16 }]}>
              <View style={styles.heroHeader}>
                <View>
                  <Text style={styles.greeting}>{getGreeting()}</Text>
                  <Text style={styles.userName}>
                    {user?.firstName || 'Nature Lover'} 🌲
                  </Text>
                </View>
                <Pressable 
                  style={styles.notificationButton}
                  onPress={() => {}}
                >
                  <Ionicons name="notifications-outline" size={24} color="#ffffff" />
                  <View style={styles.notificationBadge} />
                </Pressable>
              </View>

              <Text style={styles.heroTitle}>
                Find Your Perfect{'\n'}Nature Escape
              </Text>

              {/* Search Box */}
              <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: theme.background }]}>
                  <Ionicons name="search" size={20} color="#059669" />
                  <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Where do you want to stay?"
                    placeholderTextColor={theme.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={20} color={theme.textTertiary} />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Date Picker */}
              <DatePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onCheckInChange={setCheckIn}
                onCheckOutChange={setCheckOut}
              />

              <Pressable 
                style={styles.searchButton}
                onPress={handleSearch}
              >
                <LinearGradient
                  colors={['#f59e0b', '#fbbf24']}
                  style={styles.searchButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.searchButtonText}>Search Hotels</Text>
                  <Ionicons name="arrow-forward" size={20} color="#1f2937" />
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <Animated.View 
          style={[
            styles.quickActions,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Pressable 
            style={[styles.quickAction, { backgroundColor: '#d1fae5' }]}
            onPress={() => setShowMap(true)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#059669' }]}>
              <Ionicons name="map" size={24} color="#ffffff" />
            </View>
            <Text style={[styles.quickActionText, { color: theme.text }]}>
              Explore Map
            </Text>
          </Pressable>

          <Pressable 
            style={[styles.quickAction, { backgroundColor: '#fef3c7' }]}
            onPress={() => {}}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#f59e0b' }]}>
              <Ionicons name="flash" size={24} color="#ffffff" />
            </View>
            <Text style={[styles.quickActionText, { color: theme.text }]}>
              Last Minute
            </Text>
          </Pressable>

          <Pressable 
            style={[styles.quickAction, { backgroundColor: '#fce7f3' }]}
            onPress={() => {}}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#ec4899' }]}>
              <Ionicons name="heart" size={24} color="#ffffff" />
            </View>
            <Text style={[styles.quickActionText, { color: theme.text }]}>
              Favorites
            </Text>
          </Pressable>
        </Animated.View>

        {/* Featured Section */}
        <Animated.View 
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                🌟 Featured Retreats
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Hand-picked nature escapes
              </Text>
            </View>
            <Pressable>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <FlatList
            data={featuredHotels}
            renderItem={renderFeaturedItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </Animated.View>

        {/* Nearby Section */}
        <Animated.View 
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                📍 Nearby Hotels
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                {location?.address || 'Based on your location'}
              </Text>
            </View>
            <Pressable onPress={() => setShowMap(true)}>
              <Text style={styles.seeAll}>View map</Text>
            </Pressable>
          </View>

          {nearbyHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onPress={() => handleHotelPress(hotel)}
            />
          ))}
        </Animated.View>

        {/* Eco Tips Section */}
        <View style={[styles.ecoSection, { backgroundColor: '#d1fae5' }]}>
          <View style={styles.ecoContent}>
            <Ionicons name="leaf" size={32} color="#059669" />
            <View style={styles.ecoText}>
              <Text style={[styles.ecoTitle, { color: '#064e3b' }]}>
                Travel Sustainably
              </Text>
              <Text style={[styles.ecoDescription, { color: '#047857' }]}>
                All our partner hotels follow eco-friendly practices
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Map Modal */}
      {showMap && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.background }]}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: location?.latitude || 37.7749,
              longitude: location?.longitude || -122.4194,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            showsUserLocation
          >
            {hotels.map((hotel) => (
              <Marker
                key={hotel.id}
                coordinate={{
                  latitude: hotel.latitude,
                  longitude: hotel.longitude,
                }}
                title={hotel.name}
                description={`$${hotel.pricePerNight}/night`}
                pinColor="#059669"
                onCalloutPress={() => {
                  setShowMap(false);
                  handleHotelPress(hotel);
                }}
              />
            ))}
          </MapView>
          
          <View style={[styles.mapHeader, { paddingTop: insets.top + 12 }]}>
            <Pressable 
              style={[styles.closeMapButton, { backgroundColor: theme.background }]}
              onPress={() => setShowMap(false)}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
            <View style={[styles.mapSearchBox, { backgroundColor: theme.background }]}>
              <Ionicons name="search" size={20} color={theme.textTertiary} />
              <Text style={[styles.mapSearchText, { color: theme.textSecondary }]}>
                Search this area
              </Text>
            </View>
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
  heroContainer: {
    height: 520,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    flex: 1,
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
    lineHeight: 40,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  featuredList: {
    paddingRight: 20,
  },
  ecoSection: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
  },
  ecoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ecoText: {
    flex: 1,
  },
  ecoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  ecoDescription: {
    fontSize: 14,
  },
  mapHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
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
  mapSearchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapSearchText: {
    fontSize: 14,
  },
});