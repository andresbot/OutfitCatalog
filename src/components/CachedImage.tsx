import React, { useRef, useState } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { colors } from '../theme';

type Props = {
  uri: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: 'cover' | 'contain' | 'fill';
};

// SCRUM-79: memory-disk caching persists images across sessions (TTL managed by HTTP headers)
const CACHE_POLICY = 'memory-disk' as const;

export function CachedImage({ uri, style, contentFit = 'cover' }: Props) {
  const [loaded, setLoaded] = useState(false);
  const shimmerAnim = useRef(new Animated.Value(1)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  // SCRUM-81: track load time to detect images slower than 2 s
  const loadStartRef = useRef(Date.now());

  React.useEffect(() => {
    loadStartRef.current = Date.now();
    // SCRUM-80: pulse animation as skeleton while loading
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 0.35, duration: 700, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loopRef.current.start();
    return () => loopRef.current?.stop();
  // Only re-run when the URI changes (new image = reset state)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri]);

  const handleLoad = () => {
    if (__DEV__) {
      const ms = Date.now() - loadStartRef.current;
      if (ms > 2000) {
        console.warn(`[CachedImage] Slow load ${ms}ms - ${uri}`);
      }
    }
    loopRef.current?.stop();
    Animated.timing(shimmerAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(
      () => setLoaded(true),
    );
  };

  return (
    <View style={[styles.container, style]}>
      <ExpoImage
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        cachePolicy={CACHE_POLICY}
        transition={200}
        onLoad={handleLoad}
      />
      {!loaded && (
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.shimmer, { opacity: shimmerAnim }]}
          pointerEvents="none"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  shimmer: {
    backgroundColor: '#D8D8D8',
  },
});
