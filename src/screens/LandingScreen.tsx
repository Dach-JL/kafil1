import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import LandingHero from '../components/landing/LandingHero';

export default function LandingScreen({ navigation }: any) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <LandingHero 
          onPrimaryAction={() => navigation.navigate('Login')}
          onSecondaryAction={() => navigation.navigate('Login')}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center', // Centers the hero vertically
  },
});
