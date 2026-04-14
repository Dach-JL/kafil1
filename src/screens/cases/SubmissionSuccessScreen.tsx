import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import { CheckCircle, ArrowRight, Home } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Case, CATEGORY_LABELS } from '../../types/cases';

interface Props {
  route: any;
  navigation: any;
}

export default function SubmissionSuccessScreen({ route, navigation }: Props) {
  const { submittedCase } = route.params;
  const { colors, typography } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate check-circle bounce then fade in content
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 5,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Animated success icon */}
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.accent + '20' }]}>
            <CheckCircle color={colors.accent} size={64} strokeWidth={1.5} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            Case Submitted!
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Your case is now under review by the CharityTrust team.
          </Text>

          {/* Case Summary Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.categoryText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
                {CATEGORY_LABELS[submittedCase.category]}
              </Text>
            </View>
            <Text style={[styles.caseTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
              {submittedCase.title}
            </Text>
            <Text style={[styles.caseFor, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              For: {submittedCase.beneficiary_name}
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                  ${submittedCase.target_amount.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Goal</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
                  1–3 days
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Review time</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
                  Pending
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Status</Text>
              </View>
            </View>
          </View>

          {/* What happens next */}
          <View style={[styles.stepsCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Text style={[styles.nextTitle, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
              What happens next?
            </Text>
            {[
              '🔍  Admin reviews your case & evidence',
              '📧  You receive a notification with the decision',
              '✅  If approved, your case goes live for contributions',
              '💰  Contributors can fund and upload payment proof',
            ].map((step, i) => (
              <Text
                key={i}
                style={[styles.nextStep, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}
              >
                {step}
              </Text>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Tabs', { screen: 'Cases' })}
              activeOpacity={0.85}
            >
              <Text style={[styles.primaryBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
                View My Cases
              </Text>
              <ArrowRight color={colors.primaryForeground} size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
              onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
              activeOpacity={0.7}
            >
              <Home color={colors.mutedForeground} size={16} />
              <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
                Back to Home
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, alignItems: 'center', padding: 24, paddingTop: 40 },
  iconWrap: { marginBottom: 24 },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 28, lineHeight: 22, paddingHorizontal: 16 },
  card: {
    width: '100%',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  categoryText: { fontSize: 12 },
  caseTitle: { fontSize: 17, marginBottom: 4 },
  caseFor: { fontSize: 13, marginBottom: 14 },
  divider: { height: 1, marginBottom: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 15, marginBottom: 2 },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, marginHorizontal: 8 },
  stepsCard: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 28,
    gap: 8,
  },
  nextTitle: { fontSize: 14, marginBottom: 8 },
  nextStep: { fontSize: 13, lineHeight: 20 },
  actions: { width: '100%', gap: 12 },
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { fontSize: 16 },
  secondaryBtn: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: { fontSize: 14 },
});
