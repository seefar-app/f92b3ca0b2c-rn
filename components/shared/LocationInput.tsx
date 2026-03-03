import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface LocationInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  onCurrentLocationPress?: () => void;
}

export function LocationInput({
  value,
  onChangeText,
  placeholder = 'Enter location',
  label,
  onCurrentLocationPress,
}: LocationInputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundSecondary,
            borderColor: isFocused ? '#059669' : theme.border,
            borderWidth: isFocused ? 2 : 1,
          },
        ]}
      >
        <Ionicons 
          name="location-outline" 
          size={20} 
          color="#059669" 
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {onCurrentLocationPress && (
          <Pressable onPress={onCurrentLocationPress} style={styles.currentLocation}>
            <Ionicons name="navigate" size={18} color="#059669" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  currentLocation: {
    padding: 8,
    backgroundColor: '#d1fae5',
    borderRadius: 8,
  },
});