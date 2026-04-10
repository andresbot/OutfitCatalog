import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { RootStackParamList, UserRole } from '../types';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState('');

  const roles: UserRole[] = ['user', 'vendor', 'admin'];

  const onSubmit = async () => {
    const ok = await auth.register(name, email, password, role);
    if (!ok) {
      setError('Verifica nombre, correo y contrasena (minimo 6).');
      return;
    }

    if (role === 'user') navigation.replace('UserHome');
    if (role === 'vendor') navigation.replace('VendorHome');
    if (role === 'admin') navigation.replace('AdminHome');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Nuevo acceso</Text>
        <Text style={styles.title}>Registro</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Contrasena"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.roleRow}>
          {roles.map((item) => {
            const active = role === item;
            return (
              <Pressable
                key={item}
                style={[styles.roleChip, active && styles.roleChipActive]}
                onPress={() => setRole(item)}
              >
                <Text style={[styles.roleText, active && styles.roleTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={onSubmit}>
          <Text style={styles.primaryButtonText}>Crear cuenta</Text>
        </Pressable>

        <Pressable onPress={() => navigation.replace('Login')}>
          <Text style={styles.link}>Ya tengo cuenta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    height: 46,
    paddingHorizontal: spacing.md,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  roleChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  roleChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  roleText: {
    textTransform: 'capitalize',
    color: colors.textSecondary,
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#fff',
  },
  error: {
    color: colors.error,
    fontSize: 12,
  },
  primaryButton: {
    height: 48,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  link: {
    textAlign: 'center',
    color: colors.secondary,
    fontWeight: '600',
  },
});