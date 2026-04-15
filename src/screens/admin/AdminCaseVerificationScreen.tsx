import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { Case, CATEGORY_LABELS } from '../../types/cases';
import { verifyCase, rejectCase } from '../../api/cases';
import { useAuth } from '../../supabase/AuthContext';
import { listFiles, getSignedUrl } from '../../services/storageService';
import { Check, X, FileText, Download, ArrowLeft } from 'lucide-react-native';
import { format } from 'date-fns';

interface Props {
  route: any;
  navigation: any;
}

export default function AdminCaseVerificationScreen({ route, navigation }: Props) {
  const caseInfo = route.params.caseInfo as Case;
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  
  const [evidenceFiles, setEvidenceFiles] = useState<{ name: string; url: string }[]>([]);
  const [loadingEvidence, setLoadingEvidence] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadEvidence() {
      try {
        const paths = await listFiles('case-evidence', caseInfo.owner_id, caseInfo.id);
        const filesWithUrls = await Promise.all(
          paths.map(async (path) => {
            const url = await getSignedUrl('case-evidence', path);
            const name = path.split('/').pop() || 'Document';
            return { name, url };
          })
        );
        setEvidenceFiles(filesWithUrls);
      } catch (err) {
        console.error('Error loading evidence:', err);
      } finally {
        setLoadingEvidence(false);
      }
    }
    loadEvidence();
  }, [caseInfo]);

  async function handleApprove() {
    Alert.alert(
      'Approve Case',
      'Are you sure you want to approve this case? It will be publicly visible and start accepting contributions.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          style: 'default',
          onPress: async () => {
            setSubmitting(true);
            try {
              await verifyCase(caseInfo.id, user!.id);
              Alert.alert('Success', 'Case has been verified and is now live!');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  }

  async function handleReject() {
    Alert.prompt(
      'Reject Case',
      'Please provide a reason for rejection. This will be visible to the case owner.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason: string | undefined) => {
            if (!reason?.trim()) {
              Alert.alert('Required', 'You must provide a rejection reason.');
              return;
            }
            setSubmitting(true);
            try {
              await rejectCase(caseInfo.id, reason.trim());
              Alert.alert('Case Rejected', 'The case owner will be notified to make corrections.');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  }

  const URGENCY_LABELS = ['', 'Low', 'Medium', 'High', 'Critical', 'Emergency'];
  const rowStyle = { borderBottomColor: colors.border };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          Verify Case
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Case Info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            {caseInfo.title}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.badgeText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
              {CATEGORY_LABELS[caseInfo.category]}
            </Text>
          </View>
          <Text style={[styles.desc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            {caseInfo.description}
          </Text>
        </View>

        {/* Details Data */}
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: 'Beneficiary', value: `${caseInfo.beneficiary_name} ${caseInfo.beneficiary_age ? `(${caseInfo.beneficiary_age} yrs)` : ''}` },
            { label: 'Location', value: caseInfo.location || 'Not specified' },
            { label: 'Target Amount', value: `$${caseInfo.target_amount.toLocaleString()}` },
            { label: 'Urgency', value: URGENCY_LABELS[caseInfo.urgency_level] },
            { label: 'Deadline', value: caseInfo.deadline ? format(new Date(caseInfo.deadline), 'MMM dd, yyyy') : 'No deadline' },
            { label: 'Anonymous Submission', value: caseInfo.is_anonymous ? 'Yes' : 'No' },
            { label: 'Submitted Date', value: format(new Date(caseInfo.updated_at), 'MMM dd, yyyy HH:mm') },
          ].map(({ label, value }, i) => (
            <View key={i} style={[styles.detailRow, rowStyle, i > 0 && { borderTopWidth: 1 }]}>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>{label}</Text>
              <Text style={[styles.detailValue, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Evidence Section */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          Supporting Evidence
        </Text>
        
        <View style={[styles.evidenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {loadingEvidence ? (
            <ActivityIndicator color={colors.primary} style={{ margin: 20 }} />
          ) : evidenceFiles.length === 0 ? (
            <Text style={[styles.noEvidence, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              No evidence files attached.
            </Text>
          ) : (
            evidenceFiles.map((file, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.fileRow, rowStyle, idx > 0 && { borderTopWidth: 1 }]}
                onPress={() => Linking.openURL(file.url)}
              >
                <View style={styles.fileLeft}>
                  <FileText color={colors.primary} size={20} />
                  <Text style={[styles.fileName, { color: colors.text, fontFamily: typography.fontFamily.medium }]} numberOfLines={1}>
                    {file.name}
                  </Text>
                </View>
                <Download color={colors.mutedForeground} size={18} />
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>

      {/* Admin Actions */}
      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn, { borderColor: colors.destructive }]}
          onPress={handleReject}
          disabled={submitting}
        >
          <X color={colors.destructive} size={20} />
          <Text style={[styles.actionBtnText, { color: colors.destructive, fontFamily: typography.fontFamily.medium }]}>
            Reject
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn, { backgroundColor: colors.primary }]}
          onPress={handleApprove}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Check color={colors.primaryForeground} size={20} />
              <Text style={[styles.actionBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
                Approve & Publish
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18 },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  cardTitle: { fontSize: 20, marginBottom: 8 },
  badge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, marginBottom: 12 },
  badgeText: { fontSize: 12 },
  desc: { fontSize: 14, lineHeight: 22 },
  detailCard: { borderRadius: 12, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  detailLabel: { fontSize: 13, flex: 1 },
  detailValue: { fontSize: 13, flex: 2, textAlign: 'right' },
  sectionTitle: { fontSize: 18, marginBottom: 12, marginLeft: 4 },
  evidenceCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  noEvidence: { padding: 16, textAlign: 'center', fontSize: 14 },
  fileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  fileLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  fileName: { fontSize: 14, flex: 1 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    paddingBottom: 32, // for safe area
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rejectBtn: { borderWidth: 1 },
  approveBtn: {},
  actionBtnText: { fontSize: 16 },
});
