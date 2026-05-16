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
  LogOut,
  ChevronRight,
  CreditCard,
  Target,
  Globe,
  Check,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { palette } from '../theme/colors';
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
    Alert.alert(t('auth.signOut'), t('auth.signOutConfirm'), [
      { text: t('buttons.cancel'), style: 'cancel' },
      { text: t('buttons.logOut'), style: 'destructive', onPress: () => signOut() },
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
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '40' }]}>
          <User color={colors.accent} size={48} />
        </View>
        <Text style={[styles.name, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
          {profile?.name}
        </Text>
        <View style={[styles.roleBadge, { backgroundColor: palette.navyLight }]}>
          <Text style={[styles.role, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
            {profile?.role.toUpperCase()}
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
            {t('profile.trustReputation')}
          </Text>
        </View>
        <View style={styles.scoreRow}>
          <Text style={[styles.score, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
            {profile?.trust_score || 0}
          </Text>
          <View style={styles.badgeCol}>
            <TrustBadge score={profile?.trust_score || 0} />
            <Text style={[styles.rankLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
              {t('profile.platformRank')}
            </Text>
          </View>
        </View>
      </AppCard>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <AppCard style={styles.statBox}>
          <Heart color="#ef4444" size={24} />
          <Text style={[styles.statValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
            ${stats?.totalDonated.toLocaleString() || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
            {t('profile.totalDonated')}
          </Text>
        </AppCard>
        <AppCard style={styles.statBox}>
          <Target color={colors.accent} size={24} />
          <Text style={[styles.statValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
            {stats?.casesCompleted || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
            {t('profile.casesCompleted')}
          </Text>
        </AppCard>
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        <Text style={[styles.menuTitle, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
          {t('profile.account')}
        </Text>
        
        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: palette.navyLight }]}
          onPress={() => navigation.navigate('AccountSettings')}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.accent + '10' }]}>
              <Settings color={colors.accent} size={20} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
              {t('profile.accountSettings')}
            </Text>
          </View>
          <ChevronRight color={colors.textInverse} opacity={0.3} size={20} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: palette.navyLight }]}
          onPress={() => navigation.navigate('PaymentMethods')}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.accent + '10' }]}>
              <CreditCard color={colors.accent} size={20} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
              {t('profile.paymentMethods')}
            </Text>
          </View>
          <ChevronRight color={colors.textInverse} opacity={0.3} size={20} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomColor: palette.navyLight }]}
          onPress={() => setShowLanguagePicker(!showLanguagePicker)}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.iconBg, { backgroundColor: colors.accent + '10' }]}>
              <Globe color={colors.accent} size={20} />
            </View>
            <View>
              <Text style={[styles.menuLabel, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
                {t('profile.language')}
              </Text>
              <Text style={[styles.currentLang, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
                {LANGUAGE_NAMES[i18n.language] || 'English'}
              </Text>
            </View>
          </View>
          <ChevronRight color={colors.textInverse} opacity={0.3} size={20} />
        </TouchableOpacity>

        {showLanguagePicker && (
          <View style={[styles.langPicker, { backgroundColor: palette.navyLight, borderColor: colors.accent + '20' }]}>
            {SUPPORTED_LANGS.map((lang, index) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langOption,
                  { borderBottomColor: colors.background + '50' },
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
                  { color: i18n.language === lang ? colors.accent : colors.textInverse, fontFamily: i18n.language === lang ? typography.fontFamily.bold : typography.fontFamily.medium }
                ]}>
                  {LANGUAGE_NAMES[lang]}
                </Text>
                {i18n.language === lang && <Check color={colors.accent} size={18} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <LogOut color="#ef4444" size={20} />
            </View>
            <Text style={[styles.menuLabel, { color: '#ef4444', fontFamily: typography.fontFamily.bold }]}>
              {t('auth.signOut')}
            </Text>
          </View>
          <ChevronRight color="#ef4444" opacity={0.5} size={20} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: colors.textInverse, opacity: 0.2, fontFamily: typography.fontFamily.regular }]}>
        {t('common.version')} 1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 60 },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    gap: 12,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 4,
  },
  name: { fontSize: 28, letterSpacing: -0.5 },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  role: { fontSize: 11, letterSpacing: 1.5 },
  trustCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustTitle: { fontSize: 18 },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  score: { fontSize: 48, letterSpacing: -1 },
  badgeCol: { alignItems: 'flex-end', gap: 6 },
  rankLabel: { fontSize: 12, opacity: 0.6 },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 40,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  statValue: { fontSize: 22 },
  statLabel: { fontSize: 12, opacity: 0.6 },
  menu: {
    paddingHorizontal: 20,
  },
  menuTitle: {
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 17 },
  currentLang: { fontSize: 12, marginTop: 2 },
  langPicker: {
    marginLeft: 60,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginTop: 8,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  langText: { fontSize: 15 },
  version: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 12,
    letterSpacing: 1,
  },
});


