import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { ShieldCheck, HeartHandshake } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';

interface LandingHeroProps {
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}

export default function LandingHero({ onPrimaryAction, onSecondaryAction }: LandingHeroProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Decorative Background Blobs for Modern Aesthetic */}
      <View style={[styles.bgCircle, { backgroundColor: colors.primary + '1A' }]} />
      <View style={[styles.bgCircleSmall, { backgroundColor: colors.accent + '20' }]} />
      <View style={[styles.bgCircleTiny, { backgroundColor: colors.primary + '10' }]} />
      
      <View style={styles.content}>
        <View style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.primary + '30' }]}>
          <ShieldCheck color={colors.primary} size={14} strokeWidth={2.5} />
          <Text style={[styles.badgeText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
            {t('landing.badge')}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          {t('landing.heroTitle')}{'\n'}
          <Text style={{ color: colors.primary }}>{t('landing.heroHighlight')}</Text>
        </Text>

        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          {t('landing.heroSubtitle')}
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={onPrimaryAction}
            activeOpacity={0.8}
          >
            <HeartHandshake color={colors.primaryForeground} size={20} />
            <Text style={[styles.primaryBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
              {t('landing.startDonating')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onSecondaryAction}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
              {t('landing.submitCase')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  bgCircleSmall: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  bgCircleTiny: {
    position: 'absolute',
    top: 40,
    left: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  content: {
    position: 'relative',
    zIndex: 10,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    gap: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontSize: 15,
  },
});
