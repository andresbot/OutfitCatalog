import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { LookDao } from '../core/database/daos/LookDao';
import { LookItemDao } from '../core/database/daos/LookItemDao';
import { FavoriteDao } from '../core/database/daos/FavoriteDao';
import { getDatabase } from '../core/database/database';
import { listAllUsers } from '../auth/firebaseUsers';
import { formatCOP } from '../features/garment/presentation/utils/formatCOP';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminReports'>;

type Report = {
  totalGarments: number;
  totalLooks: number;
  totalFavorites: number;
  totalUsers: number;
  totalAdmins: number;
  totalVendors: number;
  totalClients: number;
  inventoryValue: number;
  lowStock: number;
  outOfStock: number;
  categoryDistribution: { category: string; count: number }[];
  topCategories: { category: string; count: number }[];
};

export function AdminReportsScreen({ navigation }: Props) {
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);
  const lookDao = useMemo(() => new LookDao(getDatabase), []);
  const lookItemDao = useMemo(() => new LookItemDao(getDatabase), []);
  const favoriteDao = useMemo(() => new FavoriteDao(getDatabase), []);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const buildReport = useCallback(async () => {
    setLoading(true);
    const [garments, looks, favorites] = await Promise.all([
      garmentDao.list(),
      lookDao.list(),
      favoriteDao.list(),
    ]);

    let users: Awaited<ReturnType<typeof listAllUsers>> = [];
    try {
      users = await listAllUsers();
    } catch {
      users = [];
    }

    const byCategory = new Map<string, number>();
    garments.forEach((g) => {
      byCategory.set(g.category, (byCategory.get(g.category) ?? 0) + 1);
    });
    const categoryDistribution = Array.from(byCategory.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const inventoryValue = garments.reduce((sum, g) => sum + g.price * g.stock, 0);

    setReport({
      totalGarments: garments.length,
      totalLooks: looks.length,
      totalFavorites: favorites.length,
      totalUsers: users.length,
      totalAdmins: users.filter((u) => u.role === 'admin').length,
      totalVendors: users.filter((u) => u.role === 'vendor').length,
      totalClients: users.filter((u) => u.role === 'user').length,
      inventoryValue,
      lowStock: garments.filter((g) => g.stock > 0 && g.stock <= 5).length,
      outOfStock: garments.filter((g) => g.stock === 0).length,
      categoryDistribution,
      topCategories: categoryDistribution.slice(0, 5),
    });
    setLoading(false);
    void lookItemDao;
  }, [garmentDao, lookDao, lookItemDao, favoriteDao]);

  useEffect(() => {
    buildReport();
  }, [buildReport]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Volver</Text>
        </Pressable>
        <Text style={styles.brand}>REPORTES</Text>
        <Pressable onPress={buildReport}>
          <Text style={styles.backLink}>Recargar</Text>
        </Pressable>
      </View>

      {loading || !report ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.secondary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.sectionTitle}>Resumen general</Text>
          <View style={styles.grid}>
            <Stat label="Prendas" value={report.totalGarments} />
            <Stat label="Looks" value={report.totalLooks} />
            <Stat label="Favoritos" value={report.totalFavorites} />
            <Stat label="Usuarios" value={report.totalUsers} />
          </View>

          <Text style={styles.sectionTitle}>Usuarios por rol</Text>
          <View style={styles.grid}>
            <Stat label="Clientes" value={report.totalClients} accent="#6B5B95" />
            <Stat label="Vendedores" value={report.totalVendors} accent="#C76900" />
            <Stat label="Admins" value={report.totalAdmins} accent={colors.primary} />
          </View>

          <Text style={styles.sectionTitle}>Inventario</Text>
          <View style={styles.bigCard}>
            <Text style={styles.bigLabel}>Valor total del inventario</Text>
            <Text style={styles.bigValue}>{formatCOP(report.inventoryValue)}</Text>
          </View>
          <View style={styles.grid}>
            <Stat label="Stock bajo" value={report.lowStock} accent={colors.error} />
            <Stat label="Agotadas" value={report.outOfStock} accent={colors.error} />
          </View>

          <Text style={styles.sectionTitle}>Categorias mas frecuentes</Text>
          {report.topCategories.length === 0 ? (
            <Text style={styles.empty}>Sin datos.</Text>
          ) : (
            report.topCategories.map((c, idx) => {
              const max = report.topCategories[0]?.count ?? 1;
              const ratio = c.count / max;
              return (
                <View key={c.category} style={styles.barRow}>
                  <Text style={styles.barLabel}>
                    {idx + 1}. {c.category}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${ratio * 100}%` }]} />
                  </View>
                  <Text style={styles.barCount}>{c.count}</Text>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: accent }]}>{value}</Text>
    </View>
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
  brand: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, letterSpacing: 1 },
  backLink: { color: colors.secondary, fontWeight: '600' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: {
    flexGrow: 1,
    flexBasis: '45%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  statLabel: { color: colors.textMuted, fontSize: 12 },
  statValue: { marginTop: 4, fontSize: 24, fontWeight: '700', color: colors.secondary },
  bigCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  bigLabel: { color: colors.textMuted, fontSize: 12 },
  bigValue: { marginTop: 4, fontSize: 28, fontWeight: '700', color: colors.primary },
  empty: { color: colors.textSecondary },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  barLabel: { width: 110, color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: radius.round,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: colors.secondary },
  barCount: { width: 32, textAlign: 'right', color: colors.textPrimary, fontWeight: '700' },
});
