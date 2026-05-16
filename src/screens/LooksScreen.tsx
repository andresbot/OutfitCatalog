import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { LookDao } from '../core/database/daos/LookDao';
import { LookItemDao } from '../core/database/daos/LookItemDao';
import { getDatabase } from '../core/database/database';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Looks'>;

type LookCard = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  coverImages: string[];
};

export function LooksScreen({ navigation }: Props) {
  const lookDao = useMemo(() => new LookDao(getDatabase), []);
  const lookItemDao = useMemo(() => new LookItemDao(getDatabase), []);
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);

  const [looks, setLooks] = useState<LookCard[]>([]);

  const loadLooks = useCallback(async () => {
    const rows = await lookDao.list();
    const cards = await Promise.all(
      rows.map(async (look) => {
        const items = await lookItemDao.listByLookId(look.id);
        const garmentResults = await Promise.all(
          items.slice(0, 4).map((item) => garmentDao.getById(item.garmentId)),
        );
        const coverImages = garmentResults
          .filter((g): g is NonNullable<typeof g> => g !== null)
          .map((g) => g.imageUrl);

        return {
          id: look.id,
          name: look.name,
          description: look.description,
          itemCount: items.length,
          coverImages,
        };
      }),
    );
    setLooks(cards);
  }, [lookDao, lookItemDao, garmentDao]);

  const deleteLook = useCallback(
    async (lookId: string) => {
      await lookDao.delete(lookId);
      await loadLooks();
    },
    [lookDao, loadLooks],
  );

  useFocusEffect(
    useCallback(() => {
      loadLooks();
    }, [loadLooks]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>ATELIER</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Volver</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Colecciones (Looks)</Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('GarmentGallery', { selectionMode: true })}
        >
          <Text style={styles.primaryButtonText}>+ Crear nuevo look</Text>
        </Pressable>

        {!looks.length ? (
          <Text style={styles.empty}>No hay looks creados todavía.</Text>
        ) : null}

        {looks.map((look) => (
          <Pressable
            key={look.id}
            style={styles.card}
            onPress={() => navigation.navigate('LookDetail', { lookId: look.id })}
          >
            {look.coverImages.length > 0 && (
              <View style={styles.imageStrip}>
                {look.coverImages.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={styles.thumbnail} />
                ))}
                {look.itemCount > 4 && (
                  <View style={styles.moreChip}>
                    <Text style={styles.moreChipText}>+{look.itemCount - 4}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{look.name}</Text>
              {look.description ? (
                <Text style={styles.cardSub} numberOfLines={2}>{look.description}</Text>
              ) : null}
              <Text style={styles.cardMeta}>
                {look.itemCount} prenda{look.itemCount !== 1 ? 's' : ''}
              </Text>

              <View style={styles.actionsRow}>
                <Pressable
                  style={styles.ghostButton}
                  onPress={() => navigation.navigate('LookDetail', { lookId: look.id })}
                >
                  <Text style={styles.ghostButtonText}>Editar</Text>
                </Pressable>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => deleteLook(look.id)}
                >
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  primaryButton: {
    height: 46,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  empty: {
    color: colors.textSecondary,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  imageStrip: {
    flexDirection: 'row',
    height: 100,
  },
  thumbnail: {
    flex: 1,
    height: 100,
  },
  moreChip: {
    width: 48,
    height: 100,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreChipText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  cardBody: {
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  cardSub: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  cardMeta: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  ghostButton: {
    flex: 1,
    height: 40,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  ghostButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    height: 40,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
