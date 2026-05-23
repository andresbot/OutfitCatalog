import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

interface HeartButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: number;
}

export function HeartButton({ isFavorite, onToggle, size = 22 }: HeartButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isFavorite) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 40 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
    }
  }, [isFavorite, scale]);

  return (
    <Pressable
      style={styles.button}
      onPress={onToggle}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.Text
        style={[
          styles.heart,
          { fontSize: size, transform: [{ scale }] },
          isFavorite ? styles.heartActive : styles.heartInactive,
        ]}
      >
        ♥
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    includeFontPadding: false,
  },
  heartActive: {
    color: '#E74C3C',
  },
  heartInactive: {
    color: 'rgba(255,255,255,0.85)',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
