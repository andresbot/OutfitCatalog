import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { buildGarmentShareMessage } from '../core/services/lookShareService';
import { getVendorPhone } from '../auth/firebaseUsers';
import { WhatsAppEditorModal } from '../components/WhatsAppEditorModal';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { CachedImage } from '../components/CachedImage';
import { HeartButton } from '../components/HeartButton';
import { FavoriteDao } from '../core/database/daos/FavoriteDao';
import { getDatabase } from '../core/database/database';
import { formatCOP } from '../features/garment/presentation/utils/formatCOP';
import { useGarmentDetailViewModel } from '../features/garment/presentation/viewmodels/GarmentDetailViewModel';
import { useTryOnViewModel } from '../features/tryon/presentation/useTryOnViewModel';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'GarmentDetail'>;

export function GarmentDetailScreen({ route, navigation }: Props) {
  const auth = useAuth();
  const { garment, loading } = useGarmentDetailViewModel(route.params.id);
  const favoriteDao = useMemo(() => new FavoriteDao(getDatabase), []);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Editor de mensaje WhatsApp — US-14
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorMessage, setEditorMessage] = useState('');
  const [editorPhone, setEditorPhone] = useState<string | null>(null);

  const { state: tryOnState, start: startTryOn, dismiss: dismissTryOn } = useTryOnViewModel(
    garment?.imageUrl ?? '',
  );

  const doTryOn = useCallback(async (source: 'camera' | 'gallery') => {
    if (!garment) return;
    const resultUrl = await startTryOn(source);
    if (!resultUrl) return;
    navigation.navigate('TryOnResult', {
      resultImageUrl: resultUrl,
      garmentName: garment.name,
      garmentPrice: garment.price,
      vendorId: garment.vendorId,
      vendorName: garment.vendorName,
      garmentImageUrl: garment.imageUrl,
      garmentCategory: garment.category,
      garmentSize: garment.size,
      garmentColor: garment.color,
      garmentStock: garment.stock,
    });
  }, [garment, navigation, startTryOn]);

  const handleTryOn = useCallback(() => {
    Alert.alert(
      'Probar con IA',
      '¿Cómo quieres agregar tu foto?',
      [
        { text: '📷 Tomar foto', onPress: () => doTryOn('camera') },
        { text: '🖼 Elegir de galería', onPress: () => doTryOn('gallery') },
        { text: 'Cancelar', style: 'cancel' },
      ],
    );
  }, [doTryOn]);

  const loadFavorite = useCallback(async () => {
    const userId = auth.user?.id;
    if (!userId) {
      setIsFavorite(false);
      return;
    }

    const favorite = await favoriteDao.getByUserEntity(userId, 'garment', route.params.id);
    setIsFavorite(Boolean(favorite));
  }, [auth.user?.id, favoriteDao, route.params.id]);

  const toggleFavorite = useCallback(async () => {
    if (!garment) {
      return;
    }

    const userId = auth.user?.id;
    if (!userId) {
      return;
    }

    if (isFavorite) {
      await favoriteDao.deleteByUserEntity(userId, 'garment', garment.id);
      setIsFavorite(false);
      return;
    }

    await favoriteDao.upsert({
      id: `fav-${userId}-garment-${garment.id}`,
      userId,
      entityType: 'garment',
      entityId: garment.id,
      createdAt: new Date().toISOString(),
    });
    setIsFavorite(true);
  }, [auth.user?.id, favoriteDao, garment, isFavorite]);

  const handleShare = useCallback(async () => {
    if (!garment) return;
    setSharing(true);
    const phone = await getVendorPhone(garment.vendorId);
    const message = buildGarmentShareMessage({
      name: garment.name,
      category: garment.category,
      price: garment.price,
      size: garment.size,
      color: garment.color,
      stock: garment.stock,
      imageUrl: garment.imageUrl,
      vendorId: garment.vendorId,
      vendorName: garment.vendorName,
    });
    setEditorPhone(phone);
    setEditorMessage(message);
    setSharing(false);
    setEditorVisible(true);
  }, [garment]);

  useFocusEffect(
    useCallback(() => {
      loadFavorite();
    }, [loadFavorite]),
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyWrap}>
          <ActivityIndicator color={colors.secondary} />
          <Text style={styles.emptyText}>Cargando producto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!garment || (auth.user?.role === 'user' && !garment.published)) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Producto no disponible.</Text>
          <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryButtonText}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Volver</Text>
          </Pressable>
          <Text style={styles.brand}>ATELIER</Text>
          <Pressable
            style={styles.shareBtn}
            onPress={handleShare}
            disabled={sharing}
          >
            {sharing
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={styles.shareBtnText}>Compartir</Text>
            }
          </Pressable>
        </View>

        <View style={styles.imageWrap}>
          <CachedImage uri={garment.imageUrl} style={styles.image} />
          <View style={styles.heartOverlay}>
            <HeartButton isFavorite={isFavorite} onToggle={toggleFavorite} size={28} />
          </View>
          <Pressable
            style={styles.tryOnChip}
            onPress={handleTryOn}
            disabled={tryOnState.status !== 'idle'}
          >
            <Text style={styles.tryOnChipText}>
              {tryOnState.status === 'uploading'
                ? 'Subiendo foto...'
                : tryOnState.status === 'generating'
                  ? 'Generando look...'
                  : '✨ Probar con IA'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.name}>{garment.name}</Text>
        <Text style={styles.vendor}>Publicado por {garment.vendorName}</Text>
        <Text style={styles.description}>{garment.description}</Text>

        <View style={styles.chipsWrap}>
          <InfoChip label="Talla" value={garment.size} />
          <InfoChip label="Color" value={garment.color} />
          <InfoChip label="Precio" value={formatCOP(garment.price)} />
          <InfoChip
            label="Disponibilidad"
            value={
              garment.stock === 0
                ? 'Agotado'
                : garment.stock <= 5
                  ? `Últimas ${garment.stock} unid.`
                  : `En stock (${garment.stock})`
            }
          />
        </View>

        {tryOnState.status === 'error' && (
          <Pressable onPress={dismissTryOn} style={styles.errorBanner}>
            <Text style={styles.errorText}>{tryOnState.message}</Text>
            <Text style={styles.errorDismiss}>Toca para cerrar</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.whatsappBtn, sharing && styles.whatsappBtnDisabled]}
          onPress={handleShare}
          disabled={sharing}
        >
          {sharing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.whatsappBtnText}>Consultar por WhatsApp</Text>
          )}
        </Pressable>
      </ScrollView>

      {/* Editor de mensaje WhatsApp — US-14 */}
      <WhatsAppEditorModal
        visible={editorVisible}
        onClose={() => setEditorVisible(false)}
        initialMessage={editorMessage}
        initialPhone={editorPhone}
        imageUrl={garment.imageUrl}
        title={`Mensaje para ${garment.vendorName}`}
      />
    </SafeAreaView>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
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
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 5,
  },
  backLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 440,
    borderRadius: radius.xl,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  heartOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: radius.round,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 22,
    fontSize: 14,
  },
  vendor: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    width: '48%',
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  chipLabel: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  chipValue: {
    marginTop: 6,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  // Header share button
  shareBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    minWidth: 80,
    alignItems: 'center',
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  shareBtnText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  // WhatsApp CTA button
  whatsappBtn: {
    height: 54,
    borderRadius: radius.round,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsappBtnDisabled: { opacity: 0.6 },
  whatsappBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
  },
  primaryButton: {
    height: 48,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    color: '#0C0C0E',
    fontWeight: '800',
    fontSize: 14,
  },
  tryOnChip: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 5,
  },
  tryOnChipText: {
    color: '#0C0C0E',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  errorBanner: {
    backgroundColor: '#2A1010',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
  },
  errorDismiss: {
    color: colors.textSecondary,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
