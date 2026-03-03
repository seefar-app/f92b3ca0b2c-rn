import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Hotel } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';

interface HotelCardProps {
  hotel: Hotel;
  onPress: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

export function HotelCard({ hotel, onPress, variant = 'default' }: HotelCardProps) {
  const theme = useTheme();
  const { favorites, toggleFavorite } = useStore();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isFavorite = favorites.includes(hotel.id);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleFavorite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(hotel.id);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < hotel.starRating ? 'star' : 'star-outline'}
        size={12}
        color={i < hotel.starRating ? '#f59e0b' : theme.textTertiary}
        style={{ marginRight: 2 }}
      />
    ));
  };

  if (variant === 'compact') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.compactCard, { backgroundColor: theme.card }]}
        >
          <Image
            source={{ uri: hotel.imageUrls[0] }}
            style={styles.compactImage}
            contentFit="cover"
          />
          <View style={styles.compactContent}>
            <Text style={[styles.compactName, { color: theme.text }]} numberOfLines={1}>
              {hotel.name}
            </Text>
            <Text style={[styles.compactLocation, { color: theme.textSecondary }]} numberOfLines={1}>
              {hotel.city}
            </Text>
            <View style={styles.compactBottom}>
              <View style={styles.rating}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={[styles.ratingText, { color: theme.text }]}>
                  {hotel.averageRating}
                </Text>
              </View>
              <Text style={[styles.compactPrice, { color: '#059669' }]}>
                ${hotel.pricePerNight}
                <Text style={{ color: theme.textTertiary, fontSize: 12 }}>/night</Text>
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  if (variant === 'featured') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.featuredCard, { backgroundColor: theme.card }]}
        >
          <Image
            source={{ uri: hotel.imageUrls[0] }}
            style={styles.featuredImage}
            contentFit="cover"
          />
          <Pressable
            onPress={handleFavorite}
            style={[styles.favoriteButton, { backgroundColor: theme.background }]}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#ef4444' : theme.textSecondary}
            />
          </Pressable>
          <View style={styles.featuredOverlay}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>Featured</Text>
            </View>
          </View>
          <View style={styles.featuredContent}>
            <Text style={[styles.featuredName, { color: theme.text }]} numberOfLines={1}>
              {hotel.name}
            </Text>
            <View style={styles.featuredLocation}>
              <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
              <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                {hotel.city}, {hotel.country}
              </Text>
            </View>
            <View style={styles.featuredBottom}>
              <View style={styles.stars}>{renderStars()}</View>
              <Text style={[styles.featuredPrice, { color: '#059669' }]}>
                ${hotel.pricePerNight}
                <Text style={{ color: theme.textTertiary, fontSize: 14 }}>/night</Text>
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, { backgroundColor: theme.card }]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: hotel.imageUrls[0] }}
            style={styles.image}
            contentFit="cover"
          />
          <Pressable
            onPress={handleFavorite}
            style={[styles.favoriteButton, { backgroundColor: theme.background }]}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#ef4444' : theme.textSecondary}
            />
          </Pressable>
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {hotel.name}
            </Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={[styles.ratingText, { color: theme.text }]}>
                {hotel.averageRating}
              </Text>
              <Text style={[styles.reviewCount, { color: theme.textTertiary }]}>
                ({hotel.reviewCount})
              </Text>
            </View>
          </View>
          <View style={styles.location}>
            <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>
              {hotel.city}, {hotel.country}
            </Text>
          </View>
          <View style={styles.amenities}>
            {hotel.amenities.slice(0, 3).map((amenity, index) => (
              <View 
                key={index} 
                style={[styles.amenityBadge, { backgroundColor: '#d1fae5' }]}
              >
                <Text style={styles.amenityText}>{amenity.replace('_', ' ')}</Text>
              </View>
            ))}
          </View>
          <View style={styles.footer}>
            <View style={styles.stars}>{renderStars()}</View>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: '#059669' }]}>
                ${hotel.pricePerNight}
              </Text>
              <Text style={[styles.perNight, { color: theme.textTertiary }]}>
                /night
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    marginLeft: 2,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  amenities: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#059669',
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
  },
  perNight: {
    fontSize: 14,
    marginLeft: 2,
  },
  // Compact styles
  compactCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  compactImage: {
    width: 100,
    height: 100,
  },
  compactContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  compactName: {
    fontSize: 15,
    fontWeight: '600',
  },
  compactLocation: {
    fontSize: 13,
  },
  compactBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  // Featured styles
  featuredCard: {
    width: 280,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  featuredImage: {
    width: '100%',
    height: 160,
  },
  featuredOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  featuredBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  featuredBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  featuredContent: {
    padding: 16,
  },
  featuredName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  featuredLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featuredBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
});