import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  PlusCircle,
  ShieldCheck,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  XCircle,
  RefreshCw,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../hooks/useTheme';
import { EventLog } from '../types/events';

interface TimelineEvent {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  color: string;
}

function getEventDisplay(event: EventLog, colors: any): TimelineEvent {
  const { action, metadata, actor } = event;
  const actorName = actor?.name || 'CharityTrust';
  const isAdmin = actor?.role === 'admin';

  switch (action) {
    case 'CASE_CREATED':
      return {
        icon: <PlusCircle color={colors.primary} size={18} />,
        label: 'Case Created',
        sublabel: `Submitted by ${actorName}`,
        color: colors.primary,
      };

    case 'CASE_STATUS_CHANGED': {
      const to = metadata?.new_status;
      if (to === 'PENDING_REVIEW') return {
        icon: <RefreshCw color={colors.mutedForeground} size={18} />,
        label: 'Submitted for Review',
        sublabel: `Waiting for admin verification`,
        color: colors.mutedForeground,
      };
      if (to === 'ACTIVE_FUNDING' || to === 'VERIFIED') return {
        icon: <ShieldCheck color={colors.primary} size={18} />,
        label: 'Verified by CharityTrust',
        sublabel: `Approved by ${actorName}`,
        color: colors.primary,
      };
      if (to === 'FUNDED') return {
        icon: <CheckCircle2 color="#22c55e" size={18} />,
        label: '🎉 Fully Funded!',
        sublabel: 'The target goal has been reached',
        color: '#22c55e',
      };
      if (to === 'COMPLETED') return {
        icon: <CheckCircle2 color="#22c55e" size={18} />,
        label: '✅ Case Completed',
        sublabel: 'Funds disbursed and verified',
        color: '#22c55e',
      };
      if (to === 'REJECTED') return {
        icon: <XCircle color={colors.destructive} size={18} />,
        label: 'Case Rejected',
        sublabel: metadata?.reason || 'Did not meet verification criteria',
        color: colors.destructive,
      };
      return {
        icon: <FileText color={colors.mutedForeground} size={18} />,
        label: `Status: ${to}`,
        color: colors.mutedForeground,
      };
    }

    case 'CONTRIBUTION_STATUS_CHANGED': {
      const to = metadata?.new_status;
      const amount = metadata?.amount;
      if (to === 'VERIFIED') return {
        icon: <DollarSign color="#22c55e" size={18} />,
        label: `$${amount?.toLocaleString() || '??'} Donation Confirmed`,
        sublabel: `Verified by ${actorName}`,
        color: '#22c55e',
      };
      if (to === 'REJECTED') return {
        icon: <AlertCircle color={colors.destructive} size={18} />,
        label: 'Donation Proof Rejected',
        sublabel: 'Payment could not be verified',
        color: colors.destructive,
      };
      return {
        icon: <DollarSign color={colors.mutedForeground} size={18} />,
        label: `Contribution: ${to}`,
        color: colors.mutedForeground,
      };
    }

    default:
      return {
        icon: <FileText color={colors.mutedForeground} size={18} />,
        label: action.replace(/_/g, ' '),
        color: colors.mutedForeground,
      };
  }
}

export default function CaseTimeline({ events }: { events: EventLog[] }) {
  const { colors, typography } = useTheme();

  if (events.length === 0) {
    return (
      <Text style={[styles.empty, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
        No timeline events yet.
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      {events.map((event, index) => {
        const { icon, label, sublabel, color } = getEventDisplay(event, colors);
        const isLast = index === events.length - 1;

        return (
          <View key={event.id} style={styles.row}>
            {/* Vertical Line + Dot */}
            <View style={styles.track}>
              <View style={[styles.dot, { backgroundColor: color, borderColor: colors.background }]} />
              {!isLast && <View style={[styles.line, { backgroundColor: colors.border }]} />}
            </View>

            {/* Event Content */}
            <View style={[styles.content, !isLast && styles.contentSpaced]}>
              <View style={styles.labelRow}>
                {icon}
                <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
                  {label}
                </Text>
              </View>
              {sublabel && (
                <Text style={[styles.sublabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
                  {sublabel}
                </Text>
              )}
              <Text style={[styles.time, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
                {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 8 },
  empty: { fontSize: 14, fontStyle: 'italic' },
  row: { flexDirection: 'row' },
  track: { width: 28, alignItems: 'center' },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    zIndex: 1,
    marginTop: 2,
  },
  line: { width: 2, flex: 1, marginTop: 2 },
  content: { flex: 1, paddingLeft: 12, paddingBottom: 4 },
  contentSpaced: { paddingBottom: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  label: { fontSize: 15, flexShrink: 1 },
  sublabel: { fontSize: 13, marginTop: 3, lineHeight: 18 },
  time: { fontSize: 12, marginTop: 4 },
});
