import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Fingerprint, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';

export default function TrustSection() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary + '0A' }]}>
      <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
        {t('landing.trustTitle')}
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
        {t('landing.trustSubtitle')}
      </Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Shield color={colors.primary} size={24} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            {t('landing.adminVetted')}
          </Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            {t('landing.adminVettedDesc')}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Fingerprint color={colors.accent} size={24} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            {t('landing.immutableProof')}
          </Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            {t('landing.immutableProofDesc')}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Lock color={colors.primary} size={24} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            {t('landing.zeroFees')}
          </Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            {t('landing.zeroFeesDesc')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  grid: {
    gap: 24,
  },
  card: {
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
