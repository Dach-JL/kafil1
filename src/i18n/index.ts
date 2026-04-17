import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import om from '../locales/om.json';
import am from '../locales/am.json';

const LANGUAGE_KEY = '@charitytrust_language';
const SUPPORTED_LANGS = ['en', 'om', 'am'];

/**
 * Detects the best language to use:
 * 1. Check AsyncStorage for a user-saved preference
 * 2. Fall back to device language (expo-localization)
 * 3. Fall back to English
 */
async function getInitialLanguage(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      return saved;
    }
  } catch (e) {
    // AsyncStorage failed, continue to device detection
  }

  // Get device locale (e.g. "en-US", "om-ET", "am-ET")
  const deviceLocale = Localization.getLocales()?.[0]?.languageCode ?? 'en';
  return SUPPORTED_LANGS.includes(deviceLocale) ? deviceLocale : 'en';
}

/**
 * Save the selected language to async storage for persistence
 */
export async function saveLanguage(lang: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (e) {
    console.error('Failed to save language preference', e);
  }
}

/**
 * Change the active language and persist it
 */
export async function changeLanguage(lang: string): Promise<void> {
  await i18n.changeLanguage(lang);
  await saveLanguage(lang);
}

/**
 * Initialize i18n. Call this ONCE before the React tree renders.
 */
export async function initI18n(): Promise<void> {
  const lng = await getInitialLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        om: { translation: om },
        am: { translation: am },
      },
      lng,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React Native handles escaping
      },
      react: {
        useSuspense: false, // We handle loading states manually
      },
      // Never show empty strings — always fall back to English
      returnNull: false,
      returnEmptyString: false,
    });
}

export { SUPPORTED_LANGS, LANGUAGE_KEY };
export default i18n;
