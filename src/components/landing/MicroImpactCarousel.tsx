import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { CheckCircle2 } from 'lucide-react-native';

const IMPACT_SNIPPETS = [
  "Just now: Education fees secured for 2 students in Yemen.",
  "2 hrs ago: Lifesaving surgery funded. 100% direct transfer.",
  "Today: Local community center received complete solar installation.",
  "Yesterday: Clean water well completed. Impact mathematically verified."
];

export default function MicroImpactCarousel() {
  const { colors, typography } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Change text
        setCurrentIndex((prev) => (prev + 1) % IMPACT_SNIPPETS.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <View style={[styles.badgeContainer, { backgroundColor: colors.accent + '20' }]}>
        <CheckCircle2 color={colors.accent} size={14} />
      </View>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <Text style={[styles.text, { color: colors.text, fontFamily: typography.fontFamily.medium }]} numberOfLines={2}>
          {IMPACT_SNIPPETS[currentIndex]}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 12,
  },
  badgeContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
