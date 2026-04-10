import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getDatabaseSnapshot, DatabaseSnapshot } from '../core/database/database';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'DatabaseInspector'>;

export function DatabaseInspectorScreen({ navigation }: Props) {
  const [snapshot, setSnapshot] = useState<DatabaseSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSnapshot = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dbSnapshot = await getDatabaseSnapshot();
      setSnapshot(dbSnapshot);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo leer la base de datos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSnapshot();
  }, [loadSnapshot]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>ATELIER</Text>
            <Text style={styles.title}>Inspeccion de base local</Text>
          </View>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Volver</Text>
          </Pressable>
        </View>

        <Pressable style={styles.refreshButton} onPress={loadSnapshot}>
          <Text style={styles.refreshButtonText}>Actualizar</Text>
        </Pressable>

        {loading ? <Text style={styles.message}>Cargando datos locales...</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {snapshot ? (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Base</Text>
              <Text style={styles.summaryValue}>{snapshot.databaseName}</Text>
              <Text style={styles.summaryMeta}>Version de esquema: {snapshot.schemaVersion}</Text>
            </View>

            {snapshot.tables.map((table) => (
              <View key={table.name} style={styles.tableCard}>
                <Text style={styles.tableName}>{table.name}</Text>
                <Text style={styles.tableMeta}>{table.rowCount} registros</Text>

                <View style={styles.codeBlock}>
                  <Text style={styles.codeLabel}>Muestra</Text>
                  <Text style={styles.codeText}>{JSON.stringify(table.sampleRows, null, 2)}</Text>
                </View>
              </View>
            ))}
          </>
        ) : null}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  brand: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    marginTop: 4,
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  backLink: {
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 4,
  },
  refreshButton: {
    height: 44,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  message: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryLabel: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    marginTop: 4,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryMeta: {
    marginTop: 4,
    color: colors.textSecondary,
  },
  tableCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  tableName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  tableMeta: {
    marginTop: 4,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  codeBlock: {
    borderRadius: radius.sm,
    backgroundColor: '#111111',
    padding: spacing.sm,
  },
  codeLabel: {
    color: '#BBBBBB',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  codeText: {
    color: '#F1F1F1',
    fontFamily: 'Courier',
    fontSize: 12,
    lineHeight: 18,
  },
});
