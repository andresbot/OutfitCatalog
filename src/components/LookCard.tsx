import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, shadows, spacing } from '../theme';
import { CachedImage } from './CachedImage';

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
  id: _id,
  name,
  description,
  itemCount,
  coverImages,
  onPress,
  onEdit,
  onDelete,
}: LookCardProps) {
  const pressAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(pressAnim, { toValue: 0.98, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () =>
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale: pressAnim }] }]}>
      <Pressable
        style={styles.card}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        {coverImages.length > 0 && (
          <View style={styles.imageStrip}>
            {coverImages.slice(0, 4).map((uri, i) => (
              <CachedImage key={`${uri}-${i}`} uri={uri} style={styles.thumbnail} />
            ))}
            {itemCount > 4 && (
              <View style={styles.moreChip}>
                <Text style={styles.moreChipText}>+{itemCount - 4}</Text>
              </View>
            )}
            <View style={styles.imageOverlay} />
          </View>
        )}

        <View style={styles.cardBody}>
          <View style={styles.cardMeta}>
            <Text style={styles.cardMetaText}>{itemCount} prenda{itemCount !== 1 ? 's' : ''}</Text>
          </View>
          <Text style={styles.cardTitle}>{name}</Text>
          {description ? (
            <Text style={styles.cardSub} numberOfLines={2}>{description}</Text>
          ) : null}

          {(onEdit || onDelete) && (
            <View style={styles.actionsRow}>
              {onEdit && (
                <Pressable style={styles.ghostButton} onPress={onEdit}>
                  <Text style={styles.ghostButtonText}>Editar</Text>
                </Pressable>
              )}
              {onDelete && (
                <Pressable style={styles.deleteButton} onPress={onDelete}>
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  card: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  imageStrip: {
    flexDirection: 'row',
    height: 140,
    position: 'relative',
  },
  thumbnail: {
    flex: 1,
    height: 140,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'transparent',
  },
  moreChip: {
    width: 52,
    height: 140,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 0.5,
    borderLeftColor: colors.border,
  },
  moreChipText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardMeta: {
    flexDirection: 'row',
  },
  cardMetaText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  cardSub: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
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
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHigh,
  },
  ghostButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
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
    fontSize: 13,
  },
});
