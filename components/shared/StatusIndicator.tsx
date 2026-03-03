import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  size?: 'small' | 'medium' | 'large';
  pulse?: boolean;
}

export function StatusIndicator({ 
  status, 
  size = 'medium', 
  pulse = true,
}: StatusIndicatorProps) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const sizes = {
    small: 8,
    medium: 12,
    large: 16,
  };

  const colors = {
    online: '#10b981',
    offline: theme.textTertiary,
    busy: '#ef4444',
    away: '#f59e0b',
  };

  useEffect(() => {
    if (pulse && status === 'online') {
      const animation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.5,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      animation.start();
      return () => animation.stop();
    }
  }, [pulse, status, scaleAnim, opacityAnim]);

  const dimension = sizes[size];

  return (
    <View style={styles.container}>
      {pulse && status === 'online' && (
        <Animated.View
          style={[
            styles.pulse,
            {
              width: dimension * 2,
              height: dimension * 2,
              borderRadius: dimension,
              backgroundColor: colors[status],
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
      )}
      <View
        style={[
          styles.indicator,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: colors[status],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  indicator: {},
});