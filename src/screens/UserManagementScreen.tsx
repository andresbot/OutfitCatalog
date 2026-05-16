import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import {
  ManagedUser,
  deleteUserProfile,
  listAllUsers,
  updateUserRole,
} from '../auth/firebaseUsers';
import { colors, radius, spacing } from '../theme';
import { RootStackParamList, UserRole } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'UserManagement'>;

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Cliente',
  vendor: 'Vendedor',
  admin: 'Admin',
};

export function UserManagementScreen({ navigation }: Props) {
  const auth = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await listAllUsers();
      setUsers(list);
    } catch (e: any) {
      setError(e?.message ?? 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const changeRole = (user: ManagedUser, nextRole: UserRole) => {
    if (user.id === auth.user?.id && nextRole !== 'admin') {
      Alert.alert(
        'Accion bloqueada',
        'No puedes quitarte el rol de admin a ti mismo.',
      );
      return;
    }
    Alert.alert(
      'Cambiar rol',
      `Asignar a "${user.name}" el rol "${ROLE_LABELS[nextRole]}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const ok = await updateUserRole(user.id, nextRole);
            if (ok) {
              setUsers((current) =>
                current.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)),
              );
            } else {
              Alert.alert('Error', 'No se pudo actualizar el rol.');
            }
          },
        },
      ],
    );
  };

  const deleteUser = (user: ManagedUser) => {
    if (user.id === auth.user?.id) {
      Alert.alert('Accion bloqueada', 'No puedes eliminar tu propia cuenta.');
      return;
    }
    Alert.alert(
      'Eliminar usuario',
      `Vas a eliminar el perfil de "${user.email}". La cuenta de Auth no se elimina automaticamente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteUserProfile(user.id);
            if (ok) {
              setUsers((current) => current.filter((u) => u.id !== user.id));
            } else {
              Alert.alert('Error', 'No se pudo eliminar el perfil.');
            }
          },
        },
      ],
    );
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return u.email.toLowerCase().includes(term) || u.name.toLowerCase().includes(term);
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Volver</Text>
        </Pressable>
        <Text style={styles.brand}>USUARIOS</Text>
        <Pressable onPress={loadUsers}>
          <Text style={styles.backLink}>Recargar</Text>
        </Pressable>
      </View>

      <View style={styles.filtersRow}>
        {(['all', 'user', 'vendor', 'admin'] as const).map((r) => {
          const active = roleFilter === r;
          const label = r === 'all' ? 'Todos' : ROLE_LABELS[r];
          return (
            <Pressable
              key={r}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setRoleFilter(r)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        style={styles.search}
        placeholder="Buscar por email o nombre"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.secondary} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay usuarios para mostrar.</Text>
          }
          renderItem={({ item }) => {
            const isMe = item.id === auth.user?.id;
            return (
              <View style={styles.row}>
                <View style={styles.rowHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>
                      {item.name} {isMe ? '(tu)' : ''}
                    </Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                  </View>
                  <View style={[styles.roleBadge, styles[`role_${item.role}`]]}>
                    <Text style={styles.roleBadgeText}>{ROLE_LABELS[item.role]}</Text>
                  </View>
                </View>

                <Text style={styles.sectionHint}>Cambiar rol:</Text>
                <View style={styles.actions}>
                  {(['user', 'vendor', 'admin'] as const).map((r) => (
                    <Pressable
                      key={r}
                      style={[
                        styles.roleButton,
                        item.role === r && styles.roleButtonActive,
                      ]}
                      onPress={() => changeRole(item, r)}
                      disabled={item.role === r}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          item.role === r && styles.roleButtonTextActive,
                        ]}
                      >
                        {ROLE_LABELS[r]}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  style={[styles.deleteButton, isMe && { opacity: 0.4 }]}
                  onPress={() => deleteUser(item)}
                  disabled={isMe}
                >
                  <Text style={styles.deleteButtonText}>Eliminar perfil</Text>
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  brand: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, letterSpacing: 1 },
  backLink: { color: colors.secondary, fontWeight: '600' },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  filterChip: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  filterChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterChipTextActive: { color: '#fff' },
  search: {
    marginHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.error, padding: spacing.md, textAlign: 'center' },
  empty: { color: colors.textSecondary, padding: spacing.md, textAlign: 'center' },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  row: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  userName: { color: colors.textPrimary, fontWeight: '700', fontSize: 15 },
  userEmail: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.round,
    backgroundColor: colors.border,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  role_user: { backgroundColor: colors.secondary },
  role_vendor: { backgroundColor: '#C76900' },
  role_admin: { backgroundColor: colors.primary },
  sectionHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  actions: { flexDirection: 'row', gap: spacing.xs },
  roleButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  roleButtonActive: { borderColor: colors.secondary, backgroundColor: colors.secondary },
  roleButtonText: { color: colors.textPrimary, fontWeight: '600', fontSize: 12 },
  roleButtonTextActive: { color: '#fff' },
  deleteButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
  },
  deleteButtonText: { color: colors.error, fontWeight: '600', fontSize: 13 },
});
