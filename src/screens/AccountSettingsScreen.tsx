import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../supabase/AuthContext';
import { updateProfile } from '../api/profiles';
import { User as UserIcon, Phone } from 'lucide-react-native';
import AppButton from '../components/common/AppButton';
import AppInput from '../components/common/AppInput';
import AppCard from '../components/common/AppCard';

export default function AccountSettingsScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const { profile, refreshProfile } = useAuth();

  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), t('auth.nameRequired', { defaultValue: 'Full name is required.' }));
      return;
    }

    setSaving(true);
    try {
      await updateProfile(profile!.id, { name: name.trim(), phone: phone.trim() });
      await refreshProfile();
      Alert.alert(t('common.success', { defaultValue: 'Success' }), t('profile.settingsUpdated', { defaultValue: 'Settings updated successfully!' }));
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(t('common.error', { defaultValue: 'Error' }), err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.bold }]}>
          {t('profile.personalInfo', { defaultValue: 'PERSONAL INFORMATION' })}
        </Text>
        
        <AppCard style={styles.card}>
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <UserIcon size={16} color={colors.accent} />
              <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
                {t('auth.fullName', { defaultValue: 'Full Name' })}
              </Text>
            </View>
            <AppInput
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Phone size={16} color={colors.accent} />
              <Text style={[styles.label, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
                {t('auth.phoneNumber', { defaultValue: 'Phone Number' })}
              </Text>
            </View>
            <AppInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+251 9..."
              keyboardType="phone-pad"
            />
          </View>
        </AppCard>

        <AppButton
          title={t('buttons.saveChanges', { defaultValue: 'Save Changes' })}
          onPress={handleSave}
          loading={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  sectionTitle: { fontSize: 11, letterSpacing: 1, marginBottom: 12, marginLeft: 2, textTransform: 'uppercase' },
  card: { padding: 20, marginBottom: 24 },
  inputContainer: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  label: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  saveBtn: { marginTop: 8 },
});
