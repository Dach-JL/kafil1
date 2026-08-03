import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import {
  User,
  Settings,
  ShieldCheck,
  Heart,
  LogOut,
  ChevronRight,
  CreditCard,
  Target,
  Globe,
  Check,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../supabase/AuthContext';
import { getUserStats, UserStats } from '../api/profiles';
import TrustBadge from '../components/TrustBadge';
import { changeLanguage, SUPPORTED_LANGS } from '../i18n';
import AppCard from '../components/common/AppCard';
import { useNavigation } from '@react-navigation/native';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  om: 'Afaan Oromoo',
  am: 'አማርኛ',
};

export default function ProfileScreen() {
  const { colors, typography, spacing } = useTheme();
  const { t, i18n } = useTranslation();
  const { profile, signOut } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const navigation = useNavigation<any>();

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
    Alert.alert(t('auth.signOut', { defaultValue: 'Sign Out' }), t('auth.signOutConfirm', { defaultValue: 'Are you sure you want to log out?' }), [
      { text: t('buttons.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
      { text: t('buttons.logOut', { defaultValue: 'Log Out' }), style: 'destructive', onPress: () => signOut() },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <User color={colors.accent} size={44} />
          </View>
          <Text style={[styles.name, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
            {profile?.name || 'Humanitarian Profile'}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.role, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
              {profile?.role ? profile.role.toUpperCase() : 'DONOR'}
            </Text>
          </View>
        </View>

        {/* Trust Score Card */}
        <AppCard style={styles.trustCard}>
          <View style={styles.trustHeader}>
            <View style={[styles.iconWrap, { backgroundColor: colors.accent + '15' }]}>
              <ShieldCheck color={colors.accent} size={22} />
            </View>
            <Text style={[styles.trustTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
              {t('profile.trustReputation', { defaultValue: 'Trust & Reputation' })}
            </Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={[styles.score, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
              {profile?.trust_score || 0}
            </Text>
            <View style={styles.badgeCol}>
              <TrustBadge score={profile?.trust_score || 0} />
              <Text style={[styles.rankLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
                {t('profile.platformRank', { defaultValue: 'Audit Verified' })}
              </Text>
            </View>
          </View>
        </AppCard>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <AppCard style={styles.statBox}>
            <Heart color={colors.error} size={22} />
            <Text style={[styles.statValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
              ${stats?.totalDonated?.toLocaleString() || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
              {t('profile.totalDonated', { defaultValue: 'Total Donated' })}
            </Text>
          </AppCard>
          <AppCard style={styles.statBox}>
            <Target color={colors.accent} size={22} />
            <Text style={[styles.statValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
              {stats?.casesCompleted || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
              {t('profile.casesCompleted', { defaultValue: 'Cases Completed' })}
            </Text>
          </AppCard>
        </View>

        {/* Settings Menu Options */}
        <View style={styles.menu}>
          <Text style={[styles.menuTitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.bold }]}>
            {t('profile.account', { defaultValue: 'ACCOUNT & SETTINGS' })}
          </Text>
          
          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('AccountSettings')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBg, { backgroundColor: colors.accent + '15' }]}>
                <Settings color={colors.accent} size={18} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
                {t('profile.accountSettings', { defaultValue: 'Account Settings' })}
              </Text>
            </View>
            <ChevronRight color={colors.textSecondary} size={18} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('PaymentMethods')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBg, { backgroundColor: colors.accent + '15' }]}>
                <CreditCard color={colors.accent} size={18} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
                {t('profile.paymentMethods', { defaultValue: 'Bank Details & Verification' })}
              </Text>
            </View>
            <ChevronRight color={colors.textSecondary} size={18} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => setShowLanguagePicker(!showLanguagePicker)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBg, { backgroundColor: colors.accent + '15' }]}>
                <Globe color={colors.accent} size={18} />
              </View>
              <View>
                <Text style={[styles.menuLabel, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
                  {t('profile.language', { defaultValue: 'Language' })}
                </Text>
                <Text style={[styles.currentLang, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
                  {LANGUAGE_NAMES[i18n.language] || 'English'}
                </Text>
              </View>
            </View>
            <ChevronRight color={colors.textSecondary} size={18} />
          </TouchableOpacity>

          {/* Language Selector Dropdown */}
          {showLanguagePicker && (
            <View style={[styles.langPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {SUPPORTED_LANGS.map((lang: string, index: number) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.langOption,
                    { borderBottomColor: colors.border },
                    index === SUPPORTED_LANGS.length - 1 && { borderBottomWidth: 0 },
                    i18n.language === lang && { backgroundColor: colors.accent + '15' },
                  ]}
                  onPress={() => {
                    changeLanguage(lang);
                    setShowLanguagePicker(false);
                  }}
                >
                  <Text style={[
                    styles.langText, 
                    { color: i18n.language === lang ? colors.accent : colors.textPrimary, fontFamily: i18n.language === lang ? typography.fontFamily.bold : typography.fontFamily.medium }
                  ]}>
                    {LANGUAGE_NAMES[lang]}
                  </Text>
                  {i18n.language === lang && <Check color={colors.accent} size={18} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Log Out Option */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconBg, { backgroundColor: colors.error + '15' }]}>
                <LogOut color={colors.error} size={18} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.error, fontFamily: typography.fontFamily.bold }]}>
                {t('auth.signOut', { defaultValue: 'Sign Out' })}
              </Text>
            </View>
            <ChevronRight color={colors.error} size={18} opacity={0.6} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
          CharityTrust Kaafilul Yatiim v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 60 },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 24,
    gap: 8,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 4,
  },
  name: { fontSize: 24, letterSpacing: -0.5 },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  role: { fontSize: 10, letterSpacing: 1 },
  trustCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustTitle: { fontSize: 16 },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  score: { fontSize: 40, letterSpacing: -1 },
  badgeCol: { alignItems: 'flex-end', gap: 4 },
  rankLabel: { fontSize: 11 },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    marginBottom: 0,
  },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 11 },
  menu: {
    paddingHorizontal: 20,
  },
  menuTitle: {
    fontSize: 11,
    marginBottom: 12,
    marginLeft: 2,
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
    gap: 14,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 15 },
  currentLang: { fontSize: 11, marginTop: 1 },
  langPicker: {
    marginLeft: 52,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 6,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  langText: { fontSize: 14 },
  version: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 11,
    letterSpacing: 0.5,
    opacity: 0.7,
  },
});
