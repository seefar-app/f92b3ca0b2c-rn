import { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Alert,
  Animated,
  Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useStore } from '@/store/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, logout } = useAuthStore();
  const { bookings, favorites, paymentMethods, notifications } = useStore();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
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

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const stats = [
    { label: 'Bookings', value: bookings.length, icon: 'calendar' },
    { label: 'Favorites', value: favorites.length, icon: 'heart' },
    { label: 'Reviews', value: 12, icon: 'star' },
  ];

  const menuItems = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Personal Information', onPress: () => {} },
        { icon: 'card-outline', label: 'Payment Methods', badge: paymentMethods.length.toString(), onPress: () => {} },
        { icon: 'location-outline', label: 'Saved Addresses', onPress: () => {} },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: 'notifications-outline', 
          label: 'Notifications', 
          toggle: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        { 
          icon: 'moon-outline', 
          label: 'Dark Mode', 
          toggle: true,
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
        { icon: 'language-outline', label: 'Language', value: 'English', onPress: () => {} },
        { icon: 'cash-outline', label: 'Currency', value: 'USD ($)', onPress: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help Center', onPress: () => {} },
        { icon: 'chatbubble-outline', label: 'Contact Us', onPress: () => {} },
        { icon: 'document-text-outline', label: 'Terms of Service', onPress: () => {} },
        { icon: 'shield-checkmark-outline', label: 'Privacy Policy', onPress: () => {} },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#059669', '#10b981', '#34d399']}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.headerContent}>
            <Pressable style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="#ffffff" />
            </Pressable>
            
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Avatar
                  source={user?.avatar}
                  name={user ? `${user.firstName} ${user.lastName}` : 'Guest'}
                  size="xlarge"
                />
                <Pressable style={styles.editAvatarButton}>
                  <Ionicons name="camera" size={16} color="#ffffff" />
                </Pressable>
              </View>
              
              <Text style={styles.userName}>
                {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
              </Text>
              <Text style={styles.userEmail}>{user?.email || 'Sign in to continue'}</Text>
              
              {/* Eco Member Badge */}
              <View style={styles.memberBadge}>
                <Ionicons name="leaf" size={14} color="#059669" />
                <Text style={styles.memberBadgeText}>Eco Traveler • Gold Member</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Ionicons name={stat.icon as any} size={20} color="#059669" />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* Menu Sections */}
        <Animated.View 
          style={[
            styles.menuContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {menuItems.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.menuSection}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                {section.title}
              </Text>
              <Card variant="elevated" padding="none">
                {section.items.map((item, itemIndex) => (
                  <Pressable
                    key={itemIndex}
                    onPress={item.onPress}
                    style={[
                      styles.menuItem,
                      itemIndex < section.items.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.border,
                      },
                    ]}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: '#d1fae5' }]}>
                      <Ionicons name={item.icon as any} size={20} color="#059669" />
                    </View>
                    <Text style={[styles.menuLabel, { color: theme.text }]}>
                      {item.label}
                    </Text>
                    {item.toggle ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: theme.border, true: '#10b981' }}
                        thumbColor={item.value ? '#ffffff' : '#f4f3f4'}
                      />
                    ) : item.badge ? (
                      <View style={styles.menuBadge}>
                        <Text style={styles.menuBadgeText}>{item.badge}</Text>
                      </View>
                    ) : item.value ? (
                      <Text style={[styles.menuValue, { color: theme.textSecondary }]}>
                        {item.value}
                      </Text>
                    ) : (
                      <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
                    )}
                  </Pressable>
                ))}
              </Card>
            </View>
          ))}

          {/* Sign Out Button */}
          <View style={styles.signOutSection}>
            <Button
              title="Sign Out"
              onPress={handleLogout}
              variant="outline"
              icon="log-out-outline"
              fullWidth
            />
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <View style={styles.appLogo}>
              <Ionicons name="leaf" size={24} color="#059669" />
            </View>
            <Text style={[styles.appName, { color: theme.text }]}>Forest Dreams</Text>
            <Text style={[styles.appVersion, { color: theme.textTertiary }]}>
              Version 1.0.0
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 24,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  settingsButton: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  menuContainer: {
    padding: 20,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  menuBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  menuBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  menuValue: {
    fontSize: 14,
  },
  signOutSection: {
    marginBottom: 32,
  },
  appInfo: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  appLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
  },
});