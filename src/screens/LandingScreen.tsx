import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, Check, ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { palette } from '../theme/colors';
import { changeLanguage, SUPPORTED_LANGS } from '../i18n';
import AppButton from '../components/common/AppButton';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  om: 'Afaan Oromoo',
  am: 'አማርኛ',
};

export default function LandingScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
  const { t, i18n } = useTranslation();
  const [showLangPicker, setShowLangPicker] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Language Picker */}
      <View style={styles.topBar}>
        <View />
        <TouchableOpacity 
          style={[styles.langTrigger, { backgroundColor: palette.navyLight, borderColor: colors.accent + '30' }]}
          onPress={() => setShowLangPicker(!showLangPicker)}
          activeOpacity={0.7}
        >
          <Globe size={18} color={colors.accent} />
          <Text style={[styles.langTriggerText, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
            {i18n.language.toUpperCase()}
          </Text>
          <ChevronDown size={14} color={colors.accent} opacity={0.6} />
        </TouchableOpacity>
      </View>

      {showLangPicker && (
        <View style={[styles.langMenu, { backgroundColor: palette.navyLight, borderColor: colors.accent + '40', shadowColor: '#000' }]}>
          {SUPPORTED_LANGS.map((lang, index) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.langOption,
                { borderBottomColor: colors.background + '50' },
                index === SUPPORTED_LANGS.length - 1 && { borderBottomWidth: 0 },
                i18n.language === lang && { backgroundColor: colors.accent + '15' },
              ]}
              onPress={() => {
                changeLanguage(lang);
                setShowLangPicker(false);
              }}
            >
              <Text style={[
                styles.langText, 
                { color: i18n.language === lang ? colors.accent : colors.textInverse, fontFamily: i18n.language === lang ? typography.fontFamily.bold : typography.fontFamily.medium }
              ]}>
                {LANGUAGE_NAMES[lang]}
              </Text>
              {i18n.language === lang && <Check color={colors.accent} size={18} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Pressable style={{ flex: 1 }} onPress={() => setShowLangPicker(false)}>
        <View style={styles.content}>
          <View style={styles.headerGroup}>
            <Text style={[styles.title, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
              {t('common.appName', { defaultValue: 'Kafil' })}
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.accent }]} />
            <Text style={[styles.subtitle, { color: colors.textInverse, opacity: 0.8, fontFamily: typography.fontFamily.regular }]}>
              {t('landing.tagline', { defaultValue: 'Transparent, trust-driven impact for Ethiopia' })}
            </Text>
          </View>
          
          <View style={styles.actionGroup}>
            <AppButton
              title={t('buttons.getStarted', { defaultValue: 'Get Started' })}
              onPress={() => navigation.navigate('Login')}
              style={styles.button}
            />
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
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  langTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  langTriggerText: {
    fontSize: 14,
  },
  langMenu: {
    position: 'absolute',
    top: 70,
    right: 20,
    width: 220,
    borderRadius: 20,
    borderWidth: 1.5,
    zIndex: 100,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  langText: {
    fontSize: 15,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingBottom: 60,
  },
  headerGroup: {
    alignItems: 'center',
    marginBottom: 80,
  },
  title: {
    fontSize: 72,
    letterSpacing: -2,
    marginBottom: 16,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 4,
    borderRadius: 2,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: 10,
  },
  actionGroup: {
    width: '100%',
    maxWidth: 320,
  },
  button: {
    height: 64,
  },
});


