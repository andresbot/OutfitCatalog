import React, { useCallback, useMemo, useState } from 'react';
import {
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
import { CachedImage } from '../components/CachedImage';
import { OfflineBanner } from '../components/OfflineBanner';
import { FavoriteDao } from '../core/database/daos/FavoriteDao';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { LookDao } from '../core/database/daos/LookDao';
import { LookItemDao } from '../core/database/daos/LookItemDao';
import { getDatabase } from '../core/database/database';
import { formatCOP } from '../features/garment/presentation/utils/formatCOP';
import { colors, radius, shadows, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

type Tab = 'prendas' | 'looks';

type FavoriteGarment = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  price: number;
};

type FavoriteLook = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  coverImage?: string;
};

export function FavoritesScreen({ navigation }: Props) {
  const auth = useAuth();
  const favoriteDao = useMemo(() => new FavoriteDao(getDatabase), []);
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);
  const lookDao = useMemo(() => new LookDao(getDatabase), []);
  const lookItemDao = useMemo(() => new LookItemDao(getDatabase), []);

  const [activeTab, setActiveTab] = useState<Tab>('prendas');
  const [garments, setGarments] = useState<FavoriteGarment[]>([]);
  const [looks, setLooks] = useState<FavoriteLook[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedGarmentIds, setSelectedGarmentIds] = useState<string[]>([]);
  const selectedGarmentIdSet = useMemo(() => new Set(selectedGarmentIds), [selectedGarmentIds]);

  const loadFavorites = useCallback(async () => {
    const userId = auth.user?.id;
    if (!userId) {
      setGarments([]);
      setLooks([]);
      return;
    }

    const rows = await favoriteDao.listByUserId(userId);

    const garmentFavs = rows.filter((row) => row.entityType === 'garment');
    const lookFavs = rows.filter((row) => row.entityType === 'look');
    const garmentFavoriteIds = garmentFavs.map((favorite) => favorite.entityId);
    const lookFavoriteIds = lookFavs.map((favorite) => favorite.entityId);

    const [garmentResults, lookResults] = await Promise.all([
      garmentDao.listByIds(garmentFavoriteIds),
      lookDao.listByIdsForUser(lookFavoriteIds, userId),
    ]);
    const garmentById = new Map(garmentResults.map((garment) => [garment.id, garment]));
    const lookById = new Map(lookResults.map((look) => [look.id, look]));

    const visibleGarments = garmentFavoriteIds.reduce<FavoriteGarment[]>((acc, id) => {
      const garment = garmentById.get(id);
      if (!garment || (auth.user?.role === 'user' && garment.published !== 1)) {
        return acc;
      }

      acc.push({
          id: garment.id,
          name: garment.name,
          category: garment.category,
          imageUrl: garment.imageUrl,
          price: garment.price,
      });
      return acc;
    }, []);

    setGarments(visibleGarments);
    const visibleGarmentIds = new Set(visibleGarments.map((garment) => garment.id));
    setSelectedGarmentIds((current) =>
      current.filter((id) => visibleGarmentIds.has(id)),
    );

    const visibleLooks = lookFavoriteIds
      .map((id) => lookById.get(id))
      .filter((look): look is NonNullable<typeof look> => Boolean(look));
    const lookIds = visibleLooks.map((look) => look.id);
    const lookItems = await lookItemDao.listByLookIds(lookIds);
    const itemsByLookId = new Map<string, typeof lookItems>();
    const firstItemByLookId = new Map<string, (typeof lookItems)[number]>();

    for (const item of lookItems) {
      const current = itemsByLookId.get(item.lookId) ?? [];
      current.push(item);
      itemsByLookId.set(item.lookId, current);
      if (!firstItemByLookId.has(item.lookId)) {
        firstItemByLookId.set(item.lookId, item);
      }
    }

    const coverGarmentIds = Array.from(
      new Set(Array.from(firstItemByLookId.values()).map((item) => item.garmentId)),
    );
    const coverGarments = await garmentDao.listByIds(coverGarmentIds);
    const coverGarmentById = new Map(coverGarments.map((garment) => [garment.id, garment]));
    const lookCards = visibleLooks.map((look) => {
      const items = itemsByLookId.get(look.id) ?? [];
      const firstItem = firstItemByLookId.get(look.id);
      return {
        id: look.id,
        name: look.name,
        description: look.description,
        itemCount: items.length,
        coverImage: firstItem ? coverGarmentById.get(firstItem.garmentId)?.imageUrl : undefined,
      };
    });

    setLooks(lookCards);
  }, [auth.user?.id, auth.user?.role, favoriteDao, garmentDao, lookDao, lookItemDao]);

  const removeGarmentFavorite = useCallback(
    async (garmentId: string) => {
      const userId = auth.user?.id;
      if (!userId) {
        return;
      }

      await favoriteDao.deleteByUserEntity(userId, 'garment', garmentId);
      setGarments((prev) => prev.filter((garment) => garment.id !== garmentId));
      setSelectedGarmentIds((prev) => prev.filter((id) => id !== garmentId));
    },
    [auth.user?.id, favoriteDao],
  );

  const removeLookFavorite = useCallback(
    async (lookId: string) => {
      const userId = auth.user?.id;
      if (!userId) {
        return;
      }

      await favoriteDao.deleteByUserEntity(userId, 'look', lookId);
      setLooks((prev) => prev.filter((look) => look.id !== lookId));
    },
    [auth.user?.id, favoriteDao],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  const toggleGarmentSelection = useCallback((garmentId: string) => {
    setSelectedGarmentIds((current) =>
      current.includes(garmentId)
        ? current.filter((id) => id !== garmentId)
        : [...current, garmentId],
    );
  }, []);

  const startSelection = useCallback(() => {
    setActiveTab('prendas');
    setSelectionMode(true);
    setSelectedGarmentIds([]);
  }, []);

  const cancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedGarmentIds([]);
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedGarmentIds((current) =>
      current.length === garments.length ? [] : garments.map((garment) => garment.id),
    );
  }, [garments]);

  const continueSelection = useCallback(() => {
    if (!selectedGarmentIds.length) return;
    setSelectionMode(false);
    navigation.navigate('CreateLookPreview', { garmentIds: selectedGarmentIds });
  }, [navigation, selectedGarmentIds]);

  const renderGarment = ({ item }: { item: FavoriteGarment }) => (
    <Pressable
      style={[styles.card, selectionMode && selectedGarmentIdSet.has(item.id) && styles.cardSelected]}
      onPress={() =>
        selectionMode
          ? toggleGarmentSelection(item.id)
          : navigation.navigate('GarmentDetail', { id: item.id })
      }
    >
      {selectionMode && (
        <View
          style={[
            styles.checkboxBadge,
            selectedGarmentIdSet.has(item.id) && styles.checkboxBadgeActive,
          ]}
        >
          <Text style={styles.checkboxText}>
            {selectedGarmentIdSet.has(item.id) ? 'OK' : ''}
          </Text>
        </View>
      )}
      <CachedImage uri={item.imageUrl} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.price}>{formatCOP(item.price)}</Text>
      </View>
      {!selectionMode && (
        <Pressable style={styles.removeButton} onPress={() => removeGarmentFavorite(item.id)}>
          <Text style={styles.removeButtonText}>Quitar</Text>
        </Pressable>
      )}
    </Pressable>
  );

  const renderLook = ({ item }: { item: FavoriteLook }) => (
    <Pressable
      style={styles.lookCard}
      onPress={() => navigation.navigate('LookDetail', { lookId: item.id })}
    >
      {item.coverImage ? (
        <CachedImage uri={item.coverImage} style={styles.lookImage} />
      ) : (
        <View style={[styles.lookImage, styles.lookImagePlaceholder]}>
          <Text style={styles.placeholderText}>?</Text>
        </View>
      )}
      <View style={styles.lookBody}>
        <Text style={styles.cardTitle}>{item.name || '(sin nombre)'}</Text>
        <Text style={styles.lookDesc} numberOfLines={2}>
          {item.description || 'Sin descripcion.'}
        </Text>
        <Text style={styles.lookMeta}>{item.itemCount} prenda{item.itemCount !== 1 ? 's' : ''}</Text>
      </View>
      <Pressable style={styles.removeButton} onPress={() => removeLookFavorite(item.id)}>
        <Text style={styles.removeButtonText}>Quitar</Text>
      </Pressable>
    </Pressable>
  );

  const isGarmentTab = activeTab === 'prendas';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <OfflineBanner />
      <View style={styles.header}>
        <Text style={styles.brand}>ATELIER</Text>
        <Pressable onPress={selectionMode ? cancelSelection : () => navigation.goBack()}>
          <Text style={styles.backLink}>{selectionMode ? 'Cancelar' : 'Volver'}</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Mis favoritos</Text>

      <View style={styles.tabs}>
        {(['prendas', 'looks'] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              if (selectionMode && tab !== 'prendas') {
                cancelSelection();
              }
              setActiveTab(tab);
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'prendas' ? `Productos (${garments.length})` : `Looks (${looks.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {isGarmentTab && garments.length > 0 && (
        <View style={styles.lookActionRow}>
          {selectionMode ? (
            <>
              <Pressable style={styles.secondaryActionButton} onPress={toggleSelectAll}>
                <Text style={styles.secondaryActionText}>
                  {selectedGarmentIds.length === garments.length ? 'Limpiar' : 'Todos'}
                </Text>
              </Pressable>
              <Text style={styles.selectionHint}>
                {selectedGarmentIds.length} de {garments.length} seleccionados
              </Text>
            </>
          ) : (
            <Pressable style={styles.createLookButton} onPress={startSelection}>
              <Text style={styles.createLookButtonText}>Crear look con favoritos</Text>
            </Pressable>
          )}
        </View>
      )}

      {isGarmentTab ? (
        <FlatList
          data={garments}
          keyExtractor={(item) => item.id}
          renderItem={renderGarment}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews
          contentContainerStyle={[
            styles.listContent,
            selectionMode && styles.listContentWithSelectionBar,
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>No tienes productos favoritos aun.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={looks}
          keyExtractor={(item) => item.id}
          renderItem={renderLook}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>No tienes looks favoritos aun.</Text>
            </View>
          }
        />
      )}

      {selectionMode && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionBarText}>
            {selectedGarmentIds.length === 0
              ? 'Elige prendas favoritas para tu look'
              : `${selectedGarmentIds.length} prenda${selectedGarmentIds.length !== 1 ? 's' : ''} seleccionada${selectedGarmentIds.length !== 1 ? 's' : ''}`}
          </Text>
          <Pressable
            style={[styles.continueButton, !selectedGarmentIds.length && styles.continueButtonDisabled]}
            onPress={continueSelection}
            disabled={!selectedGarmentIds.length}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, letterSpacing: 5 },
  backLink: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.round,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.3 },
  tabTextActive: { color: '#0C0C0E', fontWeight: '800' },
  lookActionRow: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  createLookButton: {
    flex: 1,
    height: 48,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.gold,
  },
  createLookButtonText: {
    color: '#0C0C0E',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryActionButton: {
    height: 44,
    minWidth: 92,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'rgba(201,168,76,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  selectionHint: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'right',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  listContentWithSelectionBar: {
    paddingBottom: 112,
  },
  emptyContainer: {
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  empty: { color: colors.textSecondary, fontSize: 14 },
  card: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  checkboxBadge: {
    position: 'absolute',
    zIndex: 2,
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: radius.round,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBadgeActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxText: {
    color: '#0C0C0E',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },
  cardImage: { width: '100%', height: 220 },
  cardBody: { padding: spacing.md, gap: 3 },
  category: {
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 9,
    fontWeight: '700',
  },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  price: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  removeButton: {
    margin: spacing.md,
    height: 40,
    borderRadius: radius.round,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHigh,
  },
  removeButtonText: { color: colors.textPrimary, fontWeight: '700', fontSize: 13 },
  lookCard: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    ...shadows.card,
  },
  lookImage: { width: 90, height: 90 },
  lookImagePlaceholder: {
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: colors.primary, fontSize: 24 },
  lookBody: { flex: 1, padding: spacing.md, gap: 2 },
  lookDesc: { color: colors.textSecondary, fontSize: 12, marginTop: 2, lineHeight: 17 },
  lookMeta: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  selectionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 76,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectionBarText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  continueButton: {
    height: 44,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  continueButtonDisabled: {
    backgroundColor: colors.border,
  },
  continueButtonText: {
    color: '#0C0C0E',
    fontSize: 14,
    fontWeight: '800',
  },
});
