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
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../supabase/supabaseClient';

export default function RegisterScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'contributor' | 'owner'>('contributor');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
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
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Verification email sent! Please check your inbox.');
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
            Join CharityTrust
          </Text>
          <Text style={[styles.subheading, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Start your journey of transparency
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card, 
                color: colors.text, 
                borderColor: colors.border,
                fontFamily: typography.fontFamily.regular 
              }]}
              placeholder="John Doe"
              placeholderTextColor={colors.mutedForeground}
              onChangeText={(text) => setName(text)}
              value={name}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card, 
                color: colors.text, 
                borderColor: colors.border,
                fontFamily: typography.fontFamily.regular 
              }]}
              placeholder="name@example.com"
              placeholderTextColor={colors.mutedForeground}
              onChangeText={(text) => setEmail(text)}
              value={email}
              autoCapitalize={'none'}
              keyboardType={'email-address'}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card, 
                color: colors.text, 
                borderColor: colors.border,
                fontFamily: typography.fontFamily.regular 
              }]}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              autoCapitalize={'none'}
            />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>I want to be a:</Text>
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
              ]}>Contributor</Text>
              <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>I want to fund cases</Text>
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
              ]}>Case Owner</Text>
              <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>I need funding for a case</Text>
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
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.link, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
                Sign In
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
