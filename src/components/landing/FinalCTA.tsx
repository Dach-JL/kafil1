import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LogIn } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

interface FinalCTAProps {
  onPress: () => void;
}

export default function FinalCTA({ onPress }: FinalCTAProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.primary }]}>
        <Text style={[styles.title, { color: colors.primaryForeground, fontFamily: typography.fontFamily.heading }]}>
          Ready to make a difference?
        </Text>
        <Text style={[styles.subtitle, { color: colors.primaryForeground, fontFamily: typography.fontFamily.regular }]}>
          Join thousands of donors who are changing lives transparently.
        </Text>
        
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.primaryForeground }]}
          onPress={onPress}
          activeOpacity={0.9}
        >
          <Text style={[styles.btnText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
            Create Free Account
          </Text>
          <LogIn color={colors.primary} size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 64, // Extra padding at very bottom of scroll
  },
  card: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
    lineHeight: 24,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    width: '100%',
  },
  btnText: {
    fontSize: 18,
  },
});
