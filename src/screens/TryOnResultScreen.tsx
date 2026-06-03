// src/screens/TryOnResultScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { uploadToCloudinary } from '../core/services/cloudinaryUpload';
import { buildGarmentShareMessage } from '../core/services/lookShareService';
import { getVendorPhone } from '../auth/firebaseUsers';
import { WhatsAppEditorModal } from '../components/WhatsAppEditorModal';
import { formatCOP } from '../features/garment/presentation/utils/formatCOP';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TryOnResult'>;

export function TryOnResultScreen({ route, navigation }: Props) {
  const {
    resultImageUrl,
    garmentName,
    garmentPrice,
    vendorId,
    vendorName,
    garmentImageUrl,
    garmentCategory,
    garmentSize,
    garmentColor,
    garmentStock,
  } = route.params;

  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorMessage, setEditorMessage] = useState('');
  const [editorPhone, setEditorPhone] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const url = await uploadToCloudinary(resultImageUrl);
      setSavedUrl(url);
      Alert.alert('Guardado ✨', 'Tu look fue guardado exitosamente.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar la imagen. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }, [resultImageUrl]);

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      const message = buildGarmentShareMessage({
        name: garmentName,
        category: garmentCategory,
        price: garmentPrice,
        size: garmentSize,
        color: garmentColor,
        stock: garmentStock,
        imageUrl: garmentImageUrl,
        vendorId,
        vendorName,
        resultImageUrl: savedUrl ?? resultImageUrl,
      });
      const phone = await getVendorPhone(vendorId);
      setEditorMessage(message);
      setEditorPhone(phone);
      setEditorVisible(true);
    } finally {
      setSharing(false);
    }
  }, [
    garmentName, garmentCategory, garmentPrice, garmentSize,
    garmentColor, garmentStock, garmentImageUrl, vendorId,
    vendorName, savedUrl, resultImageUrl,
  ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>← Volver</Text>
          </Pressable>
          <Text style={styles.title}>TU LOOK</Text>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>IA ✨</Text>
          </View>
        </View>

        {/* Imagen resultado */}
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: resultImageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={400}
          />
          {savedUrl && (
            <View style={styles.savedBadge}>
              <Text style={styles.savedBadgeText}>Guardado ✓</Text>
            </View>
          )}
        </View>

        {/* Info de la prenda */}
        <View style={styles.infoRow}>
          <Text style={styles.garmentName}>{garmentName}</Text>
          <Text style={styles.garmentPrice}>{formatCOP(garmentPrice)}</Text>
        </View>
        <Text style={styles.vendorLabel}>por {vendorName}</Text>

        {/* Acciones */}
        <Pressable
          style={[styles.whatsappBtn, sharing && styles.btnDisabled]}
          onPress={handleShare}
          disabled={sharing}
        >
          {sharing
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.whatsappBtnText}>💬 Consultar por WhatsApp</Text>}
        </Pressable>

        <Pressable
          style={[styles.saveBtn, (saving || Boolean(savedUrl)) && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving || Boolean(savedUrl)}
        >
          {saving
            ? <ActivityIndicator color={colors.primary} />
            : <Text style={styles.saveBtnText}>
                {savedUrl ? '✓ Look guardado' : '💾 Guardar este look'}
              </Text>}
        </Pressable>
      </ScrollView>
      <WhatsAppEditorModal
        visible={editorVisible}
        onClose={() => setEditorVisible(false)}
        initialMessage={editorMessage}
        initialPhone={editorPhone}
        imageUrl={resultImageUrl}
        title={`Mensaje para ${vendorName}`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backLink: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  title: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, letterSpacing: 5 },
  aiBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  aiBadgeText: { color: '#0C0C0E', fontWeight: '800', fontSize: 11 },
  imageWrap: { position: 'relative' },
  image: {
    width: '100%',
    height: 480,
    borderRadius: radius.xl,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  savedBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.success,
    borderRadius: radius.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  savedBadgeText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  garmentName: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, flex: 1 },
  garmentPrice: { fontSize: 18, fontWeight: '700', color: colors.primary },
  vendorLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    marginTop: -spacing.sm,
  },
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
  whatsappBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  saveBtn: {
    height: 50,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  saveBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  btnDisabled: { opacity: 0.6 },
});
