import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Shield, Fingerprint, Lock } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

export default function TrustSection() {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary + '0A' }]}>
      <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
        Trust & Transparency
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
        We take fraud prevention seriously. Every case must pass rigorous verification before it is funded.
      </Text>

      <View style={styles.grid}>
        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Shield color={colors.primary} size={24} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            Admin Vetted
          </Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            All documents, IDs, and financial needs are verified by our team.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Fingerprint color={colors.accent} size={24} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            Immutable Proof
          </Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Impact reports are cryptographically hashed and locked to prevent alteration.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Lock color={colors.primary} size={24} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            Zero Hidden Fees
          </Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            100% of your donation is delivered. We do not extract platform fees from causes.
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
