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
      <Bell color={colors.accent} size={24} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.accent, borderColor: colors.background }]}>
          <Text style={[styles.badgeText, { color: colors.background, fontFamily: typography.fontFamily.bold }]}>
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
    marginRight: 4,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 2,
  },
  badgeText: {
    fontSize: 8,
    textAlign: 'center',
  },
});

