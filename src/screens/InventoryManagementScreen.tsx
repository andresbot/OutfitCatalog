import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
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
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { getDatabase } from '../core/database/database';
import { GarmentRow } from '../core/database/types';
import { getIt } from '../core/di/getIt';
import { DI_TOKENS } from '../core/di/injectionContainer';
import { GarmentRemoteDataSource } from '../features/garment/data/datasources/GarmentRemoteDataSource';
import { formatCOP } from '../features/garment/presentation/utils/formatCOP';
import { colors, radius, shadows, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'InventoryManagement'>;

const LOW_STOCK_THRESHOLD = 5;

function getDeleteError(error: any): string {
  if (error?.code === 'permission-denied') {
    return 'Firestore rechazo la eliminacion. Revisa reglas de la coleccion garments.';
  }

  return error?.message ?? 'No se pudo eliminar el producto.';
}

export function InventoryManagementScreen({ navigation }: Props) {
  const auth = useAuth();
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);
  const garmentRemoteDataSource = useMemo(
    () => getIt.get<GarmentRemoteDataSource>(DI_TOKENS.garmentRemoteDataSource),
    [],
  );
  const [garments, setGarments] = useState<GarmentRow[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGarments = useCallback(async () => {
    const vendorId = auth.user?.id;
    if (!vendorId || auth.user?.role !== 'vendor') {
      setGarments([]);
      setError('Debes iniciar sesion como vendedor para ver tu inventario.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const rows = await garmentDao.listByVendorId(vendorId);
      setGarments(rows);
    } catch {
      setError('No se pudo cargar tu inventario.');
    } finally {
      setLoading(false);
    }
  }, [auth.user?.id, auth.user?.role, garmentDao]);

  useFocusEffect(
    useCallback(() => {
      loadGarments();
    }, [loadGarments]),
  );

  const filteredGarments = useMemo(() => {
    let result = garments;
    if (filter === 'low') {
      result = result.filter((g) => g.stock > 0 && g.stock <= LOW_STOCK_THRESHOLD);
    } else if (filter === 'out') {
      result = result.filter((g) => g.stock === 0);
    }
    const term = query.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(term) ||
          g.id.toLowerCase().includes(term) ||
          g.category.toLowerCase().includes(term),
      );
    }
    return result;
  }, [garments, filter, query]);

  const stats = useMemo(() => {
    const total = garments.length;
    const low = garments.filter((g) => g.stock > 0 && g.stock <= LOW_STOCK_THRESHOLD).length;
    const out = garments.filter((g) => g.stock === 0).length;
    return { total, low, out };
  }, [garments]);

  const handleDelete = useCallback(
    (garment: GarmentRow) => {
      Alert.alert(
        'Eliminar producto',
        `Vas a eliminar "${garment.name}". Esta accion no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              const vendorId = auth.user?.id;
              if (!vendorId) {
                return;
              }
              try {
                if (garmentRemoteDataSource.isConfigured()) {
                  await garmentRemoteDataSource.deleteGarment(garment.id);
                }

                await garmentDao.deleteForVendor(garment.id, vendorId);
                await loadGarments();
              } catch (error) {
                Alert.alert('No se pudo eliminar', getDeleteError(error));
              }
            },
          },
        ],
      );
    },
    [auth.user?.id, garmentDao, garmentRemoteDataSource, loadGarments],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Volver</Text>
        </Pressable>
        <Text style={styles.brand}>INVENTARIO</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{stats.total}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Stock bajo</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>{stats.low}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Agotadas</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>{stats.out}</Text>
        </View>
      </View>

      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('AddEditGarment')}
      >
        <Text style={styles.primaryButtonText}>+ Agregar nuevo producto</Text>
      </Pressable>

      <View style={styles.filtersRow}>
        {(['all', 'low', 'out'] as const).map((f) => {
          const active = filter === f;
          const label = f === 'all' ? 'Todas' : f === 'low' ? 'Stock bajo' : 'Agotadas';
          return (
            <Pressable
              key={f}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        style={styles.search}
        placeholder="Buscar por nombre, id o categoria"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />

      {loading ? (
        <View style={styles.loadingPanel}>
          <ActivityIndicator color={colors.secondary} />
          <Text style={styles.loadingText}>Cargando tu inventario...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGarments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {error || 'No tienes productos que coincidan.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const stockColor =
              item.stock === 0
                ? colors.error
                : item.stock <= LOW_STOCK_THRESHOLD
                ? '#C76900'
                : colors.secondary;
            return (
              <View style={styles.row}>
                <CachedImage uri={item.imageUrl} style={styles.thumb} />
                <View style={styles.rowBody}>
                  <View style={styles.itemHeaderRow}>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                    <View style={[styles.publishBadge, item.published !== 1 && styles.draftBadge]}>
                      <Text
                        style={[
                          styles.publishBadgeText,
                          item.published !== 1 && styles.draftBadgeText,
                        ]}
                      >
                        {item.published === 1 ? 'Publicado' : 'Borrador'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{formatCOP(item.price)}</Text>
                  <Text style={[styles.stockBadge, { color: stockColor }]}>
                    Stock: {item.stock}
                    {item.stock === 0
                      ? ' (Agotado)'
                      : item.stock <= LOW_STOCK_THRESHOLD
                      ? ' (Bajo)'
                      : ''}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() =>
                      navigation.navigate('AddEditGarment', { garmentId: item.id })
                    }
                  >
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, styles.actionButtonDanger]}
                    onPress={() => handleDelete(item)}
                  >
                    <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
                      Eliminar
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 5,
  },
  backLink: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.card,
  },
  statLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  statValue: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  primaryButton: {
    marginHorizontal: spacing.md,
    height: 52,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.gold,
  },
  primaryButtonText: { color: '#0C0C0E', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radius.round,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  filterChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterChipTextActive: { color: '#0C0C0E', fontWeight: '800' },
  search: {
    marginHorizontal: spacing.md,
    height: 44,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  loadingPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  loadingText: { color: colors.textSecondary, fontSize: 13 },
  row: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadows.card,
  },
  thumb: { width: 80, height: 80, borderRadius: radius.md, backgroundColor: colors.border },
  rowBody: { flex: 1, justifyContent: 'center', gap: 2 },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  itemCategory: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  itemName: { color: colors.textPrimary, fontWeight: '700', fontSize: 14 },
  itemPrice: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  stockBadge: { fontSize: 12, fontWeight: '700' },
  publishBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
  },
  publishBadgeText: { color: '#0C0C0E', fontSize: 9, fontWeight: '800' },
  draftBadge: { backgroundColor: colors.surfaceHigh, borderWidth: 0.5, borderColor: colors.border },
  draftBadgeText: { color: colors.textSecondary },
  actions: { justifyContent: 'center', gap: spacing.xs },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceHigh,
  },
  actionButtonText: { color: colors.textPrimary, fontWeight: '700', fontSize: 12 },
  actionButtonDanger: { borderColor: colors.error, backgroundColor: 'rgba(224,82,82,0.1)' },
  actionButtonTextDanger: { color: colors.error },
  empty: { alignItems: 'center', marginTop: spacing.xl },
  emptyText: { color: colors.textSecondary, fontSize: 14 },
});
