import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { Case } from '../../types/cases';
import { verifyCaseCompletion } from '../../api/cases';
import { getSignedUrl } from '../../services/storageService';
import { useAuth } from '../../supabase/AuthContext';
import { format } from 'date-fns';
import { ShieldCheck, ArrowLeft, Image as ImageIcon, ExternalLink, FileText } from 'lucide-react-native';
import OutcomeShowcase from '../../components/OutcomeShowcase';

export default function AdminCaseCompletionDetailScreen({ route, navigation }: any) {
  const { caseInfo } = route.params as { caseInfo: Case };
  const { colors, typography } = useTheme();
  const { user } = useAuth();

  const [processing, setProcessing] = useState(false);


  const handleApprove = async () => {
    Alert.alert(
      'Verify Completion',
      'By approving this, you are confirming that the funds have been disbursed as reported. The case will be marked as COMPLETED.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify & Finalize',
          style: 'default',
          onPress: async () => {
            if (!user) return;
            setProcessing(true);
            try {
              await verifyCaseCompletion(caseInfo.id, user.id);
              Alert.alert('Impact Approved! 🎉', 'The case has been successfully locked and completed.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to verify completion.');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={processing}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          Review Completion
        </Text>
        <ShieldCheck color={colors.primary} size={24} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Case Title
          </Text>
          <Text style={[styles.value, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            {caseInfo.title}
          </Text>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>Target</Text>
              <Text style={[styles.value, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>${caseInfo.target_amount.toLocaleString()}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>Collected</Text>
              <Text style={[styles.value, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>${caseInfo.collected_amount.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Beneficiary
          </Text>
          <Text style={[styles.value, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            {caseInfo.beneficiary_name}
          </Text>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.heading, marginLeft: 16 }]}>
            Impact Report
          </Text>
          <OutcomeShowcase 
            description={caseInfo.completion_description || ''} 
            images={caseInfo.completion_images || []} 
            outcomeDate={caseInfo.outcome_date}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={handleApprove}
          disabled={processing || !caseInfo.completion_proof_url}
        >
          {processing ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.btnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
              Approve Completion
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18 },
  scroll: { padding: 20, paddingBottom: 40 },
  card: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  label: { fontSize: 13, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 18 },
  statsRow: { flexDirection: 'row', gap: 24 },
  stat: { flex: 1 },
  divider: { height: 1, backgroundColor: '#00000010', marginVertical: 16 },
  sectionTitle: { fontSize: 18, marginBottom: 16 },
  imagePlaceholder: { height: 300, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  noImageText: { fontSize: 14 },
  imageWrapper: { height: 400, borderRadius: 12, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%' },
  fullScreenBtn: { position: 'absolute', top: 12, right: 12, padding: 8, borderRadius: 8 },
  footer: { padding: 20, borderTopWidth: 1 },
  btn: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16 },
});
