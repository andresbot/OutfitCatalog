import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../auth/AuthContext';
import { RootStackParamList, UserRole } from '../types';
import { colors, radius, spacing } from '../theme';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

function navigateByRole(role: string, navigation: Props['navigation']) {
  if (role === 'user') navigation.replace('UserHome');
  if (role === 'vendor') navigation.replace('VendorHome');
  if (role === 'admin') navigation.replace('AdminHome');
}

export function RegisterScreen({ navigation }: Props) {
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const roles: UserRole[] = ['user', 'vendor', 'admin'];

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    const { idToken = null, accessToken = null } = response.authentication ?? {};
    setGoogleLoading(true);
    auth.loginWithGoogle(idToken, accessToken).then((loggedUser) => {
      setGoogleLoading(false);
      if (!loggedUser) {
        setError(auth.lastError ?? 'No se pudo iniciar sesion con Google.');
        return;
      }
      navigateByRole(loggedUser.role, navigation);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const onGooglePress = async () => {
    if (Platform.OS === 'web') {
      setGoogleLoading(true);
      const loggedUser = await auth.loginWithGoogleWeb();
      setGoogleLoading(false);
      if (!loggedUser) {
        setError(auth.lastError ?? 'No se pudo iniciar sesion con Google.');
        return;
      }
      navigateByRole(loggedUser.role, navigation);
    } else {
      void promptAsync();
    }
  };

  const onSubmit = async () => {
    const registeredUser = await auth.register(name, email, password, role);
    if (!registeredUser) {
      setError(auth.lastError ?? 'No se pudo crear la cuenta.');
      return;
    }
    navigateByRole(registeredUser.role, navigation);
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

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={[styles.googleButton, googleLoading && styles.googleButtonDisabled]}
          onPress={onGooglePress}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </>
          )}
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  googleButton: {
    height: 48,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});