import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, ShieldAlert, Award, Diamond } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

interface TrustBadgeProps {
  score: number;
  showText?: boolean;
}

export default function TrustBadge({ score, showText = true }: TrustBadgeProps) {
  const { colors, typography } = useTheme();

  let TierIcon = ShieldCheck;
  let tierColor = colors.mutedForeground;
  let tierLabel = 'New Member';

  if (score >= 500) {
    TierIcon = Diamond;
    tierColor = '#C084FC'; // Purple/Diamond
    tierLabel = 'Elite Pillar';
  } else if (score >= 200) {
    TierIcon = Award;
    tierColor = '#F59E0B'; // Gold
    tierLabel = 'Top Rated';
  } else if (score >= 50) {
    TierIcon = ShieldCheck;
    tierColor = '#3B82F6'; // Blue/Silver
    tierLabel = 'Verified Trust';
  } else if (score > 0) {
    tierLabel = 'Building Trust';
  }

  return (
    <View style={[styles.badge, { backgroundColor: tierColor + '15' }]}>
      <TierIcon color={tierColor} size={14} />
      {showText && (
        <Text style={[styles.text, { color: tierColor, fontFamily: typography.fontFamily.medium }]}>
          {tierLabel} ({score})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  text: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
