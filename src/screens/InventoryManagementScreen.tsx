import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { getDatabase } from '../core/database/database';
import { GarmentRow } from '../core/database/types';
import { formatCOP } from '../features/garment/presentation/utils/formatCOP';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'InventoryManagement'>;

const LOW_STOCK_THRESHOLD = 5;

export function InventoryManagementScreen({ navigation }: Props) {
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);
  const [garments, setGarments] = useState<GarmentRow[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const loadGarments = useCallback(async () => {
    const rows = await garmentDao.list();
    setGarments(rows);
  }, [garmentDao]);

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
        'Eliminar prenda',
        `Vas a eliminar "${garment.name}". Esta accion no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              await garmentDao.delete(garment.id);
              await loadGarments();
            },
          },
        ],
      );
    },
    [garmentDao, loadGarments],
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
        <Text style={styles.primaryButtonText}>+ Agregar nueva prenda</Text>
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

      <FlatList
        data={filteredGarments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hay prendas que coincidan.</Text>
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
              <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
              <View style={styles.rowBody}>
                <Text style={styles.itemCategory}>{item.category}</Text>
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
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  backLink: { color: colors.secondary, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.sm,
  },
  statLabel: { color: colors.textMuted, fontSize: 11 },
  statValue: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: '700',
    color: colors.secondary,
  },
  primaryButton: {
    marginHorizontal: spacing.md,
    height: 46,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  filterChip: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  filterChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterChipTextActive: { color: '#fff' },
  search: {
    marginHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  thumb: { width: 72, height: 72, borderRadius: radius.sm, backgroundColor: colors.border },
  rowBody: { flex: 1 },
  itemCategory: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  itemName: { color: colors.textPrimary, fontWeight: '700', fontSize: 14 },
  itemPrice: { color: colors.secondary, fontWeight: '700', marginTop: 2 },
  stockBadge: { marginTop: 4, fontSize: 12, fontWeight: '600' },
  actions: { justifyContent: 'space-between', gap: spacing.xs },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  actionButtonText: { color: colors.textPrimary, fontWeight: '600', fontSize: 12 },
  actionButtonDanger: { borderColor: colors.error, backgroundColor: '#FFF0F0' },
  actionButtonTextDanger: { color: colors.error },
  empty: { alignItems: 'center', marginTop: spacing.lg },
  emptyText: { color: colors.textSecondary },
});
