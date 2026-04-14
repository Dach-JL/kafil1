import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
                    backgroundColor: isCompleted
                      ? colors.accent
                      : isActive
                      ? colors.primary
                      : colors.muted,
                    borderColor: isCompleted
                      ? colors.accent
                      : isActive
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                {isCompleted ? (
                  <Text style={[styles.checkMark, { color: colors.primaryForeground }]}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.circleText,
                      {
                        color: isActive ? colors.primaryForeground : colors.mutedForeground,
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
                    color: isActive ? colors.primary : colors.mutedForeground,
                    fontFamily: isActive
                      ? typography.fontFamily.medium
                      : typography.fontFamily.regular,
                    fontSize: 10,
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
    marginBottom: 28,
  },
  stepItem: {
    alignItems: 'center',
    width: 56,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleText: {
    fontSize: 13,
  },
  checkMark: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepLabel: {
    textAlign: 'center',
  },
  connector: {
    flex: 1,
    height: 2,
    marginTop: 15,
  },
});
