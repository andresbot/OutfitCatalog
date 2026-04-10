import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { FavoriteDao } from '../core/database/daos/FavoriteDao';
import { getDatabase } from '../core/database/database';
import { formatCOP } from '../features/garment/presentation/utils/formatCOP';
import { useGarmentGalleryViewModel } from '../features/garment/presentation/viewmodels/GarmentGalleryViewModel';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'GarmentGallery'>;

function formatLastSyncLabel(lastSyncedAt: string | null): string {
  if (!lastSyncedAt) {
    return 'Sin sincronizacion remota aun';
  }

  const date = new Date(lastSyncedAt);
  return `Ultima sync: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

function formatSyncSourceLabel(source: 'remote' | 'cache' | 'not_configured'): string {
  if (source === 'remote') {
    return 'Remoto';
  }

  if (source === 'not_configured') {
    return 'Firestore no configurado';
  }

  return 'Cache local';
}

export function GarmentGalleryScreen({ navigation }: Props) {
  const auth = useAuth();
  const favoriteDao = useMemo(() => new FavoriteDao(getDatabase), []);
  const [menuVisible, setMenuVisible] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const {
    categories,
    selectedCategory,
    searchQuery,
    filteredGarments,
    setCategory,
    setSearchQuery,
    syncInfo,
    syncNow,
  } = useGarmentGalleryViewModel();

  const loadFavorites = useCallback(async () => {
    const favorites = await favoriteDao.list();
    setFavoriteIds(
      favorites
        .filter((favorite) => favorite.entityType === 'garment')
        .map((favorite) => favorite.entityId),
    );
  }, [favoriteDao]);

  const toggleFavorite = useCallback(
    async (garmentId: string) => {
      const isFavorite = favoriteIds.includes(garmentId);

      if (isFavorite) {
        await favoriteDao.deleteByEntity('garment', garmentId);
        setFavoriteIds((current) => current.filter((id) => id !== garmentId));
        return;
      }

      await favoriteDao.upsert({
        id: `fav-garment-${garmentId}`,
        entityType: 'garment',
        entityId: garmentId,
        createdAt: new Date().toISOString(),
      });
      setFavoriteIds((current) => [...current, garmentId]);
    },
    [favoriteDao, favoriteIds],
  );

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </Pressable>
        <Text style={styles.brand}>ATELIER</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Volver</Text>
        </Pressable>
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.menuPanel} onPress={() => {}}>
            <Text style={styles.menuTitle}>Menu</Text>
            <Pressable style={styles.menuItem} onPress={() => setMenuVisible(false)}>
              <Text style={styles.menuItemText}>Inicio</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => setMenuVisible(false)}>
              <Text style={styles.menuItemText}>Mi catalogo</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Looks');
              }}
            >
              <Text style={styles.menuItemText}>Colecciones</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Favorites');
              }}
            >
              <Text style={styles.menuItemText}>Favoritos</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                auth.logout();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }}
            >
              <Text style={[styles.menuItemText, styles.menuLogout]}>Cerrar sesion</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.searchWrap}>
        <Text style={styles.searchLabel}>Buscar prendas</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o codigo"
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Buscar prendas por nombre o codigo"
        />
      </View>

      <ScrollView
        horizontal
        style={styles.filtersScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {categories.map((category) => {
          const active = category === selectedCategory;
          return (
            <Pressable
              key={category}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setCategory(category)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.syncStatusRow}>
        <View>
          <Text style={styles.syncSource}>{formatSyncSourceLabel(syncInfo.source)}</Text>
          <Text style={styles.syncTimestamp}>{formatLastSyncLabel(syncInfo.lastSyncedAt)}</Text>
        </View>
        <Pressable style={styles.syncButton} onPress={syncNow}>
          <Text style={styles.syncButtonText}>Sincronizar</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredGarments}
        keyExtractor={(item) => item.id}
        numColumns={2}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.column}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No se encontraron prendas para esta busqueda.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('GarmentDetail', { id: item.id })}
          >
            <Pressable
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.id)}
            >
              <Text style={styles.favoriteIcon}>
                {favoriteIds.includes(item.id) ? '♥' : '♡'}
              </Text>
            </Pressable>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <Text style={styles.eyebrow}>{item.category}</Text>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.price}>{formatCOP(item.price)}</Text>
            </View>
          </Pressable>
        )}
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
  menuButton: {
    width: 34,
    height: 34,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  menuLine: {
    width: 14,
    height: 1.8,
    backgroundColor: colors.textPrimary,
    borderRadius: 2,
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
  menuOverlay: {
    flex: 1,
    backgroundColor: '#00000033',
  },
  menuPanel: {
    width: '72%',
    height: '100%',
    backgroundColor: colors.surface,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  menuItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  menuLogout: {
    color: colors.error,
    fontWeight: '700',
  },
  filtersScroll: {
    maxHeight: 56,
  },
  searchWrap: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    padding: spacing.xs,
  },
  searchLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.round,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
  },
  filtersRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 48,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  syncStatusRow: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncSource: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  syncTimestamp: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  syncButton: {
    height: 34,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  column: {
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  favoriteButton: {
    position: 'absolute',
    zIndex: 1,
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: radius.round,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 18,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardBody: {
    padding: spacing.sm,
    gap: 2,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  price: {
    color: colors.secondary,
    fontWeight: '700',
    marginTop: 2,
  },
  emptyState: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.textSecondary,
  },
});