import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CachedImage } from '../components/CachedImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { getDatabase } from '../core/database/database';
import { GarmentRow } from '../core/database/types';
import { getIt } from '../core/di/getIt';
import { DI_TOKENS } from '../core/di/injectionContainer';
import { GarmentRemoteDataSource } from '../features/garment/data/datasources/GarmentRemoteDataSource';
import { toGarmentModel } from '../features/garment/data/models/GarmentModel';
import { colors, radius, shadows, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditGarment'>;

function getGarmentPersistenceError(error: any): string {
  const code = error?.code ?? '';

  if (code === 'permission-denied') {
    return 'Firestore rechazo la publicacion. Revisa reglas de la coleccion garments.';
  }

  if (code === 'unavailable' || code === 'auth/network-request-failed') {
    return 'No hay conexion para publicar el producto. Intenta de nuevo.';
  }

  return error?.message ?? 'No se pudo guardar el producto.';
}

export function AddEditGarmentScreen({ navigation, route }: Props) {
  const auth = useAuth();
  const garmentId = route.params?.garmentId;
  const isEditing = !!garmentId;
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);
  const garmentRemoteDataSource = useMemo(
    () => getIt.get<GarmentRemoteDataSource>(DI_TOKENS.garmentRemoteDataSource),
    [],
  );

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [stock, setStock] = useState('');
  const [published, setPublished] = useState(true);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!garmentId) {
      setLoading(false);
      return;
    }

    const vendorId = auth.user?.id;
    const loadGarment = async () => {
      setLoading(true);
      const existing =
        auth.user?.role === 'admin'
          ? await garmentDao.getById(garmentId)
          : vendorId
            ? await garmentDao.getByIdForVendor(garmentId, vendorId)
            : null;

      if (!existing) {
        setError('No se encontro el producto o no tienes permiso para editarlo.');
        setLoading(false);
        return;
      }

      setName(existing.name);
      setCategory(existing.category);
      setPrice(String(existing.price));
      setImageUrl(existing.imageUrl);
      setDescription(existing.description);
      setSize(existing.size);
      setColor(existing.color);
      setStock(String(existing.stock));
      setPublished(existing.published === 1);
      setCreatedAt(existing.createdAt);
      setLoading(false);
    };

    void loadGarment();
  }, [auth.user?.id, auth.user?.role, garmentDao, garmentId]);

  const onSave = async () => {
    setError('');
    const vendorId = auth.user?.id;
    if (!vendorId || auth.user?.role !== 'vendor') {
      setError('Debes iniciar sesion como vendedor para publicar productos.');
      return;
    }

    if (!name.trim() || !category.trim()) {
      setError('Nombre y categoria son obligatorios.');
      return;
    }
    if (!imageUrl.trim()) {
      setError('Agrega una URL de imagen real para publicar el producto.');
      return;
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError('Ingresa un precio valido.');
      return;
    }
    if (Number.isNaN(stockNum) || stockNum < 0) {
      setError('Ingresa una cantidad de stock valida.');
      return;
    }

    setSaving(true);
    const now = new Date().toISOString();
    const row: GarmentRow = {
      id: garmentId ?? `garment-${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      price: priceNum,
      imageUrl: imageUrl.trim(),
      description: description.trim(),
      size: size.trim() || 'Unica',
      color: color.trim() || 'Variado',
      stock: stockNum,
      vendorId,
      vendorName: auth.user?.name ?? 'Vendedor',
      published: published ? 1 : 0,
      createdAt: createdAt ?? now,
      updatedAt: now,
    };

    try {
      if (garmentRemoteDataSource.isConfigured()) {
        await garmentRemoteDataSource.upsertGarment(toGarmentModel(row));
      }

      await garmentDao.upsert(row);
      Alert.alert('Listo', isEditing ? 'Producto actualizado.' : 'Producto creado.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      setError(getGarmentPersistenceError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Cancelar</Text>
          </Pressable>
          <Text style={styles.brand}>{isEditing ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}</Text>
          <View style={{ width: 60 }} />
        </View>

        {loading ? (
          <View style={styles.loadingPanel}>
            <ActivityIndicator color={colors.secondary} />
            <Text style={styles.loadingText}>Cargando producto...</Text>
          </View>
        ) : (
          <>
            {imageUrl ? (
              <CachedImage uri={imageUrl} style={styles.preview} />
            ) : (
              <View style={[styles.preview, styles.previewPlaceholder]}>
                <Text style={styles.placeholderText}>Agrega una URL de imagen</Text>
              </View>
            )}

            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ej. Camisa lino blanca"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Categoria *</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="Ej. Camisas, Pantalones, Zapatos"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Precio (COP) *</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.label}>Stock *</Text>
                <TextInput
                  style={styles.input}
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Talla</Text>
                <TextInput
                  style={styles.input}
                  value={size}
                  onChangeText={setSize}
                  placeholder="S, M, L, 32, 40..."
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.label}>Color</Text>
                <TextInput
                  style={styles.input}
                  value={color}
                  onChangeText={setColor}
                  placeholder="Negro, Crudo..."
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <Text style={styles.label}>URL de imagen *</Text>
            <TextInput
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Descripcion</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Detalles, material, ajuste..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
            />

            <View style={styles.publishRow}>
              <View style={styles.publishTextWrap}>
                <Text style={styles.publishLabel}>Publicado</Text>
                <Text style={styles.publishHint}>
                  Si esta activo, los clientes podran verlo en el catalogo.
                </Text>
              </View>
              <Switch
                value={published}
                onValueChange={setPublished}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={published ? '#0C0C0E' : colors.textMuted}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
              onPress={onSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#0C0C0E" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isEditing ? 'Guardar cambios' : 'Crear producto'}
                </Text>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  brand: { fontSize: 15, fontWeight: '800', letterSpacing: 3, color: colors.textPrimary },
  backLink: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
    ...shadows.card,
  },
  previewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  placeholderText: { color: colors.textMuted, fontSize: 13 },
  loadingPanel: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: { color: colors.textSecondary, fontSize: 13 },
  label: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: spacing.xs,
  },
  input: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    height: 52,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  textarea: { height: 104, paddingTop: spacing.sm, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex1: { flex: 1 },
  publishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  publishTextWrap: { flex: 1, gap: 4 },
  publishLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  publishHint: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  error: { color: colors.error, fontSize: 12, textAlign: 'center' },
  primaryButton: {
    marginTop: spacing.sm,
    height: 52,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.gold,
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#0C0C0E', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
});
