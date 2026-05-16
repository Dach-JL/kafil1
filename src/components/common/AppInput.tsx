import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  ViewStyle,
  TextStyle
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { palette } from '../../theme/colors';

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
  ...props 
}: AppInputProps) {
  const { colors, typography, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

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
          backgroundColor: palette.navyLight, 
          borderColor: error ? colors.error : (isFocused ? colors.accent : palette.navyLight),
        },
        error ? styles.inputError : null,
        isFocused ? { borderWidth: 1.5 } : null
      ]}>
        <TextInput
          style={[
            styles.input, 
            { color: colors.textInverse, fontFamily: typography.fontFamily.regular },
            inputStyle
          ]}
          placeholderTextColor="rgba(255, 255, 255, 0.4)"

          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
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
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    height: '100%',
  },
  inputError: {
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});

