import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../supabase/supabaseClient';

export default function RegisterScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.primary, fontFamily: typography.fontFamily.heading }]}>
            {t('auth.registerHeading')}
          </Text>
          <Text style={[styles.subheading, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            {t('auth.registerSubheading')}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{t('auth.fullNameLabel')}</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card, 
                color: colors.text, 
                borderColor: colors.border,
                fontFamily: typography.fontFamily.regular 
              }]}
              placeholder={t('auth.fullNamePlaceholder')}
              placeholderTextColor={colors.mutedForeground}
              onChangeText={(text) => setName(text)}
              value={name}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{t('auth.emailLabel')}</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card, 
                color: colors.text, 
                borderColor: colors.border,
                fontFamily: typography.fontFamily.regular 
              }]}
              placeholder={t('auth.emailPlaceholder')}
              placeholderTextColor={colors.mutedForeground}
              onChangeText={(text) => setEmail(text)}
              value={email}
              autoCapitalize={'none'}
              keyboardType={'email-address'}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>{t('auth.passwordLabel')}</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card, 
                color: colors.text, 
                borderColor: colors.border,
                fontFamily: typography.fontFamily.regular 
              }]}
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor={colors.mutedForeground}
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              autoCapitalize={'none'}
            />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>{t('auth.roleLabel')}</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[
                styles.roleButton, 
                { borderColor: role === 'contributor' ? colors.primary : colors.border },
                role === 'contributor' && { backgroundColor: colors.primary + '10' }
              ]}
              onPress={() => setRole('contributor')}
            >
              <Text style={[
                styles.roleText, 
                { color: role === 'contributor' ? colors.primary : colors.text, fontFamily: typography.fontFamily.medium }
              ]}>{t('auth.contributor')}</Text>
              <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>{t('auth.contributorDesc')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.roleButton, 
                { borderColor: role === 'owner' ? colors.primary : colors.border },
                role === 'owner' && { backgroundColor: colors.primary + '10' }
              ]}
              onPress={() => setRole('owner')}
            >
              <Text style={[
                styles.roleText, 
                { color: role === 'owner' ? colors.primary : colors.text, fontFamily: typography.fontFamily.medium }
              ]}>{t('auth.caseOwner')}</Text>
              <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>{t('auth.caseOwnerDesc')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={() => signUpWithEmail()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
                {t('auth.signUp')}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              {t('auth.haveAccount')}{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.link, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
                {t('auth.signIn')}
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
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  roleText: {
    fontSize: 14,
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 10,
    textAlign: 'center',
  },
  button: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
  },
});
