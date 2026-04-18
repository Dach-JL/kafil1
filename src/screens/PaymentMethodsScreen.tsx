import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../supabase/AuthContext';
import { getUserPaymentMethods, deletePaymentMethod, UserPaymentMethod, setDefaultPaymentMethod } from '../api/paymentMethods';
import { Plus, CreditCard, Trash2, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentMethodsScreen({ navigation }: any) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const { profile } = useAuth();

  const [methods, setMethods] = useState<UserPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadMethods() {
    if (!profile) return;
    try {
      const data = await getUserPaymentMethods(profile.id);
      setMethods(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadMethods();
    });
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id: string) => {
    Alert.alert(
      t('profile.deletePaymentMethod', { defaultValue: 'Delete Payment Method' }),
      t('profile.deletePaymentMethodConfirm', { defaultValue: 'Are you sure you want to remove this account?' }),
      [
        { text: t('buttons.cancel'), style: 'cancel' },
        {
          text: t('buttons.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentMethod(id);
              setMethods(methods.filter((m) => m.id !== id));
            } catch (err: any) {
              Alert.alert(t('common.error'), err.message || 'Failed to delete payment method');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (id: string) => {
    if (!profile) return;
    try {
      await setDefaultPaymentMethod(profile.id, id);
      await loadMethods();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Failed to set default method');
    }
  };

  const renderItem = ({ item }: { item: UserPaymentMethod }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: item.is_default ? colors.primary : colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.bankInfo}>
          <View style={[styles.iconBg, { backgroundColor: colors.secondary }]}>
            <CreditCard color={colors.primary} size={20} />
          </View>
          <View>
            <Text style={[styles.bankName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              {t(`banks.${item.bank_name.toLowerCase()}`, { defaultValue: item.bank_name })}
            </Text>
            {item.is_default && (
              <View style={styles.defaultBadge}>
                <CheckCircle2 color={colors.accent} size={12} />
                <Text style={[styles.defaultText, { color: colors.accent, fontFamily: typography.fontFamily.medium }]}>
                  {t('common.default', { defaultValue: 'Default' })}
                </Text>
              </View>
            )}
          </View>
        </View>
        {!item.is_default && (
          <TouchableOpacity onPress={() => handleSetDefault(item.id)} style={styles.setDefaultBtn}>
            <Text style={[styles.setDefaultText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
              {t('buttons.setAsDefault', { defaultValue: 'Set Default' })}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>{t('createCase.accountNumber')}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{item.account_number}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>{t('createCase.accountName')}</Text>
          <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>{item.account_name}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
        <Trash2 color={colors.error} size={18} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <FlatList
        data={methods}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMethods(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <CreditCard color={colors.mutedForeground} size={64} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: typography.fontFamily.heading }]}>
              {t('profile.noPaymentMethods', { defaultValue: 'No payment methods' })}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.regular }]}>
              {t('profile.noPaymentMethodsDesc', { defaultValue: 'Save your bank details for faster case creation and payouts.' })}
            </Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AddPaymentMethod')}
          activeOpacity={0.85}
        >
          <Plus color={colors.primaryForeground} size={20} />
          <Text style={[styles.addBtnText, { color: colors.primaryForeground, fontFamily: typography.fontFamily.medium }]}>
            {t('buttons.addNewMethod', { defaultValue: 'Add New Method' })}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20, paddingBottom: 100 },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bankName: { fontSize: 16 },
  defaultBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  defaultText: { fontSize: 11 },
  setDefaultBtn: { padding: 4 },
  setDefaultText: { fontSize: 12 },
  divider: { height: 1, backgroundColor: '#00000008', marginBottom: 12 },
  detailsRow: { flexDirection: 'row', gap: 16 },
  label: { fontSize: 11, marginBottom: 2, textTransform: 'uppercase' },
  value: { fontSize: 14, fontWeight: '500' },
  deleteBtn: { position: 'absolute', bottom: 16, right: 16, padding: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
  emptyTitle: { fontSize: 20, marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'transparent' },
  addBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: { fontSize: 16 },
});
