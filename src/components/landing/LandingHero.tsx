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
      <View style={[styles.bgCircle, { backgroundColor: colors.primary + '10' }]} />
      <View style={[styles.bgCircleSmall, { backgroundColor: colors.accent + '15' }]} />
      
      <View style={styles.content}>
        <View style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <ShieldCheck color={colors.primary} size={16} />
          <Text style={[styles.badgeText, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            100% Verified Impact
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
    paddingTop: 60,
    paddingBottom: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  bgCircleSmall: {
    position: 'absolute',
    bottom: 20,
    left: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  content: {
    position: 'relative',
    zIndex: 10,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    gap: 6,
  },
  badgeText: {
    fontSize: 13,
  },
  title: {
    fontSize: 36,
    lineHeight: 44,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
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
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 18,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 16,
  },
});
