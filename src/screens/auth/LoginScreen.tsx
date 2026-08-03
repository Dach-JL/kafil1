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

export default function LoginScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    if (!email.trim() || !password) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('auth.emptyFields', { defaultValue: 'Please fill in all fields' }));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) Alert.alert(t('common.error', { defaultValue: 'Error' }), error.message);
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

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.heading, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
            Welcome back
          </Text>
          <Text style={[styles.subheading, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Sign in to follow verified cases, contribution updates, and final impact reports.
          </Text>
        </View>

        {/* Input Form Card */}
        <AppCard style={styles.formCard}>
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
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
                Password
              </Text>
              <TouchableOpacity onPress={() => Alert.alert('Reset Password', 'Password reset function is disabled')}>
                <Text style={[styles.forgotLink, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
                  Forgot?
                </Text>
              </TouchableOpacity>
            </View>
            <AppInput
              placeholder="••••••••"
              onChangeText={setPassword}
              value={password}
              secureTextEntry={true}
              autoCapitalize="none"
            />
          </View>

          <AppButton 
            title="Sign in securely"
            onPress={() => signInWithEmail()}
            loading={loading}
            style={styles.signInButton}
          />
        </AppCard>

        {/* Trust Alert Banner */}
        <View style={[styles.trustBanner, { backgroundColor: colors.border }]}>
          <Text style={[styles.trustText, { color: colors.textPrimary, fontFamily: typography.fontFamily.regular }]}>
            Your account keeps contribution receipts, verification evidence, and impact history secure and organized in one place.
          </Text>
        </View>

        {/* Create Account Spacer and Button */}
        <View style={styles.footerSpacing} />
        <AppButton 
          title="Create a new account"
          onPress={() => navigation.navigate('Register')}
          variant="outline"
          style={styles.createAccountButton}
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
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  forgotLink: {
    fontSize: 13,
    marginBottom: 8,
  },
  signInButton: {
    marginTop: 10,
    width: '100%',
  },
  trustBanner: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  trustText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    opacity: 0.85,
  },
  footerSpacing: {
    flex: 1,
    minHeight: 20,
  },
  createAccountButton: {
    width: '100%',
    marginBottom: 10,
  },
});
