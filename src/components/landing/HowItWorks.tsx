import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Search, Banknote, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';

export default function HowItWorks() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();

  const STEPS = [
    {
      icon: Search,
      title: t('landing.step1Title'),
      description: t('landing.step1Desc'),
    },
    {
      icon: Banknote,
      title: t('landing.step2Title'),
      description: t('landing.step2Desc'),
    },
    {
      icon: ShieldCheck,
      title: t('landing.step3Title'),
      description: t('landing.step3Desc'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
        {t('landing.howItWorksTitle')}
      </Text>
      
      <View style={styles.stepsContainer}>
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <View key={index} style={styles.stepRow}>
              <View style={styles.iconColumn}>
                <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
                  <Icon color={colors.primary} size={24} />
                </View>
                {index !== STEPS.length - 1 && (
                  <View style={[styles.connectingLine, { backgroundColor: colors.border }]} />
                )}
              </View>
              
              <View style={styles.textColumn}>
                <Text style={[styles.stepTitle, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
                  {index + 1}. {step.title}
                </Text>
                <Text style={[styles.stepDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
                  {step.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 22,
    marginBottom: 32,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'column',
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 0, 
  },
  iconColumn: {
    alignItems: 'center',
    width: 48,
    marginRight: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  connectingLine: {
    width: 2,
    height: 60,
    marginTop: -8,
    marginBottom: -8,
    zIndex: 1,
  },
  textColumn: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 32,
  },
  stepTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 15,
    lineHeight: 22,
  },
});
