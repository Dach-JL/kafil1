import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function AppCard({ children, style }: AppCardProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    
    // Soft shadow for light background
    shadowColor: '#0F1B2D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
});


