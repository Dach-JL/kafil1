import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

export default function LandingScreen({ navigation }: any) {
  const { colors, typography } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.headerGroup}>
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            CharityTrust
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Transparent giving. Real impact.
          </Text>
        </View>
        
        <View style={styles.actionGroup}>
          <Pressable 
            style={({ pressed }) => [
              styles.button,
              { 
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }]
              }
            ]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.buttonText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
              Get Started
            </Text>
          </Pressable>
        </View>
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
    paddingHorizontal: 32,
  },
  headerGroup: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 48,
    letterSpacing: -1,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  actionGroup: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
