import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadows, spacing } from '../theme';
import { OfflineBanner } from './OfflineBanner';

type Stat = { label: string; value: string };
type Quick = { label: string; hint: string; onPress?: () => void };

type Props = {
  title: string;
  subtitle: string;
  userName: string;
  stats: Stat[];
  quick: Quick[];
  primaryActionLabel: string;
  onPrimaryAction: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  onLogout: () => void;
};

export function RoleDashboard({
  title, subtitle, userName, stats, quick,
  primaryActionLabel, onPrimaryAction,
  secondaryActionLabel, onSecondaryAction,
  onLogout,
}: Props) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const statsAnims = useRef(stats.map(() => new Animated.Value(0))).current;
  const quickAnims = useRef(quick.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.stagger(
        80,
        statsAnims.map((anim) =>
          Animated.spring(anim, { toValue: 1, tension: 70, friction: 9, useNativeDriver: true }),
        ),
      ),
      Animated.stagger(
        60,
        quickAnims.map((anim) =>
          Animated.spring(anim, { toValue: 1, tension: 65, friction: 9, useNativeDriver: true }),
        ),
      ),
    ]).start();
  }, [contentAnim, headerAnim, quickAnims, statsAnims]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.topbar, { opacity: headerAnim }]}>
          <Text style={styles.brand}>ATELIER</Text>
          <Pressable style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Salir</Text>
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[
            styles.heroCard,
            {
              opacity: contentAnim,
              transform: [{
                translateY: contentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            },
          ]}
        >
          <Text style={styles.roleTag}>{title}</Text>
          <Text style={styles.heroTitle}>Hola, {userName}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </Animated.View>

        <Animated.View style={{ opacity: contentAnim }}>
          <Pressable style={styles.primaryButton} onPress={onPrimaryAction}>
            <Text style={styles.primaryButtonText}>{primaryActionLabel}</Text>
          </Pressable>
          {secondaryActionLabel && onSecondaryAction ? (
            <Pressable style={styles.secondaryButton} onPress={onSecondaryAction}>
              <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
            </Pressable>
          ) : null}
        </Animated.View>

        <Text style={styles.sectionLabel}>Estadisticas</Text>
        <View style={styles.statsRow}>
          {stats.map((item, i) => (
            <Animated.View
              key={item.label}
              style={[
                styles.statCard,
                {
                  opacity: statsAnims[i],
                  transform: [{
                    scale: statsAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1],
                    }),
                  }],
                },
              ]}
            >
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </Animated.View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Accesos rapidos</Text>
        <View style={styles.quickGrid}>
          {quick.map((item, i) => (
            <Animated.View
              key={item.label}
              style={[
                {
                  opacity: quickAnims[i],
                  transform: [{
                    translateX: quickAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-16, 0],
                    }),
                  }],
                },
              ]}
            >
              <Pressable
                style={({ pressed }) => [styles.quickCard, pressed && styles.quickCardPressed]}
                onPress={item.onPress}
                disabled={!item.onPress}
              >
                <View style={styles.quickArrow}>
                  <Text style={styles.quickArrowText}>{'>'}</Text>
                </View>
                <Text style={styles.quickTitle}>{item.label}</Text>
                <Text style={styles.quickHint}>{item.hint}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 6,
    color: colors.textPrimary,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  logoutText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    ...shadows.card,
  },
  roleTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  heroSubtitle: { fontSize: 14, color: colors.textSecondary, lineHeight: 21 },
  primaryButton: {
    height: 52,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.gold,
  },
  primaryButtonText: {
    color: '#0C0C0E',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    height: 48,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  secondaryButtonText: { color: colors.textPrimary, fontWeight: '600', fontSize: 14 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.card,
  },
  statLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  statValue: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  quickGrid: { gap: spacing.sm },
  quickCard: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    paddingRight: spacing.lg,
    ...shadows.card,
  },
  quickCardPressed: { backgroundColor: colors.surfaceHigh, borderColor: colors.borderLight },
  quickArrow: {
    width: 28,
    height: 28,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickArrowText: { color: '#0C0C0E', fontWeight: '800', fontSize: 14 },
  quickTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  quickHint: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
});
