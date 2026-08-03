import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, Check, ChevronDown, FolderHeart } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { changeLanguage, SUPPORTED_LANGS } from '../i18n';
import AppButton from '../components/common/AppButton';
import AppCard from '../components/common/AppCard';
import LandingHero from '../components/landing/LandingHero';
import TrustSection from '../components/landing/TrustSection';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  om: 'Afaan Oromoo',
  am: 'አማርኛ',
};

export default function LandingScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t, i18n } = useTranslation();
  const [showLangPicker, setShowLangPicker] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar: Branding + Sign In + Language */}
      <View style={styles.topBar}>
        <View style={styles.brandingHeader}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <FolderHeart color={colors.surface} size={16} />
          </View>
          <View style={styles.brandingText}>
            <Text style={[styles.brandTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
              CharityTrust
            </Text>
            <Text style={[styles.brandSubtitle, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
              KAAFILUL YATIIM
            </Text>
          </View>
        </View>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={[styles.signInPill, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={[styles.signInText, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
              Sign in
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.langTrigger, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowLangPicker(!showLangPicker)}
            activeOpacity={0.7}
          >
            <Globe size={16} color={colors.accent} />
            <Text style={[styles.langTriggerText, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
              {i18n.language.toUpperCase()}
            </Text>
            <ChevronDown size={12} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Dropdown */}
      {showLangPicker && (
        <View style={[styles.langMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
                setShowLangPicker(false);
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

      <Pressable style={{ flex: 1 }} onPress={() => setShowLangPicker(false)}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <LandingHero
            onPrimaryAction={() => navigation.navigate('Login')}
            onSecondaryAction={() => navigation.navigate('Register')}
          />

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <AppCard style={styles.statCard}>
              <Text style={[styles.statNumber, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
                128
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                Verified cases
              </Text>
            </AppCard>
            <AppCard style={styles.statCard}>
              <Text style={[styles.statNumber, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
                96%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                Reports filed
              </Text>
            </AppCard>
          </View>

          {/* Trust Section */}
          <TrustSection />

          {/* Bottom CTA */}
          <View style={styles.bottomCTA}>
            <AppButton
              title={t('buttons.getStarted', { defaultValue: 'Get Started' })}
              onPress={() => navigation.navigate('Login')}
              style={styles.ctaButton}
            />
          </View>
        </ScrollView>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  brandingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandingText: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    lineHeight: 18,
  },
  brandSubtitle: {
    fontSize: 8,
    letterSpacing: 1,
    lineHeight: 10,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  signInPill: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  signInText: {
    fontSize: 13,
  },
  langTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  langTriggerText: {
    fontSize: 12,
  },
  langMenu: {
    position: 'absolute',
    top: 70,
    right: 20,
    width: 220,
    borderRadius: 16,
    borderWidth: 1,
    zIndex: 100,
    overflow: 'hidden',
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  langText: {
    fontSize: 15,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginBottom: 0,
  },
  statNumber: {
    fontSize: 28,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomCTA: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  ctaButton: {
    height: 56,
  },
});
