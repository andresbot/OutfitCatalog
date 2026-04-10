import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatCOP } from '../features/garment/presentation/utils/formatCOP';
import { useGarmentDetailViewModel } from '../features/garment/presentation/viewmodels/GarmentDetailViewModel';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'GarmentDetail'>;

export function GarmentDetailScreen({ route, navigation }: Props) {
  const { garment } = useGarmentDetailViewModel(route.params.id);

  if (!garment) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Prenda no encontrada.</Text>
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
          <Text style={styles.brand}>ATELIER</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Volver</Text>
          </Pressable>
        </View>

        <Image source={{ uri: garment.imageUrl }} style={styles.image} />

        <Text style={styles.name}>{garment.name}</Text>
        <Text style={styles.description}>{garment.description}</Text>

        <View style={styles.chipsWrap}>
          <InfoChip label="Talla" value={garment.size} />
          <InfoChip label="Color" value={garment.color} />
          <InfoChip label="Precio" value={formatCOP(garment.price)} />
          <InfoChip label="Stock" value={`${garment.stock} unidades`} />
        </View>
      </ScrollView>
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
  image: {
    width: '100%',
    height: 420,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    marginTop: spacing.md,
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  description: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  chipsWrap: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    width: '48%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipValue: {
    marginTop: 4,
    color: colors.textPrimary,
    fontWeight: '700',
  },
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
    height: 44,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});