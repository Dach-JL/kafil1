import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { ShieldCheck, HeartHandshake } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

interface LandingHeroProps {
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}

export default function LandingHero({ onPrimaryAction, onSecondaryAction }: LandingHeroProps) {
  const { colors, typography } = useTheme();

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
            100% VERIFIED IMPACT
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          Change a life today.{'\n'}
          <Text style={{ color: colors.primary }}>See the impact tomorrow.</Text>
        </Text>

        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
          Join a transparent community where every donation is tracked, verified, and proven to reach exactly who needs it.
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={onPrimaryAction}
            activeOpacity={0.8}
          >
            <HeartHandshake color={colors.primaryForeground} size={20} />
            <Text style={[styles.primaryBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
              Start Donating
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onSecondaryAction}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
              Submit a Case
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
    paddingTop: 80,
    paddingBottom: 50,
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
    bottom: 0,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  bgCircleTiny: {
    position: 'absolute',
    top: 60,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
    gap: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  badgeText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 42,
    lineHeight: 52,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  actionRow: {
    flexDirection: 'column',
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryBtnText: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontSize: 16,
  },
});
