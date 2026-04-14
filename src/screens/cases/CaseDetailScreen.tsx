import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { getCaseById } from '../../api/cases';
import { Case } from '../../types/cases';
import { ArrowLeft } from 'lucide-react-native';

export default function CaseDetailScreen({ route, navigation }: any) {
  const { caseId } = route.params;
  const { colors, typography } = useTheme();
  const [caseInfo, setCaseInfo] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCase() {
      try {
        const data = await getCaseById(caseId);
        setCaseInfo(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [caseId]);

  if (loading || !caseInfo) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          Case Details
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{caseInfo.title}</Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>
          Full Case Detail UI will be implemented in Phase 14.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18 },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  desc: { fontSize: 16 },
});
