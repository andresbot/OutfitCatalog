import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { getDatabase } from '../core/database/database';
import { GarmentRow } from '../core/database/types';
import { DI_TOKENS } from '../core/di/injectionContainer';
import { getIt } from '../core/di/getIt';
import { CreateLookUseCase } from '../features/look/domain/usecases/CreateLookUseCase';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateLookPreview'>;

export function CreateLookPreviewScreen({ navigation, route }: Props) {
  const { garmentIds } = route.params;
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
    if (!garmentIds.length) {
      setError('El look debe tener al menos una prenda.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await createLookUseCase.execute({ name, description, garmentIds });
      navigation.navigate('Looks');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar el look.');
      setSaving(false);
    }
  }, [createLookUseCase, description, garmentIds, name, navigation]);

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
            <Image source={{ uri: item.imageUrl }} style={styles.garmentImage} />
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
    width: 40,
  },
  brand: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  backLink: {
    color: colors.secondary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  loader: {
    marginTop: spacing.lg,
  },
  garmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  garmentImage: {
    width: 80,
    height: 80,
  },
  garmentInfo: {
    flex: 1,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  garmentCategory: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  garmentName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
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
  },
  saveButton: {
    height: 50,
    borderRadius: radius.round,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
