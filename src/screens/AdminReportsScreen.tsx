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
import { colors, radius, shadows, spacing } from '../theme';
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
  brand: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, letterSpacing: 5 },
  backLink: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginTop: spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: {
    flexGrow: 1,
    flexBasis: '45%',
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.card,
  },
  statLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  statValue: { marginTop: 8, fontSize: 28, fontWeight: '800', color: colors.primary, letterSpacing: -1 },
  bigCard: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    ...shadows.card,
  },
  bigLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
  bigValue: { marginTop: 8, fontSize: 32, fontWeight: '800', color: colors.primary, letterSpacing: -1 },
  empty: { color: colors.textSecondary, fontSize: 14 },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
  },
  barLabel: { width: 120, color: colors.textPrimary, fontSize: 12, fontWeight: '600', letterSpacing: -0.1 },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: radius.round,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.round },
  barCount: { width: 28, textAlign: 'right', color: colors.primary, fontWeight: '800', fontSize: 13 },
});
