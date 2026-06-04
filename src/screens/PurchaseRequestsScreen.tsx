import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { formatCOP } from '../features/garment/presentation/utils/formatCOP';
import {
  deletePurchaseRequest,
  listPurchaseRequestsForUser,
  PURCHASE_REQUEST_STATUS_LABELS,
  PurchaseRequest,
  PurchaseRequestStatus,
  updatePurchaseRequestStatus,
} from '../core/services/purchaseRequestService';
import { colors, radius, shadows, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'PurchaseRequests'>;

const STATUS_FLOW: PurchaseRequestStatus[] = [
  'pending',
  'contacted',
  'reserved',
  'sold',
  'cancelled',
];

const STATUS_COLORS: Record<PurchaseRequestStatus, string> = {
  pending: colors.warning,
  contacted: '#6CA8D9',
  reserved: colors.primary,
  sold: colors.success,
  cancelled: colors.error,
};

export function PurchaseRequestsScreen({ navigation, route }: Props) {
  const auth = useAuth();
  const mode = route.params?.mode ?? (auth.user?.role === 'vendor' ? 'vendor' : 'buyer');
  const isVendorMode = mode === 'vendor';
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const title = isVendorMode ? 'Solicitudes recibidas' : 'Mis solicitudes';
  const subtitle = isVendorMode
    ? 'Da seguimiento a clientes interesados y actualiza el estado.'
    : 'Consulta el estado de tus reservas y solicitudes.';

  const stats = useMemo(() => {
    const pending = requests.filter((item) => item.status === 'pending').length;
    const active = requests.filter((item) =>
      item.status === 'pending' || item.status === 'contacted' || item.status === 'reserved',
    ).length;
    return { pending, active };
  }, [requests]);

  const load = useCallback(async () => {
    const userId = auth.user?.id;
    if (!userId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      const rows = await listPurchaseRequestsForUser(userId, mode);
      setRequests(rows);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  }, [auth.user?.id, mode]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  const changeStatus = useCallback(
    async (request: PurchaseRequest, status: PurchaseRequestStatus) => {
      if (!isVendorMode || request.status === status) return;

      setUpdatingId(request.id);
      try {
        await updatePurchaseRequestStatus(request.id, status);
        setRequests((current) =>
          current.map((item) =>
            item.id === request.id
              ? { ...item, status, updatedAt: new Date().toISOString() }
              : item,
          ),
        );
      } catch (error) {
        Alert.alert(
          'No se pudo actualizar',
          error instanceof Error ? error.message : 'No se pudo actualizar el estado.',
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [isVendorMode],
  );

  const removeRequest = useCallback(
    (request: PurchaseRequest) => {
      if (!isVendorMode && request.status === 'reserved') {
        Alert.alert(
          'Solicitud reservada',
          'Para liberar el stock, el vendedor debe cancelar o eliminar esta reserva.',
        );
        return;
      }

      Alert.alert(
        'Eliminar solicitud',
        isVendorMode
          ? 'Esta solicitud se borrara de tu panel y del historial del cliente.'
          : 'Esta solicitud se borrara de tu historial y dejara de estar disponible para el vendedor.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              setDeletingId(request.id);
              try {
                await deletePurchaseRequest(request.id);
                setRequests((current) => current.filter((item) => item.id !== request.id));
              } catch (error) {
                Alert.alert(
                  'No se pudo eliminar',
                  error instanceof Error ? error.message : 'No se pudo eliminar la solicitud.',
                );
              } finally {
                setDeletingId(null);
              }
            },
          },
        ],
      );
    },
    [isVendorMode],
  );

  const renderRequest = ({ item }: { item: PurchaseRequest }) => {
    const statusColor = STATUS_COLORS[item.status];
    return (
      <View style={styles.requestCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            <Text style={styles.requestTitle} numberOfLines={1}>
              {item.sourceName || (item.source === 'look' ? 'Look' : 'Prenda')}
            </Text>
            <Text style={styles.requestMeta}>
              {isVendorMode ? item.buyerName : item.vendorName}
            </Text>
          </View>
          <View style={[styles.statusBadge, { borderColor: statusColor }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {PURCHASE_REQUEST_STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>

        <View style={styles.itemList}>
          {item.items.map((garment) => (
            <View key={garment.garmentId} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>{garment.name}</Text>
              <Text style={styles.itemDetail}>
                {garment.size} | {garment.color} | {formatCOP(garment.price)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total estimado</Text>
          <Text style={styles.summaryValue}>{formatCOP(item.total)}</Text>
        </View>

        {isVendorMode ? (
          <>
            <View style={styles.clientBox}>
              <Text style={styles.clientLabel}>Cliente</Text>
              <Text style={styles.clientValue}>{item.buyerName}</Text>
              {item.buyerPhone ? (
                <Text style={styles.clientPhone}>{item.buyerPhone}</Text>
              ) : null}
            </View>

            <View style={styles.statusGrid}>
              {STATUS_FLOW.map((status) => {
                const active = item.status === status;
                return (
                  <Pressable
                    key={status}
                    style={[
                      styles.statusButton,
                      active && styles.statusButtonActive,
                      updatingId === item.id && styles.statusButtonDisabled,
                    ]}
                    onPress={() => changeStatus(item, status)}
                    disabled={updatingId === item.id}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      active && styles.statusButtonTextActive,
                    ]}>
                      {PURCHASE_REQUEST_STATUS_LABELS[status]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : (
          <Text style={styles.buyerHint}>
            El vendedor actualizara el estado cuando avance la conversacion.
          </Text>
        )}

        <View style={styles.cardActions}>
          <Pressable
            style={[
              styles.deleteRequestButton,
              deletingId === item.id && styles.deleteRequestButtonDisabled,
            ]}
            onPress={() => removeRequest(item)}
            disabled={deletingId === item.id}
          >
            {deletingId === item.id ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <Text style={styles.deleteRequestButtonText}>Eliminar solicitud</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Volver</Text>
        </Pressable>
        <Text style={styles.brand}>ATELIER</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{requests.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.active}</Text>
                <Text style={styles.statLabel}>Activas</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <>
                <ActivityIndicator color={colors.secondary} />
                <Text style={styles.emptyText}>Cargando solicitudes...</Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>Sin solicitudes</Text>
                <Text style={styles.emptyText}>
                  {isVendorMode
                    ? 'Cuando un cliente solicite una prenda, aparecera aqui.'
                    : 'Solicita una prenda o un look para iniciar seguimiento.'}
                </Text>
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backLink: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  brand: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', letterSpacing: 5 },
  headerSpacer: { width: 48 },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  statCard: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.card,
  },
  statValue: { color: colors.primary, fontSize: 24, fontWeight: '800' },
  statLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  requestCard: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  cardHeaderText: { flex: 1 },
  requestTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  requestMeta: { color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 3 },
  statusBadge: {
    borderWidth: 1,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  itemList: { gap: spacing.xs },
  itemRow: {
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  itemName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  itemDetail: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  summaryLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  summaryValue: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  clientBox: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  clientLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  clientValue: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 4 },
  clientPhone: { color: colors.primary, fontSize: 13, fontWeight: '700', marginTop: 4 },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  statusButton: {
    minHeight: 36,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHigh,
  },
  statusButtonActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  statusButtonDisabled: { opacity: 0.65 },
  statusButtonText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  statusButtonTextActive: { color: '#0C0C0E', fontWeight: '800' },
  buyerHint: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.xs,
  },
  deleteRequestButton: {
    minHeight: 36,
    borderWidth: 0.5,
    borderColor: colors.error,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(224,82,82,0.08)',
  },
  deleteRequestButtonDisabled: { opacity: 0.6 },
  deleteRequestButtonText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyContainer: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
