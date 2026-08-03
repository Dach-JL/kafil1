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
import { supabase } from '../../supabase/supabaseClient';
import { FolderHeart } from 'lucide-react-native';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';

export default function RegisterScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'contributor' | 'owner'>('contributor');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('auth.fillAllFields', { defaultValue: 'Please fill in all fields' }));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          name: name.trim(),
          role: role,
        },
      },
    });

    if (error) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), error.message);
    } else {
      Alert.alert(t('common.success', { defaultValue: 'Success' }), t('auth.verificationSent', { defaultValue: 'Verification email sent. Please check your inbox.' }));
      navigation.navigate('Login');
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Branding Header */}
        <View style={styles.brandingHeader}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <FolderHeart color={colors.surface} size={18} />
          </View>
          <View style={styles.brandingText}>
            <Text style={[styles.brandTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
              CharityTrust
            </Text>
            <Text style={[styles.brandSubtitle, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
              KAAFILUL YATIIM
            </Text>
          </View>
        </View>

        {/* Create Account Heading */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.heading, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
            Create account
          </Text>
          <Text style={[styles.subheading, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Join with a profile built for verified giving, evidence, and responsible case submission.
          </Text>
        </View>

        {/* Input Form Card */}
        <AppCard style={styles.formCard}>
          {/* Custom Pill Role Selector */}
          <View style={styles.roleWrapper}>
            <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
              I want to join as
            </Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'contributor'
                    ? { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary }
                    : { backgroundColor: 'transparent', borderColor: colors.border }
                ]}
                onPress={() => setRole('contributor')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.roleText,
                    {
                      color: role === 'contributor' ? colors.surface : colors.textPrimary,
                      fontFamily: typography.fontFamily.bold
                    }
                  ]}
                >
                  Donor
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'owner'
                    ? { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary }
                    : { backgroundColor: 'transparent', borderColor: colors.border }
                ]}
                onPress={() => setRole('owner')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.roleText,
                    {
                      color: role === 'owner' ? colors.surface : colors.textPrimary,
                      fontFamily: typography.fontFamily.bold
                    }
                  ]}
                >
                  Case owner
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
              Full name
            </Text>
            <AppInput
              placeholder="John Doe"
              onChangeText={setName}
              value={name}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
              Email address
            </Text>
            <AppInput
              placeholder="name@example.com"
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
              Password
            </Text>
            <AppInput
              placeholder="••••••••"
              onChangeText={setPassword}
              value={password}
              secureTextEntry={true}
              autoCapitalize="none"
            />
          </View>

          <AppButton 
            title="Create account"
            onPress={() => signUpWithEmail()}
            loading={loading}
            style={styles.signUpButton}
          />
        </AppCard>

        {/* Terms Warning Banner */}
        <View style={[styles.termsBanner, { backgroundColor: colors.border }]}>
          <Text style={[styles.termsText, { color: colors.textPrimary, fontFamily: typography.fontFamily.regular }]}>
            By creating an account, you agree to keep case information accurate, respond to validation requests, and maintain the audit trail of all contributions.
          </Text>
        </View>

        {/* Sign In Spacer and Outlined Button */}
        <View style={styles.footerSpacing} />
        <AppButton 
          title="Already have an account? Sign in"
          onPress={() => navigation.navigate('Login')}
          variant="outline"
          style={styles.signInButton}
        />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    justifyContent: 'flex-start',
  },
  brandingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandingText: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  brandSubtitle: {
    fontSize: 9,
    letterSpacing: 1,
    lineHeight: 11,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 15,
    lineHeight: 22,
  },
  formCard: {
    padding: 20,
    marginBottom: 20,
  },
  roleWrapper: {
    marginBottom: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  roleButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signUpButton: {
    marginTop: 10,
    width: '100%',
  },
  termsBanner: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  termsText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    opacity: 0.85,
  },
  footerSpacing: {
    flex: 1,
    minHeight: 20,
  },
  signInButton: {
    width: '100%',
    marginBottom: 10,
  },
});
