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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../supabase/AuthContext';
import { getUserPaymentMethods, deletePaymentMethod, UserPaymentMethod, setDefaultPaymentMethod } from '../api/paymentMethods';
import { CreditCard, Trash2, CheckCircle2 } from 'lucide-react-native';
import AppCard from '../components/common/AppCard';
import AppButton from '../components/common/AppButton';

export default function PaymentMethodsScreen({ navigation }: any) {
  const { colors, typography, spacing } = useTheme();
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
        { text: t('buttons.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
        {
          text: t('buttons.delete', { defaultValue: 'Delete' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentMethod(id);
              setMethods(methods.filter((m) => m.id !== id));
            } catch (err: any) {
              Alert.alert(t('common.error', { defaultValue: 'Error' }), err.message || 'Failed to delete payment method');
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
      Alert.alert(t('common.error', { defaultValue: 'Error' }), err.message || 'Failed to set default method');
    }
  };

  const renderItem = ({ item }: { item: UserPaymentMethod }) => (
    <AppCard style={[styles.card, item.is_default && { borderColor: colors.accent, borderWidth: 1.5 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.bankInfo}>
          <View style={[styles.iconBg, { backgroundColor: colors.accent + '15' }]}>
            <CreditCard color={colors.accent} size={20} />
          </View>
          <View>
            <Text style={[styles.bankName, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
              {t(`banks.${item.bank_name.toLowerCase()}`, { defaultValue: item.bank_name })}
            </Text>
            {item.is_default && (
              <View style={styles.defaultBadge}>
                <CheckCircle2 color={colors.success} size={12} />
                <Text style={[styles.defaultText, { color: colors.success, fontFamily: typography.fontFamily.bold }]}>
                  {t('common.default', { defaultValue: 'DEFAULT' })}
                </Text>
              </View>
            )}
          </View>
        </View>
        {!item.is_default && (
          <TouchableOpacity onPress={() => handleSetDefault(item.id)} style={styles.setDefaultBtn}>
            <Text style={[styles.setDefaultText, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
              {t('buttons.setAsDefault', { defaultValue: 'SET DEFAULT' })}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.detailsRow}>
        <View style={{ flex: 1.2 }}>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
            {t('createCase.accountNumber', { defaultValue: 'Account Number' })}
          </Text>
          <Text style={[styles.value, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]}>
            {item.account_number}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
            {t('createCase.accountName', { defaultValue: 'Account Name' })}
          </Text>
          <Text style={[styles.value, { color: colors.textPrimary, fontFamily: typography.fontFamily.bold }]} numberOfLines={1}>
            {item.account_name}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn} activeOpacity={0.7}>
        <Trash2 color={colors.error} size={18} opacity={0.7} />
      </TouchableOpacity>
    </AppCard>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} size="large" />
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); loadMethods(); }} 
            tintColor={colors.accent} 
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <CreditCard color={colors.accent} size={40} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.heading }]}>
              {t('profile.noPaymentMethods', { defaultValue: 'No Saved Accounts' })}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {t('profile.noPaymentMethodsDesc', { defaultValue: 'Save your bank details for faster case creation and verified payouts.' })}
            </Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <AppButton
          title={t('buttons.addNewMethod', { defaultValue: 'Add New Account' })}
          onPress={() => navigation.navigate('AddPaymentMethod')}
          style={styles.addBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20, paddingBottom: 100 },
  card: {
    marginBottom: 16,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bankInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bankName: { fontSize: 16 },
  defaultBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  defaultText: { fontSize: 10, letterSpacing: 0.5 },
  setDefaultBtn: { padding: 6 },
  setDefaultText: { fontSize: 10, letterSpacing: 0.5 },
  divider: { height: 1, marginBottom: 14 },
  detailsRow: { flexDirection: 'row', gap: 16 },
  label: { fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 14 },
  deleteBtn: { position: 'absolute', bottom: 16, right: 16, padding: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, marginBottom: 6, textAlign: 'center' },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 24, backgroundColor: 'transparent' },
  addBtn: {
    height: 56,
  },
});
