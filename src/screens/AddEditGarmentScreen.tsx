import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { getDatabase } from '../core/database/database';
import { GarmentRow } from '../core/database/types';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditGarment'>;

const DEFAULT_IMAGE = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

export function AddEditGarmentScreen({ navigation, route }: Props) {
  const garmentId = route.params?.garmentId;
  const isEditing = !!garmentId;
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [stock, setStock] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!garmentId) return;
    garmentDao.getById(garmentId).then((existing) => {
      if (!existing) return;
      setName(existing.name);
      setCategory(existing.category);
      setPrice(String(existing.price));
      setImageUrl(existing.imageUrl);
      setDescription(existing.description);
      setSize(existing.size);
      setColor(existing.color);
      setStock(String(existing.stock));
    });
  }, [garmentDao, garmentId]);

  const onSave = async () => {
    setError('');
    if (!name.trim() || !category.trim()) {
      setError('Nombre y categoria son obligatorios.');
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
      imageUrl: imageUrl.trim() || DEFAULT_IMAGE,
      description: description.trim(),
      size: size.trim() || 'Unica',
      color: color.trim() || 'Variado',
      stock: stockNum,
      createdAt: isEditing ? now : now,
      updatedAt: now,
    };

    try {
      await garmentDao.upsert(row);
      Alert.alert('Listo', isEditing ? 'Prenda actualizada.' : 'Prenda creada.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo guardar la prenda.');
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
          <Text style={styles.brand}>{isEditing ? 'EDITAR PRENDA' : 'NUEVA PRENDA'}</Text>
          <View style={{ width: 60 }} />
        </View>

        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.preview} />
        ) : (
          <View style={[styles.preview, styles.previewPlaceholder]}>
            <Text style={styles.placeholderText}>Vista previa de imagen</Text>
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

        <Text style={styles.label}>URL de imagen</Text>
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

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.primaryButton, saving && { opacity: 0.6 }]}
          onPress={onSave}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear prenda'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.xs },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  brand: { fontSize: 16, fontWeight: '700', letterSpacing: 1, color: colors.textPrimary },
  backLink: { color: colors.secondary, fontWeight: '600' },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  previewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: { color: colors.textMuted },
  label: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    height: 44,
    color: colors.textPrimary,
  },
  textarea: { height: 96, paddingTop: spacing.sm, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex1: { flex: 1 },
  error: { color: colors.error, marginTop: spacing.sm, fontSize: 13 },
  primaryButton: {
    marginTop: spacing.lg,
    height: 48,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});
