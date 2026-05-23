import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { LookDao } from '../core/database/daos/LookDao';
import { LookItemDao } from '../core/database/daos/LookItemDao';
import { getDatabase } from '../core/database/database';
import { colors, radius, shadows, spacing } from '../theme';
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
  const auth = useAuth();
  const lookDao = useMemo(() => new LookDao(getDatabase), []);
  const lookItemDao = useMemo(() => new LookItemDao(getDatabase), []);
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);

  const [looks, setLooks] = useState<LookCardData[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');
  const [refreshing, setRefreshing] = useState(false);

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
    const userId = auth.user?.id;
    if (!userId) {
      setLooks([]);
      return;
    }

    const rows = await lookDao.listByUserId(userId);
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
  }, [auth.user?.id, lookDao, lookItemDao, garmentDao, sortLooks]);

  const deleteLook = useCallback(
    (lookId: string, lookName: string) => {
      Alert.alert(
        'Eliminar look',
        `¿Eliminar "${lookName}"? Esta accion no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              const userId = auth.user?.id;
              if (!userId) {
                return;
              }

              await lookDao.deleteForUser(lookId, userId);
              await loadLooks();
            },
          },
        ],
      );
    },
    [auth.user?.id, lookDao, loadLooks],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLooks();
    setRefreshing(false);
  }, [loadLooks]);

  useFocusEffect(
    useCallback(() => {
      loadLooks();
    }, [loadLooks]),
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
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
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.empty}>No hay looks creados todavía.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        data={looks}
        keyExtractor={(item) => item.id}
        renderItem={({ item: look }) => (
          <LookCardComponent
            id={look.id}
            name={look.name}
            description={look.description}
            itemCount={look.itemCount}
            coverImages={look.coverImages}
            onPress={() => navigation.navigate('LookDetail', { lookId: look.id })}
            onEdit={() => navigation.navigate('LookDetail', { lookId: look.id })}
            onDelete={() => deleteLook(look.id, look.name)}
          />
        )}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingBottom: spacing.xl,
  },
  headerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  header: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
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
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  primaryButton: {
    height: 52,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.gold,
  },
  primaryButtonText: {
    color: '#0C0C0E',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  sortContainer: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  sortLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  sortButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sortButton: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.round,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sortButtonTextActive: {
    color: '#0C0C0E',
    fontWeight: '800',
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
