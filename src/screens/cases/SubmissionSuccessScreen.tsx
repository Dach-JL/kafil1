import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, ArrowRight, Home } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { palette } from '../../theme/colors';
import { useTranslation } from 'react-i18next';
import { Case } from '../../types/cases';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';

interface Props {
  route: any;
  navigation: any;
}

export default function SubmissionSuccessScreen({ route, navigation }: Props) {
  const submittedCase = route.params.submittedCase as Case;
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
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
          <View style={[styles.iconCircle, { backgroundColor: colors.accent + '15' }]}>
            <CheckCircle color={colors.accent} size={64} strokeWidth={1.5} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', width: '100%' }}>
          <Text style={[styles.title, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
            {t('common.success')}!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textInverse, opacity: 0.8, fontFamily: typography.fontFamily.regular }]}>
            {t('statuses.PENDING_REVIEW')}
          </Text>

          {/* Case Summary Card */}
          <AppCard style={styles.card}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.accent + '15' }]}>
              <Text style={[styles.categoryText, { color: colors.accent, fontFamily: typography.fontFamily.medium }]}>
                {t(`categories.${submittedCase.category}`)}
              </Text>
            </View>
            <Text style={[styles.caseTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
              {submittedCase.title}
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.background + '10' }]} />
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
                  ${submittedCase.target_amount.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('common.goal', { defaultValue: 'Goal' })}</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.background + '10' }]} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
                  {t('common.reviewTimeValue', { defaultValue: '1–3 days' })}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('common.reviewTime', { defaultValue: 'Review time' })}</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.background + '10' }]} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
                  {t('statuses.PENDING_REVIEW')}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('common.status', { defaultValue: 'Status' })}</Text>
              </View>
            </View>
          </AppCard>

          {/* What happens next */}
          <View style={[styles.stepsCard, { backgroundColor: palette.navyLight, borderColor: colors.accent + '20' }]}>
            <Text style={[styles.nextTitle, { color: colors.accent, fontFamily: typography.fontFamily.medium }]}>
              {t('caseDetail.whatHappensNext', { defaultValue: 'What happens next?' })}
            </Text>
            {[
              t('caseDetail.nextStep1', { defaultValue: '🔍  Admin reviews your case & evidence' }),
              t('caseDetail.nextStep2', { defaultValue: '📧  You receive a notification with the decision' }),
              t('caseDetail.nextStep3', { defaultValue: '✅  If approved, your case goes live for contributions' }),
              t('caseDetail.nextStep4', { defaultValue: '💰  Contributors can fund and upload payment proof' }),
            ].map((step, i) => (
              <Text
                key={i}
                style={[styles.nextStep, { color: colors.textInverse, opacity: 0.7, fontFamily: typography.fontFamily.regular }]}
              >
                {step}
              </Text>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <AppButton
              title={t('cases.myCases')}
              onPress={() => navigation.navigate('Tabs', { screen: 'Cases' })}
              style={styles.primaryBtn}
            />

            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.textInverse + '30' }]}
              onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
              activeOpacity={0.7}
            >
              <Home color={colors.textInverse} size={16} />
              <Text style={[styles.secondaryBtnText, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
                {t('tabs.explore')}
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
  title: { fontSize: 32, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 24, paddingHorizontal: 16 },
  card: {
    width: '100%',
    marginBottom: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  categoryText: { fontSize: 12 },
  caseTitle: { fontSize: 20, marginBottom: 16 },
  divider: { height: 1, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 14, marginBottom: 4 },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, marginHorizontal: 8 },
  stepsCard: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 32,
    gap: 10,
  },
  nextTitle: { fontSize: 16, marginBottom: 8 },
  nextStep: { fontSize: 14, lineHeight: 22 },
  actions: { width: '100%', gap: 12 },
  primaryBtn: {
    height: 58,
  },
  secondaryBtn: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondaryBtnText: { fontSize: 16 },
});

