import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function ExploreScreen() {
  const { colors, typography } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
          Explore Cases
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
          Browse verified humanitarian needs.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
