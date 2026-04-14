import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { CaseCategory, CATEGORY_LABELS } from '../../types/cases';

interface Step1Props {
  data: {
    title: string;
    description: string;
    category: CaseCategory;
    beneficiary_name: string;
    beneficiary_age: string;
    location: string;
  };
  onChange: (field: string, value: string) => void;
}

const CATEGORIES = Object.keys(CATEGORY_LABELS) as CaseCategory[];

export default function Step1BasicInfo({ data, onChange }: Step1Props) {
  const { colors, typography } = useTheme();

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.card,
      color: colors.text,
      borderColor: colors.border,
      fontFamily: typography.fontFamily.regular,
    },
  ];

  const labelStyle = [
    styles.label,
    { color: colors.text, fontFamily: typography.fontFamily.medium },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: typography.fontFamily.heading }]}>
        Case Details
      </Text>

      {/* Category Selector */}
      <Text style={labelStyle}>Category *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  data.category === cat ? colors.primary : colors.card,
                borderColor:
                  data.category === cat ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onChange('category', cat)}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color: data.category === cat ? colors.primaryForeground : colors.text,
                  fontFamily: typography.fontFamily.medium,
                },
              ]}
            >
              {CATEGORY_LABELS[cat]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Title */}
      <Text style={labelStyle}>Case Title *</Text>
      <TextInput
        style={inputStyle}
        placeholder="e.g. Emergency surgery for Ahmed, 7"
        placeholderTextColor={colors.mutedForeground}
        value={data.title}
        onChangeText={(v) => onChange('title', v)}
        maxLength={80}
      />

      {/* Description */}
      <Text style={labelStyle}>Full Description *</Text>
      <TextInput
        style={[inputStyle, styles.textarea]}
        placeholder="Describe the situation in detail — what happened, why help is needed, and how funds will be used..."
        placeholderTextColor={colors.mutedForeground}
        value={data.description}
        onChangeText={(v) => onChange('description', v)}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      {/* Beneficiary */}
      <Text style={labelStyle}>Beneficiary Name *</Text>
      <TextInput
        style={inputStyle}
        placeholder="Full name of the person being helped"
        placeholderTextColor={colors.mutedForeground}
        value={data.beneficiary_name}
        onChangeText={(v) => onChange('beneficiary_name', v)}
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={labelStyle}>Age</Text>
          <TextInput
            style={inputStyle}
            placeholder="Age"
            placeholderTextColor={colors.mutedForeground}
            value={data.beneficiary_age}
            onChangeText={(v) => onChange('beneficiary_age', v)}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
        <View style={styles.halfField}>
          <Text style={labelStyle}>Location</Text>
          <TextInput
            style={inputStyle}
            placeholder="City, Country"
            placeholderTextColor={colors.mutedForeground}
            value={data.location}
            onChangeText={(v) => onChange('location', v)}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 20, marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 6, marginLeft: 2 },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  textarea: { height: 110, paddingTop: 12, marginBottom: 16 },
  categoryRow: { marginBottom: 16 },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  categoryText: { fontSize: 13 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
});
