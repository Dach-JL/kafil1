import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import LandingHero from '../components/landing/LandingHero';
import HowItWorks from '../components/landing/HowItWorks';
import HorizontalCaseList from '../components/landing/HorizontalCaseList';

export default function LandingScreen({ navigation }: any) {
  const { colors, typography } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LandingHero 
          onPrimaryAction={() => navigation.navigate('Login')}
          onSecondaryAction={() => navigation.navigate('Login')}
        />
        <HowItWorks />
        <HorizontalCaseList onCasePress={() => navigation.navigate('Login')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 60 },
});
