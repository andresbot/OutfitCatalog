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
import { LookDao } from '../core/database/daos/LookDao';
import { LookItemDao } from '../core/database/daos/LookItemDao';
import { getDatabase } from '../core/database/database';
import { GarmentRow, LookItemRow, LookRow } from '../core/database/types';
import { colors, radius, shadows, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LookDetail'>;

type GarmentItem = {
  lookItemId: string;
  garment: GarmentRow;
  position: number;
};

export function LookDetailScreen({ navigation, route }: Props) {
  const { lookId } = route.params;
  const auth = useAuth();
  const lookDao = useMemo(() => new LookDao(getDatabase), []);
  const lookItemDao = useMemo(() => new LookItemDao(getDatabase), []);
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);

  const [look, setLook] = useState<LookRow | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [garmentItems, setGarmentItems] = useState<GarmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const userId = auth.user?.id;
    const lookRow =
      auth.user?.role === 'admin'
        ? await lookDao.getById(lookId)
        : userId
          ? await lookDao.getByIdForUser(lookId, userId)
          : null;

    if (!lookRow) {
      navigation.goBack();
      return;
    }
    setLook(lookRow);
    setName(lookRow.name);
    setDescription(lookRow.description);

    const items = await lookItemDao.listByLookId(lookId);
    const resolved = await Promise.all(
      items.map(async (item) => {
        const garment = await garmentDao.getById(item.garmentId);
        return garment
          ? { lookItemId: item.id, garment, position: item.position }
          : null;
      }),
    );
    setGarmentItems(resolved.filter((g): g is GarmentItem => g !== null));
    setLoading(false);
  }, [auth.user?.id, auth.user?.role, lookDao, lookItemDao, garmentDao, lookId, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const removeGarment = useCallback((lookItemId: string) => {
    setGarmentItems((prev) => {
      if (prev.length <= 1) {
        setError('El look debe tener al menos una prenda.');
        return prev;
      }
      setError('');
      return prev.filter((g) => g.lookItemId !== lookItemId);
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!look) return;
    const userId = auth.user?.id;
    const canEdit = auth.user?.role === 'admin' || look.userId === userId;
    if (!canEdit) {
      setError('No puedes editar un look de otro usuario.');
      return;
    }

    if (garmentItems.length === 0) {
      setError('El look debe tener al menos una prenda.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await lookDao.update({
        ...look,
        name: name.trim() || look.name,
        description: description.trim(),
        updatedAt: new Date().toISOString(),
      });

      const newItems: LookItemRow[] = garmentItems.map((g, i) => ({
        id: g.lookItemId,
        lookId,
        garmentId: g.garment.id,
        position: i,
      }));
      await lookItemDao.replaceForLook(lookId, newItems);

      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar.');
      setSaving(false);
    }
  }, [
    auth.user?.id,
    auth.user?.role,
    look,
    name,
    description,
    garmentItems,
    lookDao,
    lookItemDao,
    lookId,
    navigation,
  ]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ActivityIndicator style={styles.loader} color={colors.secondary} />
      </SafeAreaView>
    );
  }

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
        data={garmentItems}
        keyExtractor={(item) => item.lookItemId}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Editar look</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                maxLength={60}
                placeholderTextColor={colors.textMuted}
                placeholder="Nombre del look"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
                placeholderTextColor={colors.textMuted}
                placeholder="Describe este look..."
              />
            </View>

            <Text style={styles.sectionTitle}>
              Prendas ({garmentItems.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.garmentRow}>
            <CachedImage uri={item.garment.imageUrl} style={styles.garmentImage} />
            <View style={styles.garmentInfo}>
              <Text style={styles.garmentCategory}>{item.garment.category}</Text>
              <Text style={styles.garmentName}>{item.garment.name}</Text>
              <Text style={styles.garmentSize}>
                {item.garment.size} · {item.garment.color}
              </Text>
            </View>
            <Pressable
              style={styles.removeButton}
              onPress={() => removeGarment(item.lookItemId)}
            >
              <Text style={styles.removeButtonText}>Quitar</Text>
            </Pressable>
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
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
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
  loader: {
    flex: 1,
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
    marginBottom: spacing.md,
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputMultiline: {
    height: 90,
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
  removeButton: {
    marginRight: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: colors.error,
  },
  removeButtonText: {
    color: colors.error,
    fontWeight: '700',
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
