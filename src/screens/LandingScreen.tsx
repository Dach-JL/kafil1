import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

export default function LandingScreen({ navigation }: any) {
  const { colors, typography } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            Welcome to CharityTrust
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            The most transparent way to change lives.
          </Text>
          
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: colors.primary, marginTop: 40 }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.btnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  center: { alignItems: 'center', padding: 20 },
  title: { fontSize: 28, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center' },
  btn: { 
    paddingHorizontal: 32, 
    paddingVertical: 16, 
    borderRadius: 12,
  },
  btnText: { fontSize: 16 },
});
