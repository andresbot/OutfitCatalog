import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { LookDao } from '../core/database/daos/LookDao';
import { LookItemDao } from '../core/database/daos/LookItemDao';
import { getDatabase } from '../core/database/database';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Looks'>;

type LookCard = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  updatedAt: string;
};

export function LooksScreen({ navigation }: Props) {
  const lookDao = useMemo(() => new LookDao(getDatabase), []);
  const lookItemDao = useMemo(() => new LookItemDao(getDatabase), []);
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);

  const [looks, setLooks] = useState<LookCard[]>([]);
  const [message, setMessage] = useState<string>('');

  const loadLooks = useCallback(async () => {
    const rows = await lookDao.list();
    const cards = await Promise.all(
      rows.map(async (look) => {
        const items = await lookItemDao.listByLookId(look.id);

        return {
          id: look.id,
          name: look.name,
          description: look.description,
          itemCount: items.length,
          updatedAt: look.updatedAt,
        };
      }),
    );

    setLooks(cards);
  }, [lookDao, lookItemDao]);

  const createLook = useCallback(async () => {
    const garments = await garmentDao.list();

    if (!garments.length) {
      setMessage('No hay prendas disponibles para crear un look.');
      return;
    }

    const now = new Date();
    const lookId = `look-${now.getTime()}`;
    const nowIso = now.toISOString();

    await lookDao.create({
      id: lookId,
      name: `Look ${looks.length + 1}`,
      description: 'Look creado desde la app.',
      coverImageUrl: garments[0].imageUrl,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    await lookItemDao.replaceForLook(
      lookId,
      garments.slice(0, 3).map((garment, index) => ({
        id: `${lookId}-item-${index + 1}`,
        lookId,
        garmentId: garment.id,
        position: index + 1,
      })),
    );

    setMessage('Look creado correctamente.');
    await loadLooks();
  }, [garmentDao, lookDao, lookItemDao, looks.length, loadLooks]);

  const renameLook = useCallback(
    async (lookId: string) => {
      const current = await lookDao.getById(lookId);
      if (!current) {
        return;
      }

      await lookDao.update({
        ...current,
        name: `${current.name} *`,
        updatedAt: new Date().toISOString(),
      });

      setMessage('Look actualizado.');
      await loadLooks();
    },
    [lookDao, loadLooks],
  );

  const deleteLook = useCallback(
    async (lookId: string) => {
      await lookDao.delete(lookId);
      setMessage('Look eliminado.');
      await loadLooks();
    },
    [lookDao, loadLooks],
  );

  useFocusEffect(
    useCallback(() => {
      loadLooks();
    }, [loadLooks]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>ATELIER</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Volver</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Colecciones (Looks)</Text>
        <Text style={styles.subtitle}>Gestiona looks locales usando SQLite.</Text>

        <Pressable style={styles.primaryButton} onPress={createLook}>
          <Text style={styles.primaryButtonText}>Crear look rapido</Text>
        </Pressable>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {!looks.length ? <Text style={styles.empty}>No hay looks creados todavia.</Text> : null}

        {looks.map((look) => (
          <View key={look.id} style={styles.card}>
            <Text style={styles.cardTitle}>{look.name}</Text>
            <Text style={styles.cardSub}>{look.description}</Text>
            <Text style={styles.cardMeta}>{look.itemCount} prendas</Text>

            <View style={styles.actionsRow}>
              <Pressable style={styles.ghostButton} onPress={() => renameLook(look.id)}>
                <Text style={styles.ghostButtonText}>Renombrar</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={() => deleteLook(look.id)}>
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        ))}
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
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    color: colors.textSecondary,
  },
  primaryButton: {
    height: 46,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  message: {
    marginBottom: spacing.md,
    color: colors.secondary,
    fontWeight: '600',
  },
  empty: {
    color: colors.textSecondary,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  cardSub: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  cardMeta: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  ghostButton: {
    flex: 1,
    height: 40,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  ghostButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    height: 40,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});