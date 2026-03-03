import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export function Badge({ 
  label, 
  variant = 'default', 
  size = 'medium',
  style,
}: BadgeProps) {
  const theme = useTheme();

  const colors = {
    default: { bg: theme.backgroundTertiary, text: theme.textSecondary },
    success: { bg: '#d1fae5', text: '#059669' },
    warning: { bg: '#fef3c7', text: '#d97706' },
    error: { bg: '#fee2e2', text: '#dc2626' },
    info: { bg: '#dbeafe', text: '#2563eb' },
  };

  const { bg, text } = colors[variant];

  const paddingValues = {
    small: { paddingVertical: 4, paddingHorizontal: 8 },
    medium: { paddingVertical: 6, paddingHorizontal: 12 },
  };

  const fontSizes = {
    small: 10,
    medium: 12,
  };

  return (
    <View 
      style={[
        styles.badge, 
        { backgroundColor: bg },
        paddingValues[size],
        style,
      ]}
    >
      <Text style={[styles.label, { color: text, fontSize: fontSizes[size] }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});