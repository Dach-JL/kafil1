import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Fingerprint, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';

export default function TrustSection() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>

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
    paddingVertical: 10,
  },
  grid: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
