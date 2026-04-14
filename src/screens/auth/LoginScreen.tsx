import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export default function LoginScreen() {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.primary, fontFamily: typography.fontFamily.heading }]}>
        Welcome Back
      </Text>
      <Text style={[styles.subheading, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
        Login to your CharityTrust account
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
          Sign In (Placeholder)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  heading: {
    fontSize: 28,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
});
