import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CachedImage } from '../components/CachedImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { LookDao } from '../core/database/daos/LookDao';
import { LookItemDao } from '../core/database/daos/LookItemDao';
import { getDatabase } from '../core/database/database';
import { GarmentRow, LookItemRow, LookRow } from '../core/database/types';
import {
  buildShareGroups,
  buildWhatsAppMessage,
  VendorShareGroup,
} from '../core/services/lookShareService';
import { WhatsAppEditorModal } from '../components/WhatsAppEditorModal';
import { formatCOP } from '../features/garment/presentation/utils/formatCOP';
import { colors, radius, shadows, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LookDetail'>;

type GarmentItem = {
  lookItemId: string;
  garment: GarmentRow;
  position: number;
};

export function LookDetailScreen({ navigation, route }: Props) {
  const { lookId } = route.params;
  const auth = useAuth();
  const lookDao = useMemo(() => new LookDao(getDatabase), []);
  const lookItemDao = useMemo(() => new LookItemDao(getDatabase), []);
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);

  const [look, setLook] = useState<LookRow | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [garmentItems, setGarmentItems] = useState<GarmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Share state
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareGroups, setShareGroups] = useState<VendorShareGroup[]>([]);
  const [loadingShare, setLoadingShare] = useState(false);
  const [openingWhatsApp, setOpeningWhatsApp] = useState<string | null>(null);

  // Editor de mensaje WhatsApp (US-14)
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorGroup, setEditorGroup] = useState<VendorShareGroup | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const userId = auth.user?.id;
    const lookRow =
      auth.user?.role === 'admin'
        ? await lookDao.getById(lookId)
        : userId
          ? await lookDao.getByIdForUser(lookId, userId)
          : null;

    if (!lookRow) {
      navigation.goBack();
      return;
    }
    setLook(lookRow);
    setName(lookRow.name);
    setDescription(lookRow.description);

    const items = await lookItemDao.listByLookId(lookId);
    const resolved = await Promise.all(
      items.map(async (item) => {
        const garment = await garmentDao.getById(item.garmentId);
        return garment
          ? { lookItemId: item.id, garment, position: item.position }
          : null;
      }),
    );
    setGarmentItems(resolved.filter((g): g is GarmentItem => g !== null));
    setLoading(false);
  }, [auth.user?.id, auth.user?.role, lookDao, lookItemDao, garmentDao, lookId, navigation]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const removeGarment = useCallback((lookItemId: string) => {
    setGarmentItems((prev) => {
      if (prev.length <= 1) {
        setError('El look debe tener al menos una prenda.');
        return prev;
      }
      setError('');
      return prev.filter((g) => g.lookItemId !== lookItemId);
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!look) return;
    const userId = auth.user?.id;
    const canEdit = auth.user?.role === 'admin' || look.userId === userId;
    if (!canEdit) {
      setError('No puedes editar un look de otro usuario.');
      return;
    }
    if (garmentItems.length === 0) {
      setError('El look debe tener al menos una prenda.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await lookDao.update({
        ...look,
        name: name.trim() || look.name,
        description: description.trim(),
        updatedAt: new Date().toISOString(),
      });

      const newItems: LookItemRow[] = garmentItems.map((g, i) => ({
        id: g.lookItemId,
        lookId,
        garmentId: g.garment.id,
        position: i,
      }));
      await lookItemDao.replaceForLook(lookId, newItems);
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar.');
      setSaving(false);
    }
  }, [
    auth.user?.id, auth.user?.role, look, name, description,
    garmentItems, lookDao, lookItemDao, lookId, navigation,
  ]);

  const handleOpenShare = useCallback(async () => {
    if (garmentItems.length === 0) {
      Alert.alert('Sin prendas', 'Agrega prendas al look antes de compartir.');
      return;
    }
    setLoadingShare(true);
    setShareModalVisible(true);
    const groups = await buildShareGroups(garmentItems.map((g) => g.garment));
    setShareGroups(groups);
    setLoadingShare(false);
  }, [garmentItems]);

  const handleContactVendor = useCallback(
    (group: VendorShareGroup) => {
      setOpeningWhatsApp(group.vendorId);
      setEditorGroup(group);
      setShareModalVisible(false);
      setEditorVisible(true);
      setOpeningWhatsApp(null);
    },
    [],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ActivityIndicator style={styles.loader} color={colors.secondary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Volver</Text>
        </Pressable>
        <Text style={styles.brand}>ATELIER</Text>
        <Pressable style={styles.shareBtn} onPress={handleOpenShare}>
          <Text style={styles.shareBtnText}>Compartir</Text>
        </Pressable>
      </View>

      {/* ── Share modal ── */}
      <Modal
        animationType="slide"
        transparent
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShareModalVisible(false)}>
          <Pressable style={styles.modalPanel} onPress={() => {}}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Compartir por WhatsApp</Text>
            <Text style={styles.modalSubtitle}>
              Contacta directamente al vendedor de cada prenda.
            </Text>

            {loadingShare ? (
              <View style={styles.shareLoader}>
                <ActivityIndicator color={colors.secondary} />
                <Text style={styles.shareLoaderText}>Obteniendo datos de vendedores...</Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.groupList}
              >
                {shareGroups.map((group) => (
                  <View key={group.vendorId} style={styles.vendorCard}>
                    <View style={styles.vendorCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.vendorCardName}>{group.vendorName}</Text>
                        <Text style={styles.vendorCardGarments}>
                          {group.garments.length} prenda{group.garments.length !== 1 ? 's' : ''} en este look
                        </Text>
                      </View>
                      {!group.vendorPhone && (
                        <View style={styles.noPhoneBadge}>
                          <Text style={styles.noPhoneText}>Sin número</Text>
                        </View>
                      )}
                    </View>

                    {/* Garment list preview */}
                    {group.garments.map((g, i) => (
                      <View key={i} style={styles.previewRow}>
                        <Text style={styles.previewName} numberOfLines={1}>{g.name}</Text>
                        <Text style={styles.previewPrice}>{formatCOP(g.price)}</Text>
                      </View>
                    ))}

                    <Pressable
                      style={[
                        styles.whatsappBtn,
                        !group.vendorPhone && styles.whatsappBtnNoPhone,
                        openingWhatsApp === group.vendorId && styles.whatsappBtnDisabled,
                      ]}
                      onPress={() => handleContactVendor(group)}
                      disabled={openingWhatsApp === group.vendorId}
                    >
                      {openingWhatsApp === group.vendorId ? (
                        <ActivityIndicator size="small" color="#0C0C0E" />
                      ) : (
                        <Text style={styles.whatsappBtnText}>
                          {group.vendorPhone
                            ? `Contactar a ${group.vendorName}`
                            : `Enviar mensaje a ${group.vendorName}`}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Editor de mensaje WhatsApp — US-14 */}
      {editorGroup && (
        <WhatsAppEditorModal
          visible={editorVisible}
          onClose={() => {
            setEditorVisible(false);
            setShareModalVisible(true);
          }}
          initialMessage={buildWhatsAppMessage(name || look?.name || '', editorGroup)}
          initialPhone={editorGroup.vendorPhone}
          imageUrl={garmentItems[0]?.garment.imageUrl}
          title={`Mensaje para ${editorGroup.vendorName}`}
        />
      )}

      <FlatList
        data={garmentItems}
        keyExtractor={(item) => item.lookItemId}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Editar look</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                maxLength={60}
                placeholderTextColor={colors.textMuted}
                placeholder="Nombre del look"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
                placeholderTextColor={colors.textMuted}
                placeholder="Describe este look..."
              />
            </View>

            <Text style={styles.sectionTitle}>Prendas ({garmentItems.length})</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.garmentRow}>
            <CachedImage uri={item.garment.imageUrl} style={styles.garmentImage} />
            <View style={styles.garmentInfo}>
              <Text style={styles.garmentCategory}>{item.garment.category}</Text>
              <Text style={styles.garmentName}>{item.garment.name}</Text>
              <Text style={styles.garmentSize}>
                {item.garment.size} · {item.garment.color}
              </Text>
            </View>
            <Pressable
              style={styles.removeButton}
              onPress={() => removeGarment(item.lookItemId)}
            >
              <Text style={styles.removeButtonText}>Quitar</Text>
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Pressable
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              )}
            </Pressable>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1 },

  // Header
  header: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, letterSpacing: 5 },
  backLink: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  shareBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: 'rgba(201,168,76,0.08)',
  },
  shareBtnText: { color: colors.primary, fontWeight: '700', fontSize: 12 },

  // Share modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalPanel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '80%',
    paddingBottom: spacing.xl,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: radius.round,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    paddingHorizontal: spacing.md,
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    paddingHorizontal: spacing.md,
    marginTop: 4,
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  shareLoader: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  shareLoaderText: { color: colors.textSecondary, fontSize: 13 },
  groupList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  vendorCard: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.xs,
  },
  vendorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  vendorCardName: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  vendorCardGarments: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  noPhoneBadge: {
    borderWidth: 0.5,
    borderColor: colors.warning,
    borderRadius: radius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  noPhoneText: { color: colors.warning, fontSize: 10, fontWeight: '700' },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  previewName: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
  },
  previewPrice: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  whatsappBtn: {
    marginTop: spacing.sm,
    height: 44,
    borderRadius: radius.round,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappBtnNoPhone: {
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  whatsappBtnDisabled: { opacity: 0.6 },
  whatsappBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.3,
  },

  // List
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  field: { marginBottom: spacing.md },
  label: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputMultiline: { height: 90, textAlignVertical: 'top' },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  garmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadows.card,
  },
  garmentImage: { width: 88, height: 88 },
  garmentInfo: { flex: 1, paddingHorizontal: spacing.md, gap: 3 },
  garmentCategory: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  garmentName: { color: colors.textPrimary, fontWeight: '700', fontSize: 14, letterSpacing: -0.2 },
  garmentSize: { color: colors.textSecondary, fontSize: 12 },
  removeButton: {
    marginRight: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: colors.error,
  },
  removeButtonText: { color: colors.error, fontWeight: '700', fontSize: 12 },
  footer: { marginTop: spacing.lg, gap: spacing.sm },
  errorText: { color: colors.error, fontWeight: '600', textAlign: 'center', fontSize: 13 },
  saveButton: {
    height: 52,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.gold,
  },
  saveButtonDisabled: { backgroundColor: colors.border, shadowOpacity: 0, elevation: 0 },
  saveButtonText: { color: '#0C0C0E', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
});
