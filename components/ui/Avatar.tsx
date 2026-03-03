import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/useTheme';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showStatus?: boolean;
  isOnline?: boolean;
  style?: ViewStyle;
}

export function Avatar({ 
  source, 
  name, 
  size = 'medium',
  showStatus = false,
  isOnline = false,
  style,
}: AvatarProps) {
  const theme = useTheme();

  const sizes = {
    small: 32,
    medium: 44,
    large: 56,
    xlarge: 80,
  };

  const fontSizes = {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 28,
  };

  const statusSizes = {
    small: 10,
    medium: 12,
    large: 14,
    xlarge: 18,
  };

  const dimension = sizes[size];

  const getInitials = () => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.container, { width: dimension, height: dimension }, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={[styles.image, { width: dimension, height: dimension, borderRadius: dimension / 2 }]}
          contentFit="cover"
        />
      ) : (
        <View 
          style={[
            styles.fallback, 
            { 
              width: dimension, 
              height: dimension, 
              borderRadius: dimension / 2,
              backgroundColor: '#059669',
            }
          ]}
        >
          <Text style={[styles.initials, { fontSize: fontSizes[size] }]}>
            {getInitials()}
          </Text>
        </View>
      )}
      {showStatus && (
        <View 
          style={[
            styles.status, 
            { 
              width: statusSizes[size], 
              height: statusSizes[size],
              borderRadius: statusSizes[size] / 2,
              backgroundColor: isOnline ? '#10b981' : theme.textTertiary,
              borderColor: theme.background,
            }
          ]} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    overflow: 'hidden',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#ffffff',
    fontWeight: '600',
  },
  status: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
});