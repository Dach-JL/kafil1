import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../hooks/useTheme';
import { palette } from '../../../theme/colors';
import { CaseCategory, CATEGORY_LABELS } from '../../../types/cases';
import AppInput from '../../../components/common/AppInput';

interface Step1Props {
  data: {
    title: string;
    description: string;
    category: CaseCategory;
  };
  onChange: (field: string, value: string) => void;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as CaseCategory[];

export default function Step1BasicInfo({ data, onChange }: Step1Props) {
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
        {t('createCase.caseDetails', { defaultValue: 'Case Details' })}
      </Text>

      {/* Category Selector */}
      <Text style={[styles.label, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
        {t('createCase.categoryLabel', { defaultValue: 'Category *' })}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {CATEGORIES.map((cat) => {
          const isSelected = data.category === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isSelected ? colors.accent : palette.navyLight,
                  borderColor: isSelected ? colors.accent : colors.accent + '20',
                },
              ]}
              onPress={() => onChange('category', cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color: isSelected ? colors.background : colors.textInverse,
                    fontFamily: isSelected ? typography.fontFamily.bold : typography.fontFamily.medium,
                    opacity: isSelected ? 1 : 0.6,
                  },
                ]}
              >
                {t(`categories.${cat}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Title */}
      <AppInput
        label={t('createCase.caseTitleLabel', { defaultValue: 'Case Title *' })}
        placeholder={t('createCase.caseTitlePlaceholder', { defaultValue: 'e.g. Emergency surgery for Ahmed, 7' })}
        value={data.title}
        onChangeText={(v) => onChange('title', v)}
        maxLength={80}
      />

      {/* Description */}
      <AppInput
        label={t('createCase.fullDescriptionLabel', { defaultValue: 'Full Description *' })}
        placeholder={t('createCase.descriptionPlaceholder', { defaultValue: 'Describe the situation in detail — what happened, why help is needed, and how funds will be used...' })}
        value={data.description}
        onChangeText={(v) => onChange('description', v)}
        multiline
        numberOfLines={6}
        inputStyle={styles.textarea}
        containerStyle={styles.textareaContainer}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  sectionTitle: { fontSize: 24, marginBottom: 24 },
  label: { fontSize: 13, marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  categoryRow: { marginBottom: 32 },
  categoryChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    marginRight: 12,
  },
  categoryText: { fontSize: 14 },
  textareaContainer: { marginBottom: 32 },
  textarea: { textAlignVertical: 'top' },
});


