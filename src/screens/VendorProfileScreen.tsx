import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { getVendorPhone, updateUserPhone } from '../auth/firebaseUsers';
import { validatePhone, cleanPhone } from '../core/utils/phoneUtils';
import { colors, radius, shadows, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'VendorProfile'>;

export function VendorProfileScreen({ navigation }: Props) {
  const auth = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPhone = useCallback(async () => {
    const uid = auth.user?.id;
    if (!uid) { setLoading(false); return; }
    const current = await getVendorPhone(uid);
    setPhone(current ?? '');
    setLoading(false);
  }, [auth.user?.id]);

  useEffect(() => { loadPhone(); }, [loadPhone]);

  const handleSave = async () => {
    const uid = auth.user?.id;
    if (!uid) return;

    const cleaned = cleanPhone(phone);
    const phoneErr = validatePhone(phone);
    if (phoneErr) { setError(phoneErr); return; }

    setSaving(true);
    setError('');
    const ok = await updateUserPhone(uid, cleaned);
    setSaving(false);

    if (ok) {
      Alert.alert('Listo', 'Número de WhatsApp actualizado correctamente.');
      navigation.goBack();
    } else {
      setError('No se pudo guardar el número. Verifica tu conexión.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Cancelar</Text>
          </Pressable>
          <Text style={styles.brand}>MI PERFIL</Text>
          <View style={{ width: 60 }} />
        </View>

        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} color={colors.secondary} />
        ) : (
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>VENDEDOR</Text>
              <Text style={styles.infoName}>{auth.user?.name ?? '—'}</Text>
              <Text style={styles.infoEmail}>{auth.user?.email ?? '—'}</Text>
            </View>

            <Text style={styles.sectionTitle}>NÚMERO DE WHATSAPP</Text>
            <Text style={styles.hint}>
              Los clientes usarán este número para contactarte directamente cuando estén
              interesados en tus prendas.
            </Text>

            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={(v) => { setPhone(v); setError(''); }}
              placeholder="+57 300 123 4567"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              autoCorrect={false}
            />
            <Text style={styles.inputHint}>
              Incluye el código de país. Ej: +57 para Colombia.
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#0C0C0E" />
              ) : (
                <Text style={styles.saveBtnText}>Guardar número</Text>
              )}
            </Pressable>

            {phone ? (
              <Pressable
                style={styles.clearBtn}
                onPress={() => {
                  Alert.alert(
                    'Quitar número',
                    '¿Deseas eliminar tu número de WhatsApp del perfil?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Quitar',
                        style: 'destructive',
                        onPress: async () => {
                          setSaving(true);
                          await updateUserPhone(auth.user!.id, '');
                          setSaving(false);
                          setPhone('');
                          Alert.alert('Listo', 'Número eliminado.');
                        },
                      },
                    ],
                  );
                }}
              >
                <Text style={styles.clearBtnText}>Quitar número</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  brand: { fontSize: 15, fontWeight: '800', letterSpacing: 3, color: colors.textPrimary },
  backLink: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  container: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  infoCard: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.card,
  },
  infoLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  infoName: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  infoEmail: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
  },
  inputHint: { color: colors.textMuted, fontSize: 11 },
  error: { color: colors.error, fontSize: 12, textAlign: 'center' },
  saveBtn: {
    height: 52,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    ...shadows.gold,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#0C0C0E', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  clearBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.round,
    borderWidth: 0.5,
    borderColor: colors.error,
  },
  clearBtnText: { color: colors.error, fontWeight: '700', fontSize: 13 },
});
