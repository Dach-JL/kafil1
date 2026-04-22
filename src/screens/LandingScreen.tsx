import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, Check, ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { changeLanguage, SUPPORTED_LANGS } from '../i18n';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  om: 'Afaan Oromoo',
  am: 'አማርኛ',
};

export default function LandingScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { t, i18n } = useTranslation();
  const [showLangPicker, setShowLangPicker] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Language Picker */}
      <View style={styles.topBar}>
        <View />
        <TouchableOpacity 
          style={[styles.langTrigger, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowLangPicker(!showLangPicker)}
          activeOpacity={0.7}
        >
          <Globe size={16} color={colors.primary} />
          <Text style={[styles.langTriggerText, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            {i18n.language.toUpperCase()}
          </Text>
          <ChevronDown size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {showLangPicker && (
        <View style={[styles.langMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {SUPPORTED_LANGS.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.langOption,
                { borderBottomColor: colors.border },
                i18n.language === lang && { backgroundColor: colors.primary + '10' },
              ]}
              onPress={() => {
                changeLanguage(lang);
                setShowLangPicker(false);
              }}
            >
              <Text style={[
                styles.langText, 
                { color: i18n.language === lang ? colors.primary : colors.text, fontFamily: typography.fontFamily.medium }
              ]}>
                {LANGUAGE_NAMES[lang]}
              </Text>
              {i18n.language === lang && <Check color={colors.primary} size={16} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Pressable style={{ flex: 1 }} onPress={() => setShowLangPicker(false)}>
        <View style={styles.content}>
          <View style={styles.headerGroup}>
            <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
              {t('common.appName')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              {t('landing.tagline')}
            </Text>
          </View>
          
          <View style={styles.actionGroup}>
            <Pressable 
              style={({ pressed }) => [
                styles.button,
                { 
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }]
                }
              ]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.buttonText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
                {t('buttons.getStarted')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  langTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  langTriggerText: {
    fontSize: 13,
  },
  langMenu: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 180,
    borderRadius: 16,
    borderWidth: 1,
    zIndex: 100,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  langText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  headerGroup: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 48,
    letterSpacing: -1,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  actionGroup: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
