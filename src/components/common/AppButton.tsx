import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  View
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
}

export default function AppButton({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false, 
  style, 
  textStyle,
  variant = 'primary',
  icon
}: AppButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.surface }; // Using surface for secondary buttons
      case 'outline':
        return { 
          backgroundColor: 'transparent', 
          borderWidth: 1.5, 
          borderColor: colors.primary 
        };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return { color: colors.primary };
      case 'secondary':
        return { color: colors.accent };
      default:
        return { color: colors.textOnPrimary };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextStyle().color} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[
            styles.text, 
            getTextStyle(), 
            textStyle
          ]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56, // Slightly taller for premium feel
    borderRadius: 16, // More rounded for modern look
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
});
