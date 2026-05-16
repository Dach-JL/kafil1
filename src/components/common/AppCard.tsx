import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { palette } from '../../theme/colors';

interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function AppCard({ children, style }: AppCardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.navyLight,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.1)', // Subtle gold border
    
    // Subtle shadow for depth on dark background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
});

