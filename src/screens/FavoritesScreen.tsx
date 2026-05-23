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

    const [garmentResults, lookResults] = await Promise.all([
      Promise.all(garmentFavs.map((favorite) => garmentDao.getById(favorite.entityId))),
      Promise.all(lookFavs.map((favorite) => lookDao.getByIdForUser(favorite.entityId, userId))),
    ]);

    setGarments(
      garmentResults
        .filter((garment): garment is NonNullable<typeof garment> => {
          if (!garment) {
            return false;
          }

          return auth.user?.role !== 'user' || garment.published === 1;
        })
        .map((garment) => ({
          id: garment.id,
          name: garment.name,
          category: garment.category,
          imageUrl: garment.imageUrl,
          price: garment.price,
        })),
    );

    const lookCards = await Promise.all(
      lookResults
        .filter((look): look is NonNullable<typeof look> => Boolean(look))
        .map(async (look) => {
          const items = await lookItemDao.listByLookId(look.id);
          let coverImage: string | undefined;
          if (items[0]) {
            const garment = await garmentDao.getById(items[0].garmentId);
            coverImage = garment?.imageUrl;
          }
          return {
            id: look.id,
            name: look.name,
            description: look.description,
            itemCount: items.length,
            coverImage,
          };
        }),
    );
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

  const renderGarment = ({ item }: { item: FavoriteGarment }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('GarmentDetail', { id: item.id })}
    >
      <CachedImage uri={item.imageUrl} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.price}>{formatCOP(item.price)}</Text>
      </View>
      <Pressable style={styles.removeButton} onPress={() => removeGarmentFavorite(item.id)}>
        <Text style={styles.removeButtonText}>Quitar</Text>
      </Pressable>
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
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Volver</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Mis favoritos</Text>

      <View style={styles.tabs}>
        {(['prendas', 'looks'] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'prendas' ? `Productos (${garments.length})` : `Looks (${looks.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {isGarmentTab ? (
        <FlatList
          data={garments}
          keyExtractor={(item) => item.id}
          renderItem={renderGarment}
          contentContainerStyle={styles.listContent}
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
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>No tienes looks favoritos aun.</Text>
            </View>
          }
        />
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
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
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
});
