import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { palette } from '../../theme/colors';
import { supabase } from '../../supabase/supabaseClient';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';

export default function LoginScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) Alert.alert(t('common.error'), error.message);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
            {t('auth.loginHeading', { defaultValue: 'Welcome Back' })}
          </Text>
          <Text style={[styles.subheading, { color: colors.textInverse, opacity: 0.7, fontFamily: typography.fontFamily.regular }]}>
            {t('auth.loginSubheading', { defaultValue: 'Enter your credentials to continue' })}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
              {t('auth.emailLabel', { defaultValue: 'Email Address' })}
            </Text>
            <AppInput
              placeholder={t('auth.emailPlaceholder', { defaultValue: 'name@example.com' })}
              onChangeText={(text) => setEmail(text)}
              value={email}
              autoCapitalize={'none'}
              keyboardType={'email-address'}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
              {t('auth.passwordLabel', { defaultValue: 'Password' })}
            </Text>
            <AppInput
              placeholder={t('auth.passwordPlaceholder', { defaultValue: '••••••••' })}
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              autoCapitalize={'none'}
            />
          </View>

          <AppButton 
            title={t('auth.signIn', { defaultValue: 'Sign In' })}
            onPress={() => signInWithEmail()}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textInverse, opacity: 0.6 }]}>
              {t('auth.noAccount', { defaultValue: "Don't have an account?" })}{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.link, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
                {t('auth.signUp', { defaultValue: 'Sign Up' })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  heading: {
    fontSize: 36,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 4,
  },
  button: {
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
  },
  link: {
    fontSize: 15,
  },
});

