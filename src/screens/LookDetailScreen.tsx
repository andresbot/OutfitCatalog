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
import { LookDao } from '../core/database/daos/LookDao';
import { LookItemDao } from '../core/database/daos/LookItemDao';
import { getDatabase } from '../core/database/database';
import { GarmentRow, LookItemRow, LookRow } from '../core/database/types';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LookDetail'>;

type GarmentItem = {
  lookItemId: string;
  garment: GarmentRow;
  position: number;
};

export function LookDetailScreen({ navigation, route }: Props) {
  const { lookId } = route.params;
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
    const lookRow = await lookDao.getById(lookId);
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
  }, [lookDao, lookItemDao, garmentDao, lookId, navigation]);

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
  }, [look, name, description, garmentItems, lookDao, lookItemDao, lookId, navigation]);

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
            <Image source={{ uri: item.garment.imageUrl }} style={styles.garmentImage} />
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
  removeButton: {
    marginRight: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
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
