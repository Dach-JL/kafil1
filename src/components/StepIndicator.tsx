import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <React.Fragment key={index}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: isCompleted || isActive
                      ? colors.accent
                      : colors.border,
                    borderColor: isCompleted || isActive
                      ? colors.accent
                      : colors.border,
                  },
                ]}
              >
                {isCompleted ? (
                  <Text style={[styles.checkMark, { color: colors.textOnPrimary }]}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.circleText,
                      {
                        color: isActive ? colors.textOnPrimary : colors.textInverse,
                        opacity: isActive ? 1 : 0.4,
                        fontFamily: typography.fontFamily.bold,
                      },
                    ]}
                  >
                    {stepNum}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: isActive ? colors.accent : colors.textInverse,
                    opacity: isActive ? 1 : 0.4,
                    fontFamily: isActive
                      ? typography.fontFamily.bold
                      : typography.fontFamily.regular,
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>

            {index < steps.length - 1 && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor: isCompleted ? colors.accent : colors.border,
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  stepItem: {
    alignItems: 'center',
    width: 60,
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  circleText: {
    fontSize: 14,
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepLabel: {
    textAlign: 'center',
  },
  connector: {
    flex: 1,
    height: 2,
    marginTop: 17,
  },
});

