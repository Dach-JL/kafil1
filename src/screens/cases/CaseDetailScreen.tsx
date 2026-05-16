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
import { palette } from '../../theme/colors';
import { getCaseById } from '../../api/cases';
import { getCaseTimeline } from '../../api/events';
import { Case } from '../../types/cases';
import { useTranslation } from 'react-i18next';
import { EventLog} from '../../types/events';
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
      alert(t('errors.failedRequest'));
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
      <View style={[styles.header, { borderBottomColor: palette.navyLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={colors.accent} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
          {t('caseDetail.title', { defaultValue: 'Case Details' })}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Verification Banner */}
        {isVerified && (
          <View style={[styles.verifiedBanner, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]}>
            <ShieldCheck color={colors.accent} size={20} />
            <Text style={[styles.verifiedText, { color: colors.accent, fontFamily: typography.fontFamily.medium }]}>
              {t('landing.verified')}
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

        <View style={[styles.categoryBadge, { backgroundColor: palette.navyLight }]}>
          <Text style={[styles.categoryText, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
            {t(`categories.${caseInfo.category}`)}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.textInverse, fontFamily: typography.fontFamily.heading }]}>
          {caseInfo.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock color={colors.textInverse} opacity={0.6} size={14} />
            <Text style={[styles.metaText, { color: colors.textInverse, opacity: 0.6, fontFamily: typography.fontFamily.regular }]}>
              {t('common.postedDate', { date: formatDistanceToNow(new Date(caseInfo.created_at), { addSuffix: true }), defaultValue: `Posted ${formatDistanceToNow(new Date(caseInfo.created_at), { addSuffix: true })}` })}
            </Text>
          </View>
        </View>

        {/* Funding Stats Card */}
        <AppCard style={styles.statsCard}>
          <View style={styles.fundingHeader}>
            <Text style={[styles.raisedLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {t('caseDetail.fundingProgress')}
            </Text>
            <Text style={[styles.percentage, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
              {Math.round(progress)}%
            </Text>
          </View>

          <Text style={[styles.raisedAmount, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
            ${caseInfo.collected_amount.toLocaleString()}
            <Text style={[styles.targetAmount, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {' '}{t('common.of')} ${caseInfo.target_amount.toLocaleString()}
            </Text>
          </Text>

          <View style={[styles.progressTrack, { backgroundColor: colors.background + '10' }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.accent, width: `${progress}%` }]} />
          </View>
        </AppCard>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
            {t('caseDetail.description')}
          </Text>
          <Text style={[styles.description, { color: colors.textInverse, opacity: 0.8, fontFamily: typography.fontFamily.regular }]}>
            {caseInfo.description}
          </Text>
        </View>

        {/* Organizer Section */}
        {caseInfo.owner_id && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
              {t('caseDetail.organizer')}
            </Text>
            <View style={[styles.organizerCard, { borderColor: palette.navyLight, backgroundColor: palette.navyLight }]}>
              <View style={[styles.ownerAvatar, { backgroundColor: colors.accent + '15' }]}>
                <User color={colors.accent} size={22} />
              </View>
              <View style={styles.organizerInfo}>
                <Text style={[styles.ownerName, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
                  {caseInfo.owner?.name || t('caseDetail.organizer')}
                </Text>
                {caseInfo.owner && <TrustBadge score={caseInfo.owner.trust_score} />}
              </View>
              {user?.id !== caseInfo.owner_id && (
                <TouchableOpacity 
                  style={[styles.msgBtn, { backgroundColor: colors.background, borderColor: colors.accent }]}
                  onPress={handleMessageOrganizer}
                  disabled={initiatingChat}
                >
                  {initiatingChat ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <MessageSquare color={colors.accent} size={18} />
                      <Text style={{ color: colors.accent, fontFamily: typography.fontFamily.medium, fontSize: 13 }}>
                        {t('common.message', { defaultValue: 'Message' })}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
            {t('caseDetail.timeline')}
          </Text>
          <CaseTimeline events={events} />
        </View>

        {/* Contributions (For Owners) */}
        {user?.id === caseInfo.owner_id && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.accent, fontFamily: typography.fontFamily.heading }]}>
              {t('caseDetail.recentContributions', { defaultValue: 'Recent Contributions' })}
            </Text>
            <CaseContributionList caseId={caseId} />
          </View>
        )}

        {/* Meta Details Grid */}
        <View style={[styles.grid, { borderColor: palette.navyLight, borderTopWidth: 1, borderBottomWidth: 1 }]}>
          <View style={[styles.gridItem, { borderRightWidth: 1, borderColor: palette.navyLight }]}>
            <Target color={colors.accent} size={22} />
            <Text style={[styles.gridLabel, { color: colors.textInverse, opacity: 0.6, fontFamily: typography.fontFamily.regular }]}>{t('common.urgency', { defaultValue: 'Urgency' })}</Text>
            <Text style={[styles.gridValue, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
              {t('caseDetail.urgencyLevel', { level: caseInfo.urgency_level, defaultValue: `Level ${caseInfo.urgency_level}/5` })}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Clock color={colors.accent} size={22} />
            <Text style={[styles.gridLabel, { color: colors.textInverse, opacity: 0.6, fontFamily: typography.fontFamily.regular }]}>{t('common.deadline', { defaultValue: 'Deadline' })}</Text>
            <Text style={[styles.gridValue, { color: colors.textInverse, fontFamily: typography.fontFamily.medium }]}>
              {caseInfo.deadline ? format(new Date(caseInfo.deadline), 'MMM dd, yyyy') : t('common.none', { defaultValue: 'None' })}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      {(caseInfo.status === 'VERIFIED' || caseInfo.status === 'ACTIVE_FUNDING') && (
        <View style={[styles.footer, { borderTopColor: palette.navyLight, backgroundColor: colors.background }]}>
          <AppButton
            title={t('donation.fundCase')}
            onPress={() => navigation.navigate('FundCase', { caseId })}
          />
        </View>
      )}

      {/* Owner Action: Submit Completion Proof */}
      {caseInfo.status === 'FUNDED' && user?.id === caseInfo.owner_id && !caseInfo.completion_proof_url && (
        <View style={[styles.footer, { borderTopColor: palette.navyLight, backgroundColor: colors.background }]}>
          <AppButton
            title={t('caseDetail.submitImpactReport')}
            onPress={() => navigation.navigate('SubmitCompletionProof', { caseId })}
          />
        </View>
      )}

      {/* Goal Met Celebration */}
      {caseInfo.status === 'FUNDED' && (user?.id !== caseInfo.owner_id || caseInfo.completion_proof_url) && (
        <View style={[styles.footer, { borderTopColor: palette.navyLight, backgroundColor: colors.background }]}>
          <View style={[styles.statusBanner, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '40', borderWidth: 1 }]}>
            <Heart color={colors.accent} size={20} fill={colors.accent} />
            <Text style={[styles.statusBannerText, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
              {t('caseDetail.goalMet', { defaultValue: 'Goal Met! Thanks for your help 💝' })}
            </Text>
          </View>
        </View>
      )}

      {/* Completed Banner */}
      {caseInfo.status === 'COMPLETED' && (
        <View style={[styles.footer, { borderTopColor: palette.navyLight, backgroundColor: colors.background }]}>
          <View style={[styles.statusBanner, { backgroundColor: colors.accent + '20' }]}>
            <CheckCircle2 color={colors.accent} size={20} />
            <Text style={[styles.statusBannerText, { color: colors.accent, fontFamily: typography.fontFamily.medium }]}>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18 },
  scroll: { padding: 20, paddingBottom: 40 },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
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
  title: { fontSize: 28, lineHeight: 36, letterSpacing: -0.5, marginBottom: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13 },
  statsCard: { marginBottom: 32 },
  fundingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  raisedLabel: { fontSize: 14 },
  percentage: { fontSize: 16 },
  raisedAmount: { fontSize: 36, marginBottom: 16 },
  targetAmount: { fontSize: 18 },
  progressTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, marginBottom: 16 },
  description: { fontSize: 16, lineHeight: 28 },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  organizerInfo: {
    flex: 1,
  },
  msgBtn: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1.5,
  },
  ownerName: {
    fontSize: 16,
    marginBottom: 2,
  },
  grid: { flexDirection: 'row', paddingVertical: 24, marginBottom: 16 },
  gridItem: { flex: 1, alignItems: 'center', gap: 8 },
  gridLabel: { fontSize: 13 },
  gridValue: { fontSize: 15 },
  footer: { padding: 20, borderTopWidth: 1 },
  statusBanner: {
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  statusBannerText: { fontSize: 16 },
});


