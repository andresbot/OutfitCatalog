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
import { RootStackParamList } from '../types';
import { colors, radius, spacing } from '../theme';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

function navigateByRole(role: string, navigation: Props['navigation']) {
  if (role === 'user') navigation.replace('UserHome');
  if (role === 'vendor') navigation.replace('VendorHome');
  if (role === 'admin') navigation.replace('AdminHome');
}

export function LoginScreen({ navigation }: Props) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

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
    const loggedUser = await auth.login(email, password);
    if (!loggedUser) {
      setError(auth.lastError ?? 'No se pudo iniciar sesion.');
      return;
    }
    navigateByRole(loggedUser.role, navigation);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Outfit Catalog</Text>
        <Text style={styles.title}>Login</Text>
        

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

        <Text style={styles.hint}>Inicia con una cuenta registrada para cargar su rol.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={onSubmit}>
          <Text style={styles.primaryButtonText}>Entrar</Text>
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

        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Crear cuenta</Text>
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
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    height: 46,
    paddingHorizontal: spacing.md,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
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