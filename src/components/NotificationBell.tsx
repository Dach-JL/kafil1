import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useNotifications } from '../supabase/NotificationsContext';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';

export default function NotificationBell() {
  const { colors, typography } = useTheme();
  const { unreadCount } = useNotifications();
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Notifications')}
      activeOpacity={0.7}
    >
      <Bell color={colors.text} size={24} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
          <Text style={[styles.badgeText, { color: '#ffffff', fontFamily: typography.fontFamily.bold }]}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    position: 'relative',
    marginRight: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    fontSize: 9,
    textAlign: 'center',
  },
});
