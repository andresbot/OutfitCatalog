import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FavoriteDao } from '../core/database/daos/FavoriteDao';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { getDatabase } from '../core/database/database';
import { formatCOP } from '../features/garment/presentation/utils/formatCOP';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

type FavoriteGarmentCard = {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  price: number;
};

export function FavoritesScreen({ navigation }: Props) {
  const favoriteDao = useMemo(() => new FavoriteDao(getDatabase), []);
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);
  const [favorites, setFavorites] = useState<FavoriteGarmentCard[]>([]);

  const loadFavorites = useCallback(async () => {
    const rows = await favoriteDao.list();
    const garmentFavorites = rows.filter((favorite) => favorite.entityType === 'garment');

    const garments = await Promise.all(
      garmentFavorites.map((favorite) => garmentDao.getById(favorite.entityId)),
    );

    setFavorites(
      garments
        .filter((garment): garment is NonNullable<typeof garment> => Boolean(garment))
        .map((garment) => ({
          id: garment.id,
          name: garment.name,
          category: garment.category,
          imageUrl: garment.imageUrl,
          price: garment.price,
        })),
    );
  }, [favoriteDao, garmentDao]);

  const removeFavorite = useCallback(
    async (garmentId: string) => {
      await favoriteDao.deleteByEntity('garment', garmentId);
      setFavorites((current) => current.filter((favorite) => favorite.id !== garmentId));
    },
    [favoriteDao],
  );

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brand}>ATELIER</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Volver</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Mis favoritos</Text>

        {!favorites.length ? (
          <Text style={styles.empty}>Aun no tienes prendas favoritas.</Text>
        ) : null}

        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('GarmentDetail', { id: item.id })}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.cardBody}>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{formatCOP(item.price)}</Text>
              </View>
              <Pressable style={styles.removeButton} onPress={() => removeFavorite(item.id)}>
                <Text style={styles.removeButtonText}>Quitar</Text>
              </Pressable>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.md,
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
    marginBottom: spacing.md,
  },
  empty: {
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  cardBody: {
    padding: spacing.sm,
    gap: 2,
  },
  category: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  price: {
    color: colors.secondary,
    fontWeight: '700',
  },
  removeButton: {
    margin: spacing.sm,
    height: 40,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});