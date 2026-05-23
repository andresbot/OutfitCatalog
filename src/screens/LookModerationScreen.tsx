import React, { useCallback, useMemo, useState } from 'react';
import {
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
import { LookDao } from '../core/database/daos/LookDao';
import { LookItemDao } from '../core/database/daos/LookItemDao';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { getDatabase } from '../core/database/database';
import { colors, radius, shadows, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LookModeration'>;

type ModerationLook = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  coverImage?: string;
  createdAt: string;
  status: 'visible' | 'flagged' | 'hidden';
};

export function LookModerationScreen({ navigation }: Props) {
  const lookDao = useMemo(() => new LookDao(getDatabase), []);
  const lookItemDao = useMemo(() => new LookItemDao(getDatabase), []);
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);

  const [looks, setLooks] = useState<ModerationLook[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged'>('all');

  const loadLooks = useCallback(async () => {
    const rows = await lookDao.list();
    const cards: ModerationLook[] = await Promise.all(
      rows.map(async (look) => {
        const items = await lookItemDao.listByLookId(look.id);
        let coverImage: string | undefined;
        if (items[0]) {
          const garment = await garmentDao.getById(items[0].garmentId);
          coverImage = garment?.imageUrl;
        }
        const flagged = items.length === 0 || look.name.trim().length < 3;
        return {
          id: look.id,
          name: look.name,
          description: look.description,
          itemCount: items.length,
          coverImage,
          createdAt: look.createdAt,
          status: flagged ? 'flagged' : 'visible',
        };
      }),
    );
    setLooks(cards);
  }, [lookDao, lookItemDao, garmentDao]);

  useFocusEffect(
    useCallback(() => {
      loadLooks();
    }, [loadLooks]),
  );

  const filtered = looks.filter((l) => {
    if (statusFilter === 'flagged' && l.status !== 'flagged') return false;
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return l.name.toLowerCase().includes(term) || l.description.toLowerCase().includes(term);
  });

  const handleDelete = (look: ModerationLook) => {
    Alert.alert(
      'Eliminar look',
      `Eliminar definitivamente "${look.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await lookItemDao.deleteByLookId(look.id);
            await lookDao.delete(look.id);
            await loadLooks();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Volver</Text>
        </Pressable>
        <Text style={styles.brand}>MODERACION</Text>
        <Pressable onPress={loadLooks}>
          <Text style={styles.backLink}>Recargar</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{looks.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Reportados</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>
            {looks.filter((l) => l.status === 'flagged').length}
          </Text>
        </View>
      </View>

      <View style={styles.filtersRow}>
        {(['all', 'flagged'] as const).map((s) => {
          const active = statusFilter === s;
          return (
            <Pressable
              key={s}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {s === 'all' ? 'Todos' : 'Solo reportados'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        style={styles.search}
        placeholder="Buscar look"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay looks que coincidan.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.coverImage ? (
              <CachedImage uri={item.coverImage} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                <Text style={styles.placeholderIcon}>?</Text>
              </View>
            )}
            <View style={styles.rowBody}>
              <View style={styles.titleRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name || '(sin nombre)'}
                </Text>
                {item.status === 'flagged' ? (
                  <View style={styles.flagBadge}>
                    <Text style={styles.flagBadgeText}>Reportado</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.itemDesc} numberOfLines={2}>
                {item.description || 'Sin descripcion.'}
              </Text>
              <Text style={styles.itemMeta}>
                {item.itemCount} prenda{item.itemCount !== 1 ? 's' : ''}
              </Text>
              <View style={styles.actions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('LookDetail', { lookId: item.id })}
                >
                  <Text style={styles.actionButtonText}>Revisar</Text>
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
          </View>
        )}
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
  brand: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, letterSpacing: 5 },
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
  statValue: { marginTop: 6, fontSize: 24, fontWeight: '800', color: colors.primary, letterSpacing: -1 },
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
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl, fontSize: 14 },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    ...shadows.card,
  },
  thumb: { width: 88, height: 88, borderRadius: radius.md, backgroundColor: colors.border },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { color: colors.primary, fontSize: 26 },
  rowBody: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  itemName: { flex: 1, color: colors.textPrimary, fontWeight: '700', fontSize: 15, letterSpacing: -0.2 },
  flagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.round,
    backgroundColor: colors.error,
  },
  flagBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  itemDesc: { color: colors.textSecondary, marginTop: 3, fontSize: 12, lineHeight: 17 },
  itemMeta: { color: colors.primary, marginTop: 4, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  actions: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.round,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceHigh,
  },
  actionButtonText: { color: colors.textPrimary, fontWeight: '700', fontSize: 12 },
  actionButtonDanger: { borderColor: colors.error, backgroundColor: 'rgba(224,82,82,0.1)' },
  actionButtonTextDanger: { color: colors.error },
});
