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

export default function RegisterScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'contributor' | 'owner'>('contributor');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!name || !email || !password) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          name: name,
          role: role,
        },
      },
    });

    if (error) {
      Alert.alert(t('common.error'), error.message);
    } else {
      Alert.alert(t('common.success'), t('auth.verificationSent'));
      navigation.navigate('Login');
    }
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
            {t('auth.registerHeading', { defaultValue: 'Join Kafil' })}
          </Text>
          <Text style={[styles.subheading, { color: colors.textInverse, opacity: 0.7, fontFamily: typography.fontFamily.regular }]}>
            {t('auth.registerSubheading', { defaultValue: 'Create an account to start making an impact' })}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
              {t('auth.fullNameLabel', { defaultValue: 'Full Name' })}
            </Text>
            <AppInput
              placeholder={t('auth.fullNamePlaceholder', { defaultValue: 'John Doe' })}
              onChangeText={(text) => setName(text)}
              value={name}
            />
          </View>

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
            title={t('auth.signUp', { defaultValue: 'Create Account' })}
            onPress={() => signUpWithEmail()}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textInverse, opacity: 0.6 }]}>
              {t('auth.haveAccount', { defaultValue: 'Already have an account?' })}{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.link, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
                {t('auth.signIn', { defaultValue: 'Sign In' })}
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
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    marginBottom: 10,
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
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    marginTop: 4,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderRadius: 16,
    alignItems: 'center',
  },
  roleText: {
    fontSize: 16,
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 15,
  },
  link: {
    fontSize: 15,
  },
});

