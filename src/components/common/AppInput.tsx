import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  ViewStyle,
  TextStyle,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { palette } from '../../theme/colors';
import { Eye, EyeOff } from 'lucide-react-native';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export default function AppInput({ 
  label, 
  error, 
  containerStyle, 
  inputStyle,
  multiline,
  numberOfLines,
  secureTextEntry,
  ...props 
}: AppInputProps) {
  const { colors, typography, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPasswordInput = secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.medium, opacity: 1 }]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: colors.surface, 
          borderColor: error ? colors.error : (isFocused ? colors.accent : colors.border),
        },
        // For multiline: remove fixed height, use minHeight instead
        multiline ? styles.inputContainerMultiline : null,
        error ? styles.inputError : null,
        isFocused ? { borderWidth: 1.5 } : null
      ]}>
        <TextInput
          style={[
            styles.input, 
            { color: colors.textPrimary, fontFamily: typography.fontFamily.regular },
            // For multiline: text at top, auto-grow
            multiline ? styles.inputMultiline : null,
            inputStyle
          ]}
          placeholderTextColor={colors.textSecondary + '80'}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          scrollEnabled={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPasswordInput ? !isPasswordVisible : undefined}
          {...props}
        />
        {isPasswordInput && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, { color: colors.error, fontFamily: typography.fontFamily.medium }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
    opacity: 0.8,
  },
  inputContainer: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerMultiline: {
    height: undefined,     // Remove fixed height
    minHeight: 120,        // Minimum visible area
    paddingVertical: 12,
    justifyContent: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  inputMultiline: {
    height: undefined,     // Remove fixed height so it auto-grows
    minHeight: 96,         // Minimum text area
    paddingTop: Platform.OS === 'ios' ? 0 : 4,
    lineHeight: 22,
  },
  inputError: {
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  eyeButton: {
    paddingLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

