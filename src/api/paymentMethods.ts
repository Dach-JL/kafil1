import { supabase } from '../supabase/supabaseClient';

export interface UserPaymentMethod {
  id: string;
  user_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_default: boolean;
  created_at: string;
}

export async function getUserPaymentMethods(userId: string): Promise<UserPaymentMethod[]> {
  const { data, error } = await supabase
    .from('user_payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addPaymentMethod(data: Omit<UserPaymentMethod, 'id' | 'created_at'>) {
  // If this is the first method, make it default
  const existing = await getUserPaymentMethods(data.user_id);
  const isFirst = existing.length === 0;

  const { error } = await supabase
    .from('user_payment_methods')
    .insert([{ ...data, is_default: data.is_default || isFirst }]);

  if (error) throw error;
}

export async function deletePaymentMethod(id: string) {
  const { error } = await supabase
    .from('user_payment_methods')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function setDefaultPaymentMethod(userId: string, id: string) {
  // 1. Unset all defaults for this user
  const { error: unsetError } = await supabase
    .from('user_payment_methods')
    .update({ is_default: false })
    .eq('user_id', userId);

  if (unsetError) throw unsetError;

  // 2. Set the target as default
  const { error: setError } = await supabase
    .from('user_payment_methods')
    .update({ is_default: true })
    .eq('id', id);

  if (setError) throw setError;
}
