import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { markOnboardingCompleted } from '../core/services/onboardingStorage';
import { colors, radius, shadows, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const SLIDES = [
  {
    key: 'catalog',
    title: 'Explora el catálogo',
    description:
      'Descubre prendas organizadas por categoría, filtra por precio y talla, y encuentra exactamente lo que buscas.',
  },
  {
    key: 'looks',
    title: 'Crea tus looks',
    description:
      'Combina prendas para armar outfits a tu medida. Guarda tus combinaciones favoritas para cada ocasión.',
  },
  {
    key: 'favorites',
    title: 'Guarda favoritos',
    description:
      'Marca las prendas que más te gustan y tenlas siempre a mano. Construye tu lista de deseos personal.',
  },
];

// ── Illustrations ─────────────────────────────────────────────────────────────
// Each receives `sz` (container size in px) and scales all internal values.

function IllustrationCatalog({ sz }: { sz: number }) {
  const s = sz / 200;
  const cardW = Math.round(s * 84);
  const gap = Math.round(s * 8);
  return (
    <View style={{ width: sz, height: sz, alignItems: 'center', justifyContent: 'center' }}>
      {/* 2×2 grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, width: cardW * 2 + gap }}>
        {[
          { h: Math.round(s * 54), w1: 0.8,  w2: 0.52 },
          { h: Math.round(s * 66), w1: 0.7,  w2: 0 },
          { h: Math.round(s * 46), w1: 0.62, w2: 0.40, fade: true },
          { h: Math.round(s * 58), w1: 0.75, w2: 0,    fade: true },
        ].map((c, i) => (
          <View
            key={i}
            style={{
              width: cardW,
              borderWidth: 0.5,
              borderColor: colors.borderLight,
              borderRadius: Math.round(s * 10),
              backgroundColor: colors.surface,
              padding: Math.round(s * 6),
              gap: Math.round(s * 5),
              opacity: c.fade ? 0.45 : 1,
            }}
          >
            <View style={{ width: '100%', height: c.h, borderRadius: Math.round(s * 4), backgroundColor: colors.surfaceHigh }} />
            <View style={{ height: Math.round(s * 4), width: `${c.w1 * 100}%`, borderRadius: 2, backgroundColor: colors.primary, opacity: 0.7 }} />
            {c.w2 > 0 && (
              <View style={{ height: Math.round(s * 4), width: `${c.w2 * 100}%`, borderRadius: 2, backgroundColor: colors.primary, opacity: 0.4 }} />
            )}
          </View>
        ))}
      </View>
      {/* Accent star */}
      <Text style={{ position: 'absolute', top: 0, right: Math.round(s * 12), color: colors.primary, fontSize: Math.round(s * 18) }}>✦</Text>
    </View>
  );
}

function IllustrationLooks({ sz }: { sz: number }) {
  const s = sz / 200;
  const cW = Math.round(s * 100);
  const cH = Math.round(s * 126);
  const br = Math.round(s * 18);
  return (
    <View style={{ width: sz, height: sz, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: cW + Math.round(s * 40), height: cH + Math.round(s * 40) }}>
        {/* Three stacked cards */}
        <View style={{ position: 'absolute', width: cW, height: cH, borderRadius: br, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surface, opacity: 0.35, top: Math.round(s * 28), left: 0 }} />
        <View style={{ position: 'absolute', width: cW, height: cH, borderRadius: br, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surface, opacity: 0.65, top: Math.round(s * 14), left: Math.round(s * 16) }} />
        <View style={{ position: 'absolute', width: cW, height: cH, borderRadius: br, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface, top: 0, left: Math.round(s * 32) }} />
      </View>
      {/* + badge */}
      <View style={{
        position: 'absolute',
        bottom: Math.round(s * 14),
        right: Math.round(s * 10),
        width: Math.round(s * 28),
        height: Math.round(s * 28),
        borderRadius: 999,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{ width: Math.round(s * 12), height: Math.round(s * 2), backgroundColor: '#0C0C0E', borderRadius: 2, position: 'absolute' }} />
        <View style={{ width: Math.round(s * 2), height: Math.round(s * 12), backgroundColor: '#0C0C0E', borderRadius: 2, position: 'absolute' }} />
      </View>
    </View>
  );
}

function IllustrationFavorites({ sz }: { sz: number }) {
  const s = sz / 200;
  return (
    <View style={{ width: sz, height: sz, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer ring */}
      <View style={{
        position: 'absolute',
        width: Math.round(s * 160),
        height: Math.round(s * 160),
        borderRadius: 999,
        borderWidth: 0.5,
        borderColor: colors.primary,
        opacity: 0.2,
      }} />
      {/* Heart */}
      <Text style={{ fontSize: Math.round(s * 96), color: colors.primary, lineHeight: Math.round(s * 110), ...shadows.gold }}>♥</Text>
      {/* Sparkles */}
      {[
        { top: Math.round(s * 20), right: Math.round(s * 42), w: 7 },
        { top: Math.round(s * 55), left: Math.round(s * 28), w: 5 },
        { bottom: Math.round(s * 24), right: Math.round(s * 36), w: 8 },
      ].map((d, i) => (
        <View key={i} style={{
          position: 'absolute',
          width: Math.round(s * d.w),
          height: Math.round(s * d.w),
          borderRadius: 999,
          backgroundColor: colors.primary,
          ...d,
        }} />
      ))}
    </View>
  );
}

const ILLUSTRATIONS = [IllustrationCatalog, IllustrationLooks, IllustrationFavorites];

// ── Screen ────────────────────────────────────────────────────────────────────

export function OnboardingScreen({ navigation }: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Illustration container: 28-32% of screen height, capped at 200px
  const illSize = Math.min(Math.round(H * 0.30), Math.round(W * 0.55), 200);
  const isLast = currentIndex === SLIDES.length - 1;

  const finish = async () => {
    await markOnboardingCompleted();
    navigation.replace('Login');
  };

  const goNext = () => {
    if (!isLast) {
      const next = currentIndex + 1;
      scrollRef.current?.scrollTo({ x: next * W, animated: true });
      setCurrentIndex(next);
    } else {
      finish();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>

      {/* Skip — always visible at top right */}
      <View style={styles.topBar}>
        <Pressable onPress={finish} hitSlop={12}>
          <Text style={styles.skipText}>Saltar</Text>
        </Pressable>
      </View>

      {/* Slides — horizontal paging */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / W));
        }}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => {
          const Illustration = ILLUSTRATIONS[i];
          return (
            <View key={slide.key} style={[styles.slide, { width: W, paddingHorizontal: spacing.xl }]}>
              <View style={{ marginBottom: spacing.xl }}>
                <Illustration sz={illSize} />
              </View>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer: dots + button */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>
        <Pressable style={styles.btn} onPress={goNext}>
          <Text style={styles.btnText}>{isLast ? 'Empezar' : 'Siguiente'}</Text>
        </Pressable>
      </View>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Top bar (skip)
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    minHeight: 40,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },

  // Slide
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.round,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
  btn: {
    height: 54,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.gold,
  },
  btnText: {
    color: '#0C0C0E',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
