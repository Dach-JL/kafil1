import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  User,
  Settings,
  ShieldCheck,
  Heart,
  TrendingUp,
  LogOut,
  ChevronRight,
  CreditCard,
  Target,
} from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../supabase/AuthContext';
import { getUserStats, UserStats } from '../api/profiles';
import TrustBadge from '../components/TrustBadge';

export default function ProfileScreen() {
  const { colors, typography } = useTheme();
  const { profile, signOut } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!profile) return;
      try {
        const data = await getUserStats(profile.id);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [profile]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.secondary }]}>
          <User color={colors.primary} size={40} />
        </View>
        <Text style={[styles.name, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
          {profile?.name}
        </Text>
        <Text style={[styles.role, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          {profile?.role.toUpperCase()} • Member since 2026
        </Text>
      </View>

      {/* Trust Score Card */}
      <View style={[styles.trustCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.trustHeader}>
          <ShieldCheck color={colors.primary} size={24} />
          <Text style={[styles.trustTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            Trust Reputation
          </Text>
        </View>
        <View style={styles.scoreRow}>
          <Text style={[styles.score, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            {profile?.trust_score || 0}
          </Text>
          <View style={styles.badgeCol}>
            <TrustBadge score={profile?.trust_score || 0} />
            <Text style={[styles.rankLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              Platform Rank
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Heart color="#ef4444" size={24} />
          <Text style={[styles.statValue, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            ${stats?.totalDonated.toLocaleString() || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Total Donated
          </Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Target color="#3b82f6" size={24} />
          <Text style={[styles.statValue, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            {stats?.casesCompleted || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Cases Completed
          </Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        <Text style={[styles.menuTitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.medium }]}>
          Account
        </Text>
        
        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.secondary }]}>
              <Settings color={colors.primary} size={20} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
              Account Settings
            </Text>
          </View>
          <ChevronRight color={colors.mutedForeground} size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
          <View style={styles.menuLeft}>
            <View style={[styles.iconBg, { backgroundColor: '#dcfce7' }]}>
              <CreditCard color="#166534" size={20} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
              Payment Methods
            </Text>
          </View>
          <ChevronRight color={colors.mutedForeground} size={20} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleSignOut}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.iconBg, { backgroundColor: '#fee2e2' }]}>
              <LogOut color="#991b1b" size={20} />
            </View>
            <Text style={[styles.menuLabel, { color: '#991b1b', fontFamily: typography.fontFamily.medium }]}>
              Sign Out
            </Text>
          </View>
          <ChevronRight color="#991b1b" size={20} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
        CharityTrust v1.0.2 • Open Verification Engine
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 40 },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: { fontSize: 24 },
  role: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  trustCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  trustTitle: { fontSize: 18 },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  score: { fontSize: 44 },
  badgeCol: { alignItems: 'flex-end', gap: 4 },
  rankLabel: { fontSize: 12 },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 12 },
  menu: {
    paddingHorizontal: 20,
  },
  menuTitle: {
    fontSize: 13,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 16 },
  version: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 12,
  },
});
