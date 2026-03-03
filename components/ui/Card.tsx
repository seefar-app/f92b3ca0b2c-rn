import { 
  View, 
  Pressable, 
  StyleSheet, 
  ViewStyle,
  Animated,
} from 'react-native';
import { useRef, ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({ 
  children, 
  variant = 'default',
  onPress,
  style,
  padding = 'medium',
}: CardProps) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  };

  const paddingValues = {
    none: 0,
    small: 12,
    medium: 16,
    large: 24,
  };

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.card,
      padding: paddingValues[padding],
      borderWidth: variant === 'outlined' ? 1 : 0,
      borderColor: variant === 'outlined' ? theme.border : 'transparent',
      shadowColor: variant === 'elevated' ? '#000' : 'transparent',
      shadowOpacity: variant === 'elevated' ? 0.08 : 0,
      shadowOffset: variant === 'elevated' ? { width: 0, height: 4 } : { width: 0, height: 0 },
      shadowRadius: variant === 'elevated' ? 12 : 0,
      elevation: variant === 'elevated' ? 4 : 0,
    },
    style,
  ];

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={cardStyle}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
  },
});