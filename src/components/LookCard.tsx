import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

export interface LookCardProps {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  coverImages: string[];
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function LookCard({
  id,
  name,
  description,
  itemCount,
  coverImages,
  onPress,
  onEdit,
  onDelete,
}: LookCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {coverImages.length > 0 && (
        <View style={styles.imageStrip}>
          {coverImages.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.thumbnail} />
          ))}
          {itemCount > 4 && (
            <View style={styles.moreChip}>
              <Text style={styles.moreChipText}>+{itemCount - 4}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{name}</Text>
        {description ? (
          <Text style={styles.cardSub} numberOfLines={2}>{description}</Text>
        ) : null}
        <Text style={styles.cardMeta}>
          {itemCount} prenda{itemCount !== 1 ? 's' : ''}
        </Text>

        {(onEdit || onDelete) && (
          <View style={styles.actionsRow}>
            {onEdit && (
              <Pressable
                style={styles.ghostButton}
                onPress={onEdit}
              >
                <Text style={styles.ghostButtonText}>Editar</Text>
              </Pressable>
            )}
            {onDelete && (
              <Pressable
                style={styles.deleteButton}
                onPress={onDelete}
              >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  imageStrip: {
    flexDirection: 'row',
    height: 100,
  },
  thumbnail: {
    flex: 1,
    height: 100,
  },
  moreChip: {
    width: 48,
    height: 100,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreChipText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  cardBody: {
    padding: spacing.md,
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
