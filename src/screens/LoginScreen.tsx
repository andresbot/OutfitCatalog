import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
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
import { colors, radius, shadows, spacing } from '../theme';

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
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const brandAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const googleConfigured = !!googleWebClientId;

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: googleWebClientId ?? 'not-configured',
    androidClientId: googleAndroidClientId ?? 'not-configured',
    selectAccount: true,
  });

  useEffect(() => {
    Animated.sequence([
      Animated.timing(brandAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, [brandAnim, fadeAnim, slideAnim]);

  useEffect(() => {
    if (response?.type !== 'success') return;
    const { idToken = null, accessToken = null } = response.authentication ?? {};
    void (async () => {
      setGoogleLoading(true);
      setError('');
      try {
        const result = await auth.loginWithGoogle(idToken, accessToken);
        if (!result) {
          setError(auth.lastError ?? 'No se pudo iniciar sesion con Google.');
          return;
        }
        if (result.isNew) {
          navigation.navigate('GoogleRoleSelect', result.pending);
        } else {
          navigateByRole(result.user.role, navigation);
        }
      } finally {
        setGoogleLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const onGooglePress = async () => {
    if (emailLoading || googleLoading) {
      return;
    }

    if (Platform.OS === 'android') {
      setGoogleLoading(true);
      setError('');
      try {
        const result = await auth.loginWithGoogleNative();
        if (!result) {
          setError(auth.lastError ?? 'No se pudo iniciar sesion con Google.');
          return;
        }
        if (result.isNew) {
          navigation.navigate('GoogleRoleSelect', result.pending);
        } else {
          navigateByRole(result.user.role, navigation);
        }
      } finally {
        setGoogleLoading(false);
      }
    } else if (Platform.OS === 'web') {
      setGoogleLoading(true);
      setError('');
      try {
        const result = await auth.loginWithGoogleWeb();
        if (!result) {
          setError(auth.lastError ?? 'No se pudo iniciar sesion con Google.');
          return;
        }
        if (result.isNew) {
          navigation.navigate('GoogleRoleSelect', result.pending);
        } else {
          navigateByRole(result.user.role, navigation);
        }
      } finally {
        setGoogleLoading(false);
      }
    } else {
      void promptAsync();
    }
  };

  const onSubmit = async () => {
    if (emailLoading || googleLoading) {
      return;
    }

    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, speed: 50 }),
      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();

    setEmailLoading(true);
    setError('');
    try {
      const loggedUser = await auth.login(email, password);
      if (!loggedUser) {
        setError(auth.lastError ?? 'No se pudo iniciar sesion.');
        return;
      }
      navigateByRole(loggedUser.role, navigation);
    } finally {
      setEmailLoading(false);
    }
  };

  const submitting = emailLoading || googleLoading;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.orb} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.brandWrap, { opacity: brandAnim }]}>
          <Text style={styles.brand}>ATELIER</Text>
          <Text style={styles.brandSub}>Fashion Catalog</Text>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Inicia sesion para continuar</Text>

          <View style={styles.fields}>
            <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
              <Text style={styles.inputLabel}>CORREO</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@correo.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            <View style={[styles.inputWrap, passFocused && styles.inputWrapFocused]}>
              <Text style={styles.inputLabel}>CONTRASENA</Text>
              <TextInput
                style={styles.input}
                placeholder="Contrasena"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <Pressable
              style={[styles.primaryButton, submitting && styles.buttonDisabled]}
              onPress={onSubmit}
              disabled={submitting}
            >
              {emailLoading ? (
                <ActivityIndicator size="small" color="#0C0C0E" />
              ) : (
                <Text style={styles.primaryButtonText}>Entrar</Text>
              )}
            </Pressable>
          </Animated.View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {googleConfigured && (
            <Pressable
              style={[styles.googleButton, submitting && styles.buttonDisabled]}
              onPress={onGooglePress}
              disabled={submitting}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleButtonText}>Continuar con Google</Text>
                </>
              )}
            </Pressable>
          )}

          <Pressable onPress={() => navigation.navigate('Register')} disabled={submitting}>
            <Text style={styles.link}>
              No tienes cuenta? <Text style={styles.linkAccent}>Registrate</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  orb: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.primary,
    opacity: 0.06,
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 10,
    color: colors.textPrimary,
  },
  brandSub: {
    fontSize: 11,
    letterSpacing: 3,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadows.card,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  fields: {
    gap: spacing.sm,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHigh,
    paddingHorizontal: spacing.md,
    paddingTop: 9,
    paddingBottom: 9,
    minHeight: 68,
  },
  inputWrapFocused: {
    borderColor: colors.primary,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.primary,
    marginBottom: 2,
  },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    height: 36,
    lineHeight: 22,
    paddingVertical: 0,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    textAlign: 'center',
  },
  primaryButton: {
    height: 52,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.gold,
  },
  primaryButtonText: {
    color: '#0C0C0E',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },
  buttonDisabled: { opacity: 0.55 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 12 },
  googleButton: {
    height: 52,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceHigh,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  googleIcon: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  googleButtonText: { color: colors.textPrimary, fontWeight: '600', fontSize: 14 },
  link: { textAlign: 'center', color: colors.textSecondary, fontSize: 13 },
  linkAccent: { color: colors.primary, fontWeight: '700' },
});
