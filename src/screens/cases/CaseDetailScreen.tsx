import React, { useEffect, useState } from 'react'; 
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { getCaseById } from '../../api/cases';
import { getCaseTimeline } from '../../api/events';
import { Case, CATEGORY_LABELS } from '../../types/cases';
import { EventLog} from '../../types/events';
import { ArrowLeft, ShieldCheck, MapPin, Clock, User, Target, CheckCircle2, MessageSquare, Heart } from 'lucide-react-native';
import { getOrCreateChatRoom } from '../../api/chat';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '../../supabase/AuthContext';
import CaseTimeline from '../../components/CaseTimeline';
import TrustBadge from '../../components/TrustBadge';
import OutcomeShowcase from '../../components/OutcomeShowcase';

export default function CaseDetailScreen({ route, navigation }: any) {
  const { caseId } = route.params;
  const { colors, typography } = useTheme();
  const { user } = useAuth();
  const [caseInfo, setCaseInfo] = useState<Case | null>(null);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [initiatingChat, setInitiatingChat] = useState(false);

  useEffect(() => {
    async function loadCase() {
      try {
        const [data, timeline] = await Promise.all([
          getCaseById(caseId),
          getCaseTimeline(caseId),
        ]);
        setCaseInfo(data);
        setEvents(timeline);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [caseId]);

  const handleMessageOrganizer = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    if (!caseInfo) return;

    try {
      setInitiatingChat(true);
      const roomId = await getOrCreateChatRoom(caseId, caseInfo.owner_id);
      navigation.navigate('ChatRoom', { 
        roomId, 
        recipientName: caseInfo.owner?.name || 'Organizer' 
      });
    } catch (err: any) {
      console.error(err);
      alert('Could not start conversation. Please try again later.');
    } finally {
      setInitiatingChat(false);
    }
  };

  if (loading || !caseInfo) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const progress = Math.min((caseInfo.collected_amount / caseInfo.target_amount) * 100, 100);
  const isVerified = caseInfo.status === 'VERIFIED' || caseInfo.status === 'ACTIVE_FUNDING' || caseInfo.status === 'FUNDED' || caseInfo.status === 'COMPLETED';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          Case Details
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Verification Banner */}
        {isVerified && (
          <View style={[styles.verifiedBanner, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
            <ShieldCheck color={colors.primary} size={20} />
            <Text style={[styles.verifiedText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
              Verified by CharityTrust
            </Text>
          </View>
        )}

        {/* Impact Showcase (Phase 25) */}
        {caseInfo.status === 'COMPLETED' && (
          <OutcomeShowcase 
            description={caseInfo.completion_description || ''} 
            images={caseInfo.completion_images || []} 
            outcomeDate={caseInfo.outcome_date}
            isApproved={caseInfo.impact_report_status === 'APPROVED'}
          />
        )}

        <View style={[styles.categoryBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.categoryText, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            {CATEGORY_LABELS[caseInfo.category]}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          {caseInfo.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MapPin color={colors.mutedForeground} size={14} />
            <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              {caseInfo.location || 'Local'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Clock color={colors.mutedForeground} size={14} />
            <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              Posted {formatDistanceToNow(new Date(caseInfo.created_at), { addSuffix: true })}
            </Text>
          </View>
        </View>

        {/* Funding Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.fundingHeader}>
            <Text style={[styles.raisedLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              Amount Raised
            </Text>
            <Text style={[styles.percentage, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
              {Math.round(progress)}%
            </Text>
          </View>

          <Text style={[styles.raisedAmount, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            ${caseInfo.collected_amount.toLocaleString()}
            <Text style={[styles.targetAmount, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              {' '}of ${caseInfo.target_amount.toLocaleString()}
            </Text>
          </Text>

          <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
          </View>
        </View>

        {/* Beneficiary Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            Who needs help?
          </Text>
          <View style={[styles.beneficiaryCard, { backgroundColor: colors.secondary }]}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
              <User color={colors.mutedForeground} size={24} />
            </View>
            <View>
              <Text style={[styles.beneficiaryName, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
                {caseInfo.beneficiary_name} {caseInfo.beneficiary_age ? `(${caseInfo.beneficiary_age} yrs)` : ''}
              </Text>
              {caseInfo.is_anonymous && (
                <Text style={[styles.anonymousLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
                  Submitted Anonymously
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            The Story
          </Text>
          <Text style={[styles.description, { color: colors.text, fontFamily: typography.fontFamily.regular }]}>
            {caseInfo.description}
          </Text>
        </View>

        {/* Organizer Rep */}
        {caseInfo.owner_id && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
              The Organizer
            </Text>
            <View style={[styles.organizerCard, { borderColor: colors.border }]}>
              <View style={[styles.ownerAvatar, { backgroundColor: colors.primary + '15' }]}>
                <User color={colors.primary} size={20} />
              </View>
              <View style={styles.organizerInfo}>
                <Text style={[styles.ownerName, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
                  {caseInfo.owner?.name || 'Case Organizer'}
                </Text>
                {caseInfo.owner && <TrustBadge score={caseInfo.owner.trust_score} />}
              </View>
              {user?.id !== caseInfo.owner_id && (
                <TouchableOpacity 
                  style={[styles.msgBtn, { backgroundColor: colors.secondary }]}
                  onPress={handleMessageOrganizer}
                  disabled={initiatingChat}
                >
                  {initiatingChat ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <MessageSquare color={colors.primary} size={18} />
                      <Text style={{ color: colors.primary, fontFamily: typography.fontFamily.medium, fontSize: 13 }}>
                        Message
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Case Timeline */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
            Timeline
          </Text>
          <CaseTimeline events={events} />
        </View>

        {/* Meta Details */}
        <View style={[styles.grid, { borderColor: colors.border, borderTopWidth: 1, borderBottomWidth: 1 }]}>
          <View style={[styles.gridItem, { borderRightWidth: 1, borderColor: colors.border }]}>
            <Target color={colors.primary} size={20} />
            <Text style={[styles.gridLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>Urgency</Text>
            <Text style={[styles.gridValue, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
              Level {caseInfo.urgency_level}/5
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Clock color={colors.primary} size={20} />
            <Text style={[styles.gridLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>Deadline</Text>
            <Text style={[styles.gridValue, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
              {caseInfo.deadline ? format(new Date(caseInfo.deadline), 'MMM dd, yyyy') : 'None'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      {(caseInfo.status === 'VERIFIED' || caseInfo.status === 'ACTIVE_FUNDING') && (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.donateBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('FundCase', { caseId })}
          >
            <Text style={[styles.donateBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
              Fund this Case
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Owner Action: Submit Completion Proof */}
      {caseInfo.status === 'FUNDED' && user?.id === caseInfo.owner_id && !caseInfo.completion_proof_url && (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.donateBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SubmitCompletionProof', { caseId })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 color={colors.primaryForeground} size={20} />
              <Text style={[styles.donateBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
                Submit Completion Proof
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Goal Met Celebration (for non-owners or when proof submitted) */}
      {caseInfo.status === 'FUNDED' && (user?.id !== caseInfo.owner_id || caseInfo.completion_proof_url) && (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <View style={[styles.statusBanner, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40', borderWidth: 1 }]}>
            <Heart color={colors.primary} size={20} fill={colors.primary} />
            <Text style={[styles.statusBannerText, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
              Goal Met! Thanks for your help 💝
            </Text>
          </View>
        </View>
      )}

      {/* Completion Pending Banner (Overlay on top of goal met if owner sees it) */}
      {caseInfo.status === 'FUNDED' && caseInfo.completion_proof_url && user?.id === caseInfo.owner_id && (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background, marginTop: -96 }]}>
          <View style={[styles.statusBanner, { backgroundColor: colors.secondary }]}>
            <Clock color={colors.mutedForeground} size={20} />
            <Text style={[styles.statusBannerText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.medium }]}>
              Completion Proof Pending Review
            </Text>
          </View>
        </View>
      )}

      {/* Completed Banner */}
      {caseInfo.status === 'COMPLETED' && (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <View style={[styles.statusBanner, { backgroundColor: colors.primary + '20' }]}>
            <CheckCircle2 color={colors.primary} size={20} />
            <Text style={[styles.statusBannerText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
              Case Successfully Completed
            </Text>
          </View>
        </View>
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18 },
  scroll: { padding: 20, paddingBottom: 40 },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  verifiedText: { fontSize: 14 },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryText: { fontSize: 13 },
  title: { fontSize: 26, lineHeight: 32, letterSpacing: -0.5, marginBottom: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13 },
  statsCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 32 },
  fundingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  raisedLabel: { fontSize: 14 },
  percentage: { fontSize: 16 },
  raisedAmount: { fontSize: 32, marginBottom: 16 },
  targetAmount: { fontSize: 16 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, marginBottom: 16 },
  beneficiaryCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, gap: 16 },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  beneficiaryName: { fontSize: 16, marginBottom: 2 },
  anonymousLabel: { fontSize: 13 },
  description: { fontSize: 16, lineHeight: 26 },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  organizerInfo: {
    flex: 1,
  },
  msgBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
  },
  ownerName: {
    fontSize: 15,
    marginBottom: 2,
  },
  grid: { flexDirection: 'row', paddingVertical: 20, marginBottom: 16 },
  gridItem: { flex: 1, alignItems: 'center', gap: 6 },
  gridLabel: { fontSize: 13 },
  gridValue: { fontSize: 15 },
  footer: { padding: 20, borderTopWidth: 1 },
  donateBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  donateBtnText: { fontSize: 18 },
  statusBanner: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  statusBannerText: { fontSize: 16 },
});
