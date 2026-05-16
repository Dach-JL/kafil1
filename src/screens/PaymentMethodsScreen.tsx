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
import { palette } from '../theme/colors';
import { useAuth } from '../supabase/AuthContext';
import { getUserPaymentMethods, deletePaymentMethod, UserPaymentMethod, setDefaultPaymentMethod } from '../api/paymentMethods';
import { Plus, CreditCard, Trash2, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <AppCard style={[styles.card, item.is_default && { borderColor: colors.accent + '40', borderWidth: 1.5 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.bankInfo}>
          <View style={[styles.iconBg, { backgroundColor: palette.navy }]}>
            <CreditCard color={colors.accent} size={22} />
          </View>
          <View>
            <Text style={[styles.bankName, { color: colors.textInverse, fontFamily: typography.fontFamily.bold }]}>
              {t(`banks.${item.bank_name.toLowerCase()}`, { defaultValue: item.bank_name })}
            </Text>
            {item.is_default && (
              <View style={styles.defaultBadge}>
                <CheckCircle2 color={colors.accent} size={14} />
                <Text style={[styles.defaultText, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
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

      <View style={[styles.divider, { backgroundColor: palette.navy }]} />

      <View style={styles.detailsRow}>
        <View style={{ flex: 1.2 }}>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
            {t('createCase.accountNumber')}
          </Text>
          <Text style={[styles.value, { color: colors.textInverse, fontFamily: typography.fontFamily.bold }]}>
            {item.account_number}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
            {t('createCase.accountName')}
          </Text>
          <Text style={[styles.value, { color: colors.textInverse, fontFamily: typography.fontFamily.bold }]} numberOfLines={1}>
            {item.account_name}
          </Text>
        </View>
      </View>


      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn} activeOpacity={0.7}>
        <Trash2 color={colors.error} size={20} opacity={0.6} />
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
            <View style={[styles.emptyIconWrap, { backgroundColor: palette.navyLight }]}>
              <CreditCard color={colors.accent} size={48} opacity={0.3} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
              {t('profile.noPaymentMethods', { defaultValue: 'No Payment Methods' })}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textInverse, opacity: 0.8, fontFamily: typography.fontFamily.regular }]}>
              {t('profile.noPaymentMethodsDesc', { defaultValue: 'Save your bank details for faster case creation and payouts.' })}
            </Text>

          </View>
        }
      />

      <View style={styles.footer}>
        <AppButton
          title={t('buttons.addNewMethod', { defaultValue: 'Add New Method' })}
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
  list: { padding: 20, paddingBottom: 120 },
  card: {
    marginBottom: 20,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bankInfo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBg: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bankName: { fontSize: 18 },
  defaultBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  defaultText: { fontSize: 11, letterSpacing: 1 },
  setDefaultBtn: { padding: 8 },
  setDefaultText: { fontSize: 11, letterSpacing: 1 },
  divider: { height: 1, marginBottom: 20, opacity: 0.5 },
  detailsRow: { flexDirection: 'row', gap: 24 },
  label: { fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  value: { fontSize: 16 },
  deleteBtn: { position: 'absolute', bottom: 20, right: 20, padding: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 80, gap: 16 },
  emptyIconWrap: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 22, textAlign: 'center' },
  emptyDesc: { fontSize: 15, textAlign: 'center', lineHeight: 24 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 40 },
  addBtn: {
    height: 60,
    borderRadius: 30,
  },
});


