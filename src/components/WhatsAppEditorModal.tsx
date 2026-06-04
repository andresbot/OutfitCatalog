import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const PANEL_HEIGHT = Dimensions.get('window').height * 0.85;
import { Image } from 'expo-image';
import { openWhatsApp } from '../core/services/lookShareService';
import { colors, radius, spacing } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialMessage: string;
  initialPhone?: string | null;
  imageUrl?: string;
  phoneHint?: string;
  phoneLabel?: string;
  title: string;
};

export function WhatsAppEditorModal({
  visible,
  onClose,
  initialMessage,
  initialPhone,
  imageUrl,
  phoneHint = 'Incluye código de país sin + (Colombia: 57...)',
  phoneLabel = 'Teléfono del vendedor',
  title,
}: Props) {
  const [message, setMessage] = useState(initialMessage);
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (visible) {
      setMessage(initialMessage);
      setPhone(initialPhone ? initialPhone.replace(/\D/g, '') : '');
      setTab('edit');
    }
  }, [visible, initialMessage, initialPhone]);

  const handleSend = async () => {
    setSending(true);
    await openWhatsApp(phone || null, message);
    setSending(false);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Overlay independiente — no envuelve el panel */}
        <Pressable style={styles.overlay} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kvoidContainer}
        >
        <View style={styles.panel}>
          <View style={styles.handle} />

          <Text style={styles.title} numberOfLines={1}>{title}</Text>

          {/* Tabs */}
          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, tab === 'edit' && styles.tabActive]}
              onPress={() => setTab('edit')}
            >
              <Text style={[styles.tabText, tab === 'edit' && styles.tabTextActive]}>
                Editar
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, tab === 'preview' && styles.tabActive]}
              onPress={() => setTab('preview')}
            >
              <Text style={[styles.tabText, tab === 'preview' && styles.tabTextActive]}>
                Vista previa
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Image preview */}
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                contentFit="cover"
              />
            ) : null}

            {tab === 'edit' ? (
              <>
                <Text style={styles.fieldLabel}>Mensaje</Text>
                <TextInput
                  style={styles.messageInput}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  textAlignVertical="top"
                  placeholderTextColor={colors.textMuted}
                  placeholder="Escribe tu mensaje..."
                  selectionColor={colors.primary}
                />

                <Text style={styles.fieldLabel}>
                  {phoneLabel}{' '}
                  <Text style={styles.optional}>(opcional)</Text>
                </Text>
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="Ej: 573001234567"
                  placeholderTextColor={colors.textMuted}
                  selectionColor={colors.primary}
                  maxLength={15}
                />
                <Text style={styles.phoneHint}>
                  {phoneHint}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Vista previa</Text>
                <View style={styles.previewBubble}>
                  <Text style={styles.previewText} selectable>
                    {message || '(sin mensaje)'}
                  </Text>
                  <Text style={styles.previewTime}>✓✓ Ahora</Text>
                </View>
                {phone ? (
                  <Text style={styles.previewPhone}>
                    📞 Se enviará a: +{phone}
                  </Text>
                ) : (
                  <Text style={styles.previewPhone}>
                    📋 Sin número — se abrirá WhatsApp para que elijas el contacto.
                  </Text>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={sending || !message.trim()}
            >
              {sending
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.sendText}>💬 Enviar</Text>}
            </Pressable>
          </View>
        </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  kvoidContainer: {
    width: '100%',
  },
  panel: {
    height: PANEL_HEIGHT,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.round,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.surface },
  tabText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: colors.primary, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },

  image: {
    width: '100%',
    height: 160,
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
  },

  fieldLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  optional: {
    color: colors.textMuted,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
  },

  messageInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    padding: spacing.md,
    minHeight: 180,
    maxHeight: 260,
  },

  phoneInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    height: 48,
  },
  phoneHint: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: -spacing.xs,
  },

  // Preview
  previewBubble: {
    backgroundColor: '#005C4B',
    borderRadius: radius.lg,
    borderBottomRightRadius: 4,
    padding: spacing.md,
    alignSelf: 'flex-end',
    maxWidth: '90%',
  },
  previewText: {
    color: '#E9FEEA',
    fontSize: 14,
    lineHeight: 20,
  },
  previewTime: {
    color: 'rgba(233,254,234,0.6)',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4,
  },
  previewPhone: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: colors.textSecondary, fontWeight: '700', fontSize: 14 },
  sendBtn: {
    flex: 2,
    height: 48,
    borderRadius: radius.round,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
