import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ThemedTextProps extends TextProps {
  variant?: 'default' | 'secondary' | 'tertiary' | 'heading' | 'title' | 'caption';
  color?: string;
}

export function ThemedText({ 
  style, 
  variant = 'default', 
  color,
  ...props 
}: ThemedTextProps) {
  const theme = useTheme();
  
  const textColor = color ?? {
    default: theme.text,
    secondary: theme.textSecondary,
    tertiary: theme.textTertiary,
    heading: theme.text,
    title: theme.text,
    caption: theme.textTertiary,
  }[variant];

  const textStyle = {
    default: styles.default,
    secondary: styles.secondary,
    tertiary: styles.tertiary,
    heading: styles.heading,
    title: styles.title,
    caption: styles.caption,
  }[variant];

  return <Text style={[textStyle, { color: textColor }, style]} {...props} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  secondary: {
    fontSize: 14,
    lineHeight: 20,
  },
  tertiary: {
    fontSize: 12,
    lineHeight: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
});