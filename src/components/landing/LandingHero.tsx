import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { HeartHandshake, FilePlus2, ShieldCheck, Banknote } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

const { width, height } = Dimensions.get('window');

interface LandingHeroProps {
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}

export default function LandingHero({ onPrimaryAction, onSecondaryAction }: LandingHeroProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      {/* Soft Glow Elements */}
      <View style={[styles.glowTop, { backgroundColor: colors.accent + '15' }]} />
      <View style={[styles.glowBottom, { backgroundColor: colors.primary + '1A' }]} />

      <View style={styles.content}>
        {/* Main Typography */}
        <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          Change a life today.{'\n'}
          <Text style={{ color: colors.primary }}>See the impact tomorrow.</Text>
        </Text>

        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          The world's most transparent giving platform. Zero platform fees, immutable proofs, and complete lifecycle tracking.
        </Text>

        {/* Minimal Conviction Badges */}
        <View style={styles.badgesWrapper}>
          <View style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ShieldCheck color={colors.accent} size={14} />
            <Text style={[styles.badgeText, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>100% Verified</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Banknote color={colors.primary} size={14} />
            <Text style={[styles.badgeText, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>Zero Fees</Text>
          </View>
        </View>

        {/* Hierarchical Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={onPrimaryAction}
            activeOpacity={0.8}
          >
            <HeartHandshake color={colors.primaryForeground} size={20} />
            <Text style={[styles.primaryBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
              Browse Cases
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryBtn, { borderColor: colors.border }]}
            onPress={onSecondaryAction}
            activeOpacity={0.6}
          >
            <View style={styles.secondaryInner}>
              <FilePlus2 color={colors.text} size={18} />
              <Text style={[styles.secondaryBtnText, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
                Create a Case
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: height * 0.7, // Takes up roughly top 70% of screen to leave room for Micro-Impact
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    transform: [{ scaleX: 1.2 }],
    opacity: 0.7,
    filter: 'blur(50px)', // Valid on web, ignored on older RN but soft enough anyway
  },
  glowBottom: {
    position: 'absolute',
    bottom: -50,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    transform: [{ scaleY: 1.3 }],
    opacity: 0.8,
  },
  content: {
    position: 'relative',
    zIndex: 10,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 40,
    lineHeight: 48,
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  badgesWrapper: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    width: '100%',
    shadowColor: '#4F46E5', // Matches primary loosely
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryBtnText: {
    fontSize: 18,
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  secondaryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 16,
    opacity: 0.8,
  },
});
