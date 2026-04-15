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
import { useAuth } from '../../supabase/AuthContext';
import { Contribution } from '../../types/contributions';
import { verifyContribution, rejectContribution } from '../../api/contributions';
import { getSignedUrl } from '../../services/storageService';
import { format } from 'date-fns';
import { ShieldAlert, ArrowLeft, Image as ImageIcon, Fingerprint, ExternalLink } from 'lucide-react-native';

export default function AdminContributionDetailScreen({ route, navigation }: any) {
  const { contribution } = route.params as { contribution: Contribution };
  const { colors, typography } = useTheme();
  const { user } = useAuth();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function fetchImage() {
      try {
        const url = await getSignedUrl('proof-of-payment', contribution.payment_proof_url);
        setImageUrl(url);
      } catch (err) {
        console.error('Failed to get signed URL for payment proof', err);
      } finally {
        setLoadingImage(false);
      }
    }
    fetchImage();
  }, [contribution.payment_proof_url]);

  const handleApprove = async () => {
    if (!user) return;
    
    Alert.alert(
      'Verify Payment',
      `Are you sure you want to approve this $${contribution.amount} contribution? This will irreversibly add the funds to the target case.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify & Add Funds',
          style: 'default',
          onPress: async () => {
            setProcessing(true);
            try {
              await verifyContribution(contribution.id, user.id);
              Alert.alert('Verified! 🎉', 'The funds have been added to the case.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to verify contribution.');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    Alert.prompt(
      'Reject Contribution',
      'Please provide a reason for rejecting this payment proof:',
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
            setProcessing(true);
            try {
              await rejectContribution(contribution.id, reason);
              Alert.alert('Rejected', 'The contribution was rejected.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to reject contribution.');
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={processing}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          Review Payment
        </Text>
        <ShieldAlert color={colors.primary} size={24} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Donation Metadata */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Amount
          </Text>
          <Text style={[styles.amount, { color: colors.primary, fontFamily: typography.fontFamily.bold }]}>
            ${contribution.amount.toLocaleString()}
          </Text>

          <View style={styles.divider} />

          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Target Case
          </Text>
          <Text style={[styles.value, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            {contribution.cases?.title || 'Unknown Case'}
          </Text>

          <View style={styles.divider} />

          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Donor
          </Text>
          <Text style={[styles.value, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
            {contribution.donor?.name || 'Anonymous Guest'}
          </Text>

          <View style={styles.divider} />

          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            Submitted At
          </Text>
          <Text style={[styles.value, { color: colors.text, fontFamily: typography.fontFamily.regular }]}>
            {format(new Date(contribution.created_at), 'MMM dd, yyyy - hh:mm a')}
          </Text>
        </View>

        {/* SHA-256 Digital Fingerprint */}
        <View style={[styles.fingerprintBox, { backgroundColor: colors.secondary }]}>
          <View style={styles.fingerprintHeader}>
            <Fingerprint color={colors.text} size={18} />
            <Text style={[styles.boxTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
              SHA-256 Integrity Hash
            </Text>
          </View>
          <Text style={[styles.hashText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
            {contribution.payment_proof_hash || 'No hash provided (Legacy Upload)'}
          </Text>
        </View>

        {/* Payment Proof Image */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
          Payment Proof
        </Text>
        {loadingImage ? (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : imageUrl ? (
          <View style={[styles.imageWrapper, { borderColor: colors.border }]}>
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
            <TouchableOpacity 
              style={[styles.fullScreenBtn, { backgroundColor: colors.background + 'CC' }]}
              onPress={() => Alert.alert('Zoom Image', 'Full screen viewing available in future update.')}
            >
              <ExternalLink color={colors.text} size={20} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ImageIcon color={colors.mutedForeground} size={32} />
            <Text style={[styles.noImageText, { color: colors.mutedForeground }]}>
              Failed to load receipt image
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.btn, styles.btnReject, { borderColor: colors.destructive }]}
          onPress={handleReject}
          disabled={processing}
        >
          <Text style={[styles.btnTextReject, { color: colors.destructive, fontFamily: typography.fontFamily.medium }]}>
            Reject
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnApprove, { backgroundColor: colors.primary }]}
          onPress={handleApprove}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.btnTextApprove, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
              Verify & Add Funds
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
  card: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  label: { fontSize: 13, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  amount: { fontSize: 32 },
  value: { fontSize: 16 },
  divider: { height: 1, backgroundColor: '#00000010', marginVertical: 16 },
  fingerprintBox: { padding: 16, borderRadius: 12, marginBottom: 24 },
  fingerprintHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  boxTitle: { fontSize: 16 },
  hashText: { fontSize: 11, fontFamily: 'monospace' },
  sectionTitle: { fontSize: 18, marginBottom: 16 },
  imagePlaceholder: { height: 300, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  noImageText: { fontSize: 14 },
  imageWrapper: { height: 400, borderRadius: 12, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%' },
  fullScreenBtn: { position: 'absolute', top: 12, right: 12, padding: 8, borderRadius: 8 },
  footer: { flexDirection: 'row', padding: 20, borderTopWidth: 1, gap: 12 },
  btn: { flex: 1, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  btnReject: { backgroundColor: 'transparent' },
  btnApprove: { borderWidth: 0 },
  btnTextReject: { fontSize: 16 },
  btnTextApprove: { fontSize: 16 },
});
