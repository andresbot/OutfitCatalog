import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CachedImage } from '../components/CachedImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { getDatabase } from '../core/database/database';
import { GarmentRow } from '../core/database/types';
import { DI_TOKENS } from '../core/di/injectionContainer';
import { getIt } from '../core/di/getIt';
import { CreateLookUseCase } from '../features/look/domain/usecases/CreateLookUseCase';
import { colors, radius, shadows, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateLookPreview'>;

export function CreateLookPreviewScreen({ navigation, route }: Props) {
  const { garmentIds } = route.params;
  const auth = useAuth();
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);
  const createLookUseCase = useMemo(
    () => getIt.get<CreateLookUseCase>(DI_TOKENS.createLookUseCase),
    [],
  );

  const [garments, setGarments] = useState<GarmentRow[]>([]);
  const [loadingGarments, setLoadingGarments] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadGarments = useCallback(async () => {
    setLoadingGarments(true);
    const results = await Promise.all(garmentIds.map((id) => garmentDao.getById(id)));
    setGarments(results.filter((g): g is GarmentRow => g !== null));
    setLoadingGarments(false);
  }, [garmentDao, garmentIds]);

  useFocusEffect(
    useCallback(() => {
      loadGarments();
    }, [loadGarments]),
  );

  const handleSave = useCallback(async () => {
    const userId = auth.user?.id;
    if (!userId) {
      setError('Debes iniciar sesion para guardar el look.');
      return;
    }

    if (!garmentIds.length) {
      setError('El look debe tener al menos una prenda.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const coverImageUrl = garments[0]?.imageUrl ?? null;
      await createLookUseCase.execute({ userId, name, description, garmentIds, coverImageUrl });
      navigation.navigate('Looks');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar el look.');
      setSaving(false);
    }
  }, [auth.user?.id, createLookUseCase, description, garmentIds, name, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Volver</Text>
        </Pressable>
        <Text style={styles.brand}>ATELIER</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={garments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Vista previa del look</Text>
            <Text style={styles.subtitle}>
              {garments.length} prenda{garments.length !== 1 ? 's' : ''} seleccionada{garments.length !== 1 ? 's' : ''}
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nombre del look (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Look casual verano"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                maxLength={60}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Descripcion (opcional)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Describe este look..."
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            <Text style={styles.sectionTitle}>Prendas del look</Text>
          </View>
        }
        ListEmptyComponent={
          loadingGarments ? (
            <ActivityIndicator color={colors.secondary} style={styles.loader} />
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.garmentRow}>
            <CachedImage uri={item.imageUrl} style={styles.garmentImage} />
            <View style={styles.garmentInfo}>
              <Text style={styles.garmentCategory}>{item.category}</Text>
              <Text style={styles.garmentName}>{item.name}</Text>
              <Text style={styles.garmentSize}>{item.size} · {item.color}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Pressable
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar look</Text>
              )}
            </Pressable>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 50,
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 5,
  },
  backLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.primary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputMultiline: {
    height: 88,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  loader: {
    marginTop: spacing.lg,
  },
  garmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.card,
  },
  garmentImage: {
    width: 88,
    height: 88,
  },
  garmentInfo: {
    flex: 1,
    paddingHorizontal: spacing.md,
    gap: 3,
  },
  garmentCategory: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  garmentName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  garmentSize: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  footer: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
  },
  saveButton: {
    height: 52,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.gold,
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#0C0C0E',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
