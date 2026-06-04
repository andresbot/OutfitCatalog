import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CachedImage } from '../components/CachedImage';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { HeartButton } from '../components/HeartButton';
import { FavoriteDao } from '../core/database/daos/FavoriteDao';
import { getDatabase } from '../core/database/database';
import { formatCOP } from '../features/garment/presentation/utils/formatCOP';
import {
  PREDEFINED_SIZES,
  PRICE_RANGES,
  useGarmentGalleryViewModel,
} from '../features/garment/presentation/viewmodels/GarmentGalleryViewModel';
import { useNetwork } from '../context/NetworkContext';
import { OfflineBanner } from '../components/OfflineBanner';
import { trackEvent } from '../core/services/analyticsService';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'GarmentGallery'>;

const SELECTION_BAR_HEIGHT = 72;

export function GarmentGalleryScreen({ navigation, route }: Props) {
  const selectionMode = route.params?.selectionMode ?? false;
  const auth = useAuth();
  const favoriteDao = useMemo(() => new FavoriteDao(getDatabase), []);
  const [menuVisible, setMenuVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const { isConnected, justReconnected } = useNetwork();
  const {
    categories,
    selectedCategory,
    searchQuery,
    filteredGarments,
    loading,
    selectedSizes,
    selectedPriceRange,
    activeFilterCount,
    setCategory,
    setSearchQuery,
    setSelectedPriceRange,
    toggleSize,
    resetAdvancedFilters,
    syncNow,
  } = useGarmentGalleryViewModel();

  // Auto-sync on reconnect
  const syncRef = useRef(syncNow);
  syncRef.current = syncNow;
  useEffect(() => {
    if (justReconnected) syncRef.current();
  }, [justReconnected]);

  useEffect(() => {
    void trackEvent(
      'catalog_viewed',
      { selectionMode, source: 'garment_gallery' },
      auth.user,
    );
  }, [auth.user, selectionMode]);

  const loadFavorites = useCallback(async () => {
    const userId = auth.user?.id;
    if (!userId) { setFavoriteIds([]); return; }
    const favorites = await favoriteDao.listByUserId(userId);
    setFavoriteIds(
      favorites
        .filter((f) => f.entityType === 'garment')
        .map((f) => f.entityId),
    );
  }, [auth.user?.id, favoriteDao]);

  const toggleFavorite = useCallback(
    async (garmentId: string) => {
      const userId = auth.user?.id;
      if (!userId) return;
      const isFavorite = favoriteIds.includes(garmentId);
      if (isFavorite) {
        await favoriteDao.deleteByUserEntity(userId, 'garment', garmentId);
        setFavoriteIds((cur) => cur.filter((id) => id !== garmentId));
        void trackEvent('favorite_removed', { entityType: 'garment', entityId: garmentId }, auth.user);
        return;
      }
      await favoriteDao.upsert({
        id: `fav-${userId}-garment-${garmentId}`,
        userId,
        entityType: 'garment',
        entityId: garmentId,
        createdAt: new Date().toISOString(),
      });
      setFavoriteIds((cur) => [...cur, garmentId]);
      void trackEvent('favorite_added', { entityType: 'garment', entityId: garmentId }, auth.user);
    },
    [auth.user, favoriteDao, favoriteIds],
  );

  const toggleSelection = useCallback((garmentId: string) => {
    setSelectedIds((cur) =>
      cur.includes(garmentId) ? cur.filter((id) => id !== garmentId) : [...cur, garmentId],
    );
  }, []);

  const handleContinueSelection = useCallback(() => {
    navigation.navigate('CreateLookPreview', { garmentIds: selectedIds });
  }, [navigation, selectedIds]);

  useFocusEffect(useCallback(() => { loadFavorites(); }, [loadFavorites]));

  void isConnected;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <OfflineBanner />

      {/* ── Header ── */}
      <View style={styles.header}>
        {selectionMode ? (
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Cancelar</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.menuButton} onPress={() => setMenuVisible(true)}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </Pressable>
        )}
        <Text
          style={[styles.brand, selectionMode && styles.brandSelection]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {selectionMode ? 'Seleccionar productos' : 'ATELIER'}
        </Text>
        {selectionMode ? (
          <Text style={styles.selectionCount}>{selectedIds.length} selec.</Text>
        ) : (
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Volver</Text>
          </Pressable>
        )}
      </View>

      {/* ── Side menu modal ── */}
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
              onPress={() => { setMenuVisible(false); navigation.navigate('Looks'); }}
            >
              <Text style={styles.menuItemText}>Colecciones</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => { setMenuVisible(false); navigation.navigate('Favorites'); }}
            >
              <Text style={styles.menuItemText}>Favoritos</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                auth.logout();
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
              }}
            >
              <Text style={[styles.menuItemText, styles.menuLogout]}>Cerrar sesion</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Advanced filters modal ── */}
      <Modal
        animationType="slide"
        transparent
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable style={styles.filterOverlay} onPress={() => setFilterModalVisible(false)}>
          <Pressable style={styles.filterPanel} onPress={() => {}}>
            <View style={styles.filterHandle} />

            <View style={styles.filterPanelHeader}>
              <Text style={styles.filterPanelTitle}>Filtros avanzados</Text>
              <Pressable onPress={resetAdvancedFilters}>
                <Text style={styles.filterResetText}>Resetear todo</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {/* Price ranges — single selection */}
              <Text style={styles.filterSectionLabel}>PRECIO</Text>
              <View style={styles.chipGrid}>
                {PRICE_RANGES.map((range) => {
                  const active = selectedPriceRange === range.label;
                  return (
                    <Pressable
                      key={range.label}
                      style={[styles.advChip, active && styles.advChipActive]}
                      onPress={() =>
                        setSelectedPriceRange(active ? null : range.label)
                      }
                    >
                      <Text style={[styles.advChipText, active && styles.advChipTextActive]}>
                        {range.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Sizes — multiple selection */}
              <Text style={styles.filterSectionLabel}>TALLA</Text>
              <View style={styles.chipGrid}>
                {PREDEFINED_SIZES.map((size) => {
                  const active = selectedSizes.includes(size);
                  return (
                    <Pressable
                      key={size}
                      style={[styles.advChip, active && styles.advChipActive]}
                      onPress={() => toggleSize(size)}
                    >
                      <Text style={[styles.advChipText, active && styles.advChipTextActive]}>
                        {size}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <Pressable
              style={styles.filterApplyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.filterApplyText}>
                Ver {filteredGarments.length} resultado
                {filteredGarments.length !== 1 ? 's' : ''}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Search + filter button row ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchLabel}>Buscar productos</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, codigo o vendedor"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Buscar productos por nombre, codigo o vendedor"
          />
        </View>

        <Pressable
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => setFilterModalVisible(true)}
          accessibilityLabel="Filtros avanzados"
        >
          <View style={styles.filterIconLines}>
            <View style={styles.filterIconLine} />
            <View style={[styles.filterIconLine, styles.filterIconLineMid]} />
            <View style={[styles.filterIconLine, styles.filterIconLineShort]} />
          </View>
          {activeFilterCount > 0 && (
            <View style={styles.filterCountBadge}>
              <Text style={styles.filterCountBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* ── Category chips ── */}
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

      {/* ── Garment grid ── */}
      <FlatList
        data={filteredGarments}
        keyExtractor={(item) => item.id}
        numColumns={2}
        style={styles.list}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        contentContainerStyle={[
          styles.listContent,
          selectionMode && { paddingBottom: SELECTION_BAR_HEIGHT + spacing.md },
        ]}
        columnWrapperStyle={styles.column}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={colors.secondary} />
              <Text style={styles.emptyStateText}>Cargando productos publicados...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No hay productos publicados que coincidan.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const isSelected = selectedIdSet.has(item.id);
          return (
            <Pressable
              style={[styles.card, selectionMode && isSelected && styles.cardSelected]}
              onPress={() =>
                selectionMode
                  ? toggleSelection(item.id)
                  : navigation.navigate('GarmentDetail', { id: item.id })
              }
            >
              {selectionMode ? (
                <View style={[styles.checkboxBadge, isSelected && styles.checkboxBadgeActive]}>
                  <Text style={styles.checkboxIcon}>{isSelected ? 'OK' : ''}</Text>
                </View>
              ) : (
                <View style={styles.favoriteButton}>
                  <HeartButton
                    isFavorite={favoriteIdSet.has(item.id)}
                    onToggle={() => toggleFavorite(item.id)}
                    size={18}
                  />
                </View>
              )}
              <CachedImage uri={item.imageUrl} style={styles.cardImage} />
              <View style={styles.cardBody}>
                <Text style={styles.eyebrow}>{item.category}</Text>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.vendorName}>Por {item.vendorName}</Text>
                <Text style={styles.price}>{formatCOP(item.price)}</Text>
              </View>
            </Pressable>
          );
        }}
      />

      {selectionMode && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionBarText}>
            {selectedIds.length === 0
              ? 'Selecciona productos para tu outfit'
              : `${selectedIds.length} producto${selectedIds.length !== 1 ? 's' : ''} seleccionado${selectedIds.length !== 1 ? 's' : ''}`}
          </Text>
          <Pressable
            style={[styles.continueButton, !selectedIds.length && styles.continueButtonDisabled]}
            onPress={handleContinueSelection}
            disabled={!selectedIds.length}
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

  // ── Header ──
  header: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: radius.round,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  menuLine: {
    width: 14,
    height: 1.5,
    backgroundColor: colors.textPrimary,
    borderRadius: 2,
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 5,
  },
  brandSelection: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  backLink: { color: colors.primary, fontWeight: '700', fontSize: 13 },

  // ── Side menu ──
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  menuPanel: {
    width: '72%',
    height: '100%',
    backgroundColor: colors.surface,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderRightWidth: 0.5,
    borderRightColor: colors.border,
  },
  menuTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  menuItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  menuItemText: { fontSize: 17, color: colors.textPrimary, fontWeight: '600' },
  menuLogout: { color: colors.error },

  // ── Search row ──
  searchRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  searchWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: 9,
    paddingBottom: 9,
    minHeight: 68,
  },
  searchLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  searchInput: {
    height: 36,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 0,
  },

  // ── Filter button ──
  filterButton: {
    width: 52,
    minHeight: 68,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  filterIconLines: { gap: 4, alignItems: 'center' },
  filterIconLine: { width: 16, height: 1.5, backgroundColor: colors.textPrimary, borderRadius: 2 },
  filterIconLineMid: { width: 11 },
  filterIconLineShort: { width: 6 },
  filterCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterCountBadgeText: { color: '#0C0C0E', fontSize: 9, fontWeight: '800', lineHeight: 12 },

  // ── Advanced filters modal ──
  filterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  filterPanel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '80%',
    paddingBottom: spacing.xl,
  },
  filterHandle: {
    width: 36,
    height: 4,
    borderRadius: radius.round,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  filterPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  filterPanelTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  filterResetText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  filterScrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  filterSectionLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  advChip: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  advChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  advChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  advChipTextActive: { color: '#0C0C0E', fontWeight: '800' },
  filterApplyButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    height: 52,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterApplyText: { color: '#0C0C0E', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 },

  // ── Category chips ──
  filtersScroll: { maxHeight: 52 },
  filtersRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
  },
  filterChip: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  filterChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  filterText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  filterTextActive: { color: '#0C0C0E', fontWeight: '800' },

  // ── Garment grid ──
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  column: { gap: spacing.sm },
  card: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  favoriteButton: {
    position: 'absolute',
    zIndex: 1,
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.round,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: { width: '100%', height: 200 },
  cardBody: { padding: spacing.sm, gap: 2 },
  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  cardTitle: { color: colors.textPrimary, fontWeight: '700', fontSize: 14 },
  vendorName: { color: colors.textSecondary, fontSize: 11 },
  price: { color: colors.primary, fontWeight: '800', fontSize: 13, marginTop: 2 },
  emptyState: { marginTop: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyStateText: { color: colors.textSecondary, fontSize: 14 },

  // ── Selection mode ──
  selectionCount: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  cardSelected: { borderColor: colors.primary, borderWidth: 1.5 },
  checkboxBadge: {
    position: 'absolute',
    zIndex: 1,
    top: spacing.sm,
    right: spacing.sm,
    width: 26,
    height: 26,
    borderRadius: radius.round,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBadgeActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxIcon: { color: '#0C0C0E', fontSize: 9, fontWeight: '800', lineHeight: 12 },
  selectionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SELECTION_BAR_HEIGHT,
    backgroundColor: colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  selectionBarText: { flex: 1, color: colors.textSecondary, fontSize: 13 },
  continueButton: {
    height: 44,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: { backgroundColor: colors.border },
  continueButtonText: { color: '#0C0C0E', fontWeight: '800', fontSize: 14 },
});
