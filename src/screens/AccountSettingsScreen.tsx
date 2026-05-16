import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../supabase/AuthContext';
import { updateProfile } from '../api/profiles';
import { Save, User as UserIcon, Phone } from 'lucide-react-native';
import AppButton from '../components/common/AppButton';
import AppInput from '../components/common/AppInput';

export default function AccountSettingsScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
  const { profile, refreshProfile } = useAuth();

  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.error'), t('auth.nameRequired'));
      return;
    }

    setSaving(true);
    try {
      await updateProfile(profile!.id, { name: name.trim(), phone: phone.trim() });
      await refreshProfile();
      Alert.alert(t('common.success'), t('profile.settingsUpdated', { defaultValue: 'Settings updated successfully!' }));
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
          {t('profile.personalInfo', { defaultValue: 'Personal Information' })}
        </Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <UserIcon size={18} color={colors.accent} />
            <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
              {t('auth.fullName')}
            </Text>
          </View>
          <AppInput
            value={name}
            onChangeText={setName}
            placeholder={t('auth.namePlaceholder')}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <Phone size={18} color={colors.accent} />
            <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
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
      </View>

      <AppButton
        title={t('buttons.saveChanges', { defaultValue: 'Save Changes' })}
        onPress={handleSave}
        loading={saving}
        style={styles.saveBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 60 },
  section: { marginBottom: 40 },
  sectionTitle: { fontSize: 13, letterSpacing: 1.5, marginBottom: 24, textTransform: 'uppercase' },
  inputContainer: { marginBottom: 28 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  label: { fontSize: 14, opacity: 0.8 },
  saveBtn: { marginTop: 8 },
});


