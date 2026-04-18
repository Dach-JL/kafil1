import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../supabase/AuthContext';
import { updateProfile } from '../api/profiles';
import { Save, User as UserIcon, Phone } from 'lucide-react-native';

export default function AccountSettingsScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
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

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.card,
      color: colors.text,
      borderColor: colors.border,
      fontFamily: typography.fontFamily.regular,
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.medium }]}>
          {t('profile.personalInfo', { defaultValue: 'PERSONAL INFORMATION' })}
        </Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <UserIcon size={16} color={colors.primary} />
            <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
              {t('auth.fullName')}
            </Text>
          </View>
          <TextInput
            style={inputStyle}
            value={name}
            onChangeText={setName}
            placeholder={t('auth.namePlaceholder')}
            placeholderTextColor={colors.mutedForeground}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <Phone size={16} color={colors.primary} />
            <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
              {t('auth.phoneNumber', { defaultValue: 'Phone Number' })}
            </Text>
          </View>
          <TextInput
            style={inputStyle}
            value={phone}
            onChangeText={setPhone}
            placeholder="+251 9..."
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <>
            <Save color={colors.primaryForeground} size={20} />
            <Text style={[styles.saveBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
              {t('buttons.saveChanges', { defaultValue: 'Save Changes' })}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 13, letterSpacing: 1, marginBottom: 20 },
  inputContainer: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  label: { fontSize: 14 },
  input: {
    height: 54,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  saveBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { fontSize: 16 },
});
