import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { getCaseById } from '../../api/cases';
import { getCaseTimeline } from '../../api/events';
import { Case } from '../../types/cases';
import { useTranslation } from 'react-i18next';
import { EventLog } from '../../types/events';
import { ArrowLeft, ShieldCheck, Clock, User, Target, CheckCircle2, MessageSquare, Heart } from 'lucide-react-native';
import { getOrCreateChatRoom } from '../../api/chat';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '../../supabase/AuthContext';
import CaseTimeline from '../../components/CaseTimeline';
import CaseContributionList from '../../components/CaseContributionList';
import TrustBadge from '../../components/TrustBadge';
import OutcomeShowcase from '../../components/OutcomeShowcase';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';

export default function CaseDetailScreen({ route, navigation }: any) {
  const { caseId } = route.params;
  const { colors, typography, spacing } = useTheme();
  const { t } = useTranslation();
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
        recipientName: caseInfo.owner?.name || t('caseDetail.organizer', { defaultValue: 'Organizer' }) 
      });
    } catch (err: any) {
      console.error(err);
      alert(t('errors.failedRequest', { defaultValue: 'Failed to open chat room' }));
    } finally {
      setInitiatingChat(false);
    }
  };

  if (loading || !caseInfo) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  const progress = Math.min((caseInfo.collected_amount / caseInfo.target_amount) * 100, 100);
  const isVerified = caseInfo.status === 'VERIFIED' || caseInfo.status === 'ACTIVE_FUNDING' || caseInfo.status === 'FUNDED' || caseInfo.status === 'COMPLETED';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={colors.accent} size={22} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
          {t('caseDetail.title', { defaultValue: 'Case Details' })}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Verification Banner */}
        {isVerified && (
          <View style={[styles.verifiedBanner, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}>
            <ShieldCheck color={colors.accent} size={18} />
            <Text style={[styles.verifiedText, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
              {t('landing.verified', { defaultValue: 'Verified Case · Audited Evidence' })}
            </Text>
          </View>
        )}

        {/* Impact Showcase */}
        {caseInfo.status === 'COMPLETED' && (
          <OutcomeShowcase 
            description={caseInfo.completion_description || ''} 
            images={caseInfo.completion_images || []} 
            outcomeDate={caseInfo.outcome_date}
            isApproved={caseInfo.impact_report_status === 'APPROVED'}
          />
        )}

        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.categoryText, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
            {t(`categories.${caseInfo.category}`, { defaultValue: caseInfo.category })}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
          {caseInfo.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock color={colors.textSecondary} size={13} />
            <Text style={[styles.metaText, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {t('common.postedDate', { date: formatDistanceToNow(new Date(caseInfo.created_at), { addSuffix: true }), defaultValue: `Posted ${formatDistanceToNow(new Date(caseInfo.created_at), { addSuffix: true })}` })}
            </Text>
          </View>
        </View>

        {/* Funding Stats Card */}
        <AppCard style={styles.statsCard}>
          <View style={styles.fundingHeader}>
            <Text style={[styles.raisedLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {t('caseDetail.fundingProgress', { defaultValue: 'Funding Progress' })}
            </Text>
            <Text style={[styles.percentage, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
              {Math.round(progress)}%
            </Text>
          </View>

          <Text style={[styles.raisedAmount, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
            ${caseInfo.collected_amount.toLocaleString()}
            <Text style={[styles.targetAmount, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {' '}{t('common.of', { defaultValue: 'of' })} ${caseInfo.target_amount.toLocaleString()}
            </Text>
          </Text>

          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.accent, width: `${progress}%` }]} />
          </View>
        </AppCard>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
            {t('caseDetail.description', { defaultValue: 'Story & Situation' })}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            {caseInfo.description}
          </Text>
        </View>

        {/* Organizer Section */}
        {caseInfo.owner_id && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
              {t('caseDetail.organizer', { defaultValue: 'Case Owner' })}
            </Text>
            <AppCard style={styles.organizerCard}>
              <View style={[styles.ownerAvatar, { backgroundColor: colors.accent + '15' }]}>
                <User color={colors.accent} size={22} />
              </View>
              <View style={styles.organizerInfo}>
                <Text style={[styles.ownerName, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
                  {caseInfo.owner?.name || t('caseDetail.organizer', { defaultValue: 'Case Owner' })}
                </Text>
                {caseInfo.owner && <TrustBadge score={caseInfo.owner.trust_score} />}
              </View>
              {user?.id !== caseInfo.owner_id && (
                <TouchableOpacity 
                  style={[styles.msgBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={handleMessageOrganizer}
                  disabled={initiatingChat}
                  activeOpacity={0.8}
                >
                  {initiatingChat ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : (
                    <View style={styles.msgBtnContent}>
                      <MessageSquare color={colors.accent} size={16} />
                      <Text style={[styles.msgBtnText, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
                        {t('common.message', { defaultValue: 'Message' })}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </AppCard>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
            {t('caseDetail.timeline', { defaultValue: 'Verification & Event Audit' })}
          </Text>
          <CaseTimeline events={events} />
        </View>

        {/* Contributions (For Owners) */}
        {user?.id === caseInfo.owner_id && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
              {t('caseDetail.recentContributions', { defaultValue: 'Recent Contributions' })}
            </Text>
            <CaseContributionList caseId={caseId} />
          </View>
        )}

        {/* Meta Details Grid */}
        <View style={[styles.grid, { borderColor: colors.border, borderTopWidth: 1, borderBottomWidth: 1 }]}>
          <View style={[styles.gridItem, { borderRightWidth: 1, borderColor: colors.border }]}>
            <Target color={colors.accent} size={20} />
            <Text style={[styles.gridLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {t('common.urgency', { defaultValue: 'Urgency' })}
            </Text>
            <Text style={[styles.gridValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
              {t('caseDetail.urgencyLevel', { level: caseInfo.urgency_level, defaultValue: `Level ${caseInfo.urgency_level}/5` })}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Clock color={colors.accent} size={20} />
            <Text style={[styles.gridLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {t('common.deadline', { defaultValue: 'Deadline' })}
            </Text>
            <Text style={[styles.gridValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.medium }]}>
              {caseInfo.deadline ? format(new Date(caseInfo.deadline), 'MMM dd, yyyy') : t('common.none', { defaultValue: 'None' })}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      {(caseInfo.status === 'VERIFIED' || caseInfo.status === 'ACTIVE_FUNDING') && (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <AppButton
            title={t('donation.fundCase', { defaultValue: 'Contribute Now' })}
            onPress={() => navigation.navigate('FundCase', { caseId })}
          />
        </View>
      )}

      {/* Owner Action: Submit Completion Proof */}
      {caseInfo.status === 'FUNDED' && user?.id === caseInfo.owner_id && !caseInfo.completion_proof_url && (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <AppButton
            title={t('caseDetail.submitImpactReport', { defaultValue: 'Submit Impact Report & Proof' })}
            onPress={() => navigation.navigate('SubmitCompletionProof', { caseId })}
          />
        </View>
      )}

      {/* Goal Met Celebration */}
      {caseInfo.status === 'FUNDED' && (user?.id !== caseInfo.owner_id || caseInfo.completion_proof_url) && (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={[styles.statusBanner, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30', borderWidth: 1 }]}>
            <Heart color={colors.accent} size={18} fill={colors.accent} />
            <Text style={[styles.statusBannerText, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
              {t('caseDetail.goalMet', { defaultValue: 'Goal Met! Thank you for your support 💝' })}
            </Text>
          </View>
        </View>
      )}

      {/* Completed Banner */}
      {caseInfo.status === 'COMPLETED' && (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={[styles.statusBanner, { backgroundColor: colors.success + '15', borderColor: colors.success + '30', borderWidth: 1 }]}>
            <CheckCircle2 color={colors.success} size={18} />
            <Text style={[styles.statusBannerText, { color: colors.success, fontFamily: typography.fontFamily.bold }]}>
              {t('caseDetail.caseCompleted', { defaultValue: 'Case Successfully Completed' })}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17 },
  scroll: { padding: 20, paddingBottom: 40 },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  verifiedText: { fontSize: 13 },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  categoryText: { fontSize: 12 },
  title: { fontSize: 24, lineHeight: 32, letterSpacing: -0.5, marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12 },
  statsCard: { marginBottom: 24, padding: 18 },
  fundingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  raisedLabel: { fontSize: 13 },
  percentage: { fontSize: 15 },
  raisedAmount: { fontSize: 32, marginBottom: 14 },
  targetAmount: { fontSize: 16 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 24 },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 0,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  organizerInfo: {
    flex: 1,
  },
  msgBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
  },
  msgBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  msgBtnText: {
    fontSize: 12,
  },
  ownerName: {
    fontSize: 15,
    marginBottom: 2,
  },
  grid: { flexDirection: 'row', paddingVertical: 20, marginBottom: 16 },
  gridItem: { flex: 1, alignItems: 'center', gap: 6 },
  gridLabel: { fontSize: 12 },
  gridValue: { fontSize: 14 },
  footer: { padding: 16, borderTopWidth: 1 },
  statusBanner: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  statusBannerText: { fontSize: 14 },
});
