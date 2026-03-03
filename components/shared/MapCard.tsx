import { View, Text, StyleSheet, Pressable } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface MapCardProps {
  latitude: number;
  longitude: number;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  height?: number;
}

export function MapCard({
  latitude,
  longitude,
  title,
  subtitle,
  onPress,
  height = 150,
}: MapCardProps) {
  const theme = useTheme();

  return (
    <Pressable 
      onPress={onPress}
      style={[styles.container, { backgroundColor: theme.card }]}
    >
      <View style={[styles.mapContainer, { height }]}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Marker 
            coordinate={{ latitude, longitude }}
            pinColor="#059669"
          />
        </MapView>
        <View style={styles.overlay}>
          <Ionicons name="expand-outline" size={24} color="#ffffff" />
        </View>
      </View>
      {(title || subtitle) && (
        <View style={styles.content}>
          {title && (
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapContainer: {
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    padding: 8,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});