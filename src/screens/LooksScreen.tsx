import React, { useCallback, useMemo, useState } from 'react';
import {
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
import { colors, spacing } from '../theme';
import { RootStackParamList } from '../types';
import { LookCard as LookCardComponent } from '../components/LookCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Looks'>;

type LookCardData = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  coverImages: string[];
  createdAt: string;
};

type SortOrder = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';

export function LooksScreen({ navigation }: Props) {
  const lookDao = useMemo(() => new LookDao(getDatabase), []);
  const lookItemDao = useMemo(() => new LookItemDao(getDatabase), []);
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);

  const [looks, setLooks] = useState<LookCardData[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');

  const sortLooks = useCallback(
    (looksToSort: LookCardData[]): LookCardData[] => {
      const sorted = [...looksToSort];
      switch (sortOrder) {
        case 'date-desc':
          return sorted.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        case 'date-asc':
          return sorted.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        case 'name-asc':
          return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
          return sorted.sort((a, b) => b.name.localeCompare(a.name));
        default:
          return sorted;
      }
    },
    [sortOrder],
  );

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
          createdAt: look.createdAt,
        };
      }),
    );
    setLooks(sortLooks(cards));
  }, [lookDao, lookItemDao, garmentDao, sortLooks]);

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

        <Text style={styles.title}>Mis looks</Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate('GarmentGallery', { selectionMode: true })}
        >
          <Text style={styles.primaryButtonText}>Nuevo look</Text>
        </Pressable>

        {looks.length > 0 && (
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Ordenar por:</Text>
            <View style={styles.sortButtonsRow}>
              <Pressable
                style={[
                  styles.sortButton,
                  sortOrder === 'date-desc' && styles.sortButtonActive,
                ]}
                onPress={() => {
                  setSortOrder('date-desc');
                  setLooks((prev) => sortLooks(prev));
                }}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortOrder === 'date-desc' && styles.sortButtonTextActive,
                  ]}
                >
                  Reciente
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.sortButton,
                  sortOrder === 'name-asc' && styles.sortButtonActive,
                ]}
                onPress={() => {
                  setSortOrder('name-asc');
                  setLooks((prev) => sortLooks(prev));
                }}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortOrder === 'name-asc' && styles.sortButtonTextActive,
                  ]}
                >
                  A-Z
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {!looks.length ? (
          <Text style={styles.empty}>No hay looks creados todavía.</Text>
        ) : null}

        {looks.map((look) => (
          <LookCardComponent
            key={look.id}
            id={look.id}
            name={look.name}
            description={look.description}
            itemCount={look.itemCount}
            coverImages={look.coverImages}
            onPress={() => navigation.navigate('LookDetail', { lookId: look.id })}
            onEdit={() => navigation.navigate('LookDetail', { lookId: look.id })}
            onDelete={() => deleteLook(look.id)}
          />
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
    borderRadius: spacing.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  sortContainer: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  sortButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sortButton: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortButtonActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  empty: {
    color: colors.textSecondary,
  },
});
