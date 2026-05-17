import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import AppInput from './AppInput';
import AppButton from './AppButton';
import { useTheme } from '../../hooks/useTheme';

interface PromptModalProps {
  visible: boolean;
  title: string;
  message: string;
  placeholder?: string;
  cancelText?: string;
  submitText?: string;
  submitStyle?: 'default' | 'destructive';
  onCancel: () => void;
  onSubmit: (value: string) => void;
}

export default function PromptModal({
  visible,
  title,
  message,
  placeholder,
  cancelText = 'Cancel',
  submitText = 'Submit',
  submitStyle = 'default',
  onCancel,
  onSubmit
}: PromptModalProps) {
  const { colors, typography } = useTheme();
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    onSubmit(value);
    setValue('');
  };

  const handleCancel = () => {
    onCancel();
    setValue('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <View style={[styles.container, { backgroundColor: colors.surface }]}>
              <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
                {title}
              </Text>
              <Text style={[styles.message, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                {message}
              </Text>
              
              <AppInput
                value={value}
                onChangeText={setValue}
                placeholder={placeholder}
                autoFocus
                multiline
                numberOfLines={3}
                containerStyle={styles.inputContainer}
              />
              
              <View style={styles.buttonRow}>
                <AppButton 
                  title={cancelText} 
                  onPress={handleCancel} 
                  variant="outline"
                  style={styles.button}
                />
                <View style={styles.spacing} />
                <AppButton 
                  title={submitText} 
                  onPress={handleSubmit} 
                  variant="primary"
                  style={{
                    ...styles.button,
                    ...(submitStyle === 'destructive' ? { backgroundColor: colors.error } : {})
                  }}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  keyboardView: {
    width: '100%',
  },
  container: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    flex: 1,
  },
  spacing: {
    width: 12,
  },
});
