import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';

type Stat = { label: string; value: string };
type Quick = { label: string; hint: string };

type Props = {
  title: string;
  subtitle: string;
  userName: string;
  stats: Stat[];
  quick: Quick[];
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  onLogout: () => void;
};

export function RoleDashboard({
  title,
  subtitle,
  userName,
  stats,
  quick,
  primaryActionLabel,
  onPrimaryAction,
  onLogout,
}: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topbar}>
          <Text style={styles.brand}>ATELIER</Text>
          <Pressable style={styles.ghostButton} onPress={onLogout}>
            <Text style={styles.ghostButtonText}>Salir</Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>{title}</Text>
          <Text style={styles.heroTitle}>Hola, {userName}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={onPrimaryAction}>
          <Text style={styles.primaryButtonText}>{primaryActionLabel}</Text>
        </Pressable>

        <View style={styles.statsRow}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Accesos rapidos</Text>
        <View style={styles.quickGrid}>
          {quick.map((item) => (
            <View key={item.label} style={styles.quickCard}>
              <Text style={styles.quickTitle}>{item.label}</Text>
              <Text style={styles.quickHint}>{item.hint}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brand: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  ghostButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  heroCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  eyebrow: {
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    marginTop: spacing.xs,
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroSubtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statValue: {
    marginTop: spacing.xs,
    fontSize: 24,
    fontWeight: '700',
    color: colors.secondary,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    color: colors.textMuted,
  },
  quickGrid: {
    gap: spacing.sm,
  },
  quickCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  quickHint: {
    marginTop: 2,
    color: colors.textSecondary,
  },
});
