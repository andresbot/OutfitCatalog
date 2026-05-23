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
import { RootStackParamList, UserRole } from '../types';
import { colors, radius, shadows, spacing } from '../theme';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

function navigateByRole(role: string, navigation: Props['navigation']) {
  if (role === 'user') navigation.replace('UserHome');
  if (role === 'vendor') navigation.replace('VendorHome');
  if (role === 'admin') navigation.replace('AdminHome');
}

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Cliente',
  vendor: 'Vendedor',
  admin: 'Admin',
};

export function RegisterScreen({ navigation }: Props) {
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const brandAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const roles: UserRole[] = ['user', 'vendor', 'admin'];
  const submitting = emailLoading || googleLoading;

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    Animated.sequence([
      Animated.timing(brandAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(cardAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, [brandAnim, cardAnim, slideAnim]);

  useEffect(() => {
    if (response?.type !== 'success') return;
    const { idToken = null, accessToken = null } = response.authentication ?? {};

    void (async () => {
      setGoogleLoading(true);
      setError('');
      try {
        const loggedUser = await auth.loginWithGoogle(idToken, accessToken);
        if (!loggedUser) {
          setError(auth.lastError ?? 'No se pudo iniciar sesion con Google.');
          return;
        }
        navigateByRole(loggedUser.role, navigation);
      } finally {
        setGoogleLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const onGooglePress = async () => {
    if (submitting) {
      return;
    }

    if (Platform.OS === 'web') {
      setGoogleLoading(true);
      setError('');
      try {
        const loggedUser = await auth.loginWithGoogleWeb();
        if (!loggedUser) {
          setError(auth.lastError ?? 'No se pudo iniciar sesion con Google.');
          return;
        }
        navigateByRole(loggedUser.role, navigation);
      } finally {
        setGoogleLoading(false);
      }
    } else {
      void promptAsync();
    }
  };

  const onSubmit = async () => {
    if (submitting) {
      return;
    }

    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, speed: 50 }),
      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();

    setEmailLoading(true);
    setError('');
    try {
      const registeredUser = await auth.register(name, email, password, role);
      if (!registeredUser) {
        setError(auth.lastError ?? 'No se pudo crear la cuenta.');
        return;
      }
      navigateByRole(registeredUser.role, navigation);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.orb} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.brandWrap, { opacity: brandAnim }]}>
          <Text style={styles.brand}>ATELIER</Text>
          <Text style={styles.brandSub}>Fashion Catalog</Text>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: cardAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Unete y descubre tu estilo</Text>

          <View style={styles.fields}>
            <View style={[styles.inputWrap, nameFocused && styles.inputWrapFocused]}>
              <Text style={styles.inputLabel}>NOMBRE</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre completo"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                editable={!submitting}
              />
            </View>

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
                editable={!submitting}
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
                editable={!submitting}
              />
            </View>
          </View>

          <View>
            <Text style={styles.roleLabel}>ROL</Text>
            <View style={styles.roleRow}>
              {roles.map((item) => {
                const active = role === item;
                return (
                  <Pressable
                    key={item}
                    style={[styles.roleChip, active && styles.roleChipActive, submitting && styles.roleChipDisabled]}
                    onPress={() => setRole(item)}
                    disabled={submitting}
                  >
                    <Text style={[styles.roleText, active && styles.roleTextActive]}>
                      {ROLE_LABELS[item]}
                    </Text>
                  </Pressable>
                );
              })}
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
                <Text style={styles.primaryButtonText}>Crear cuenta</Text>
              )}
            </Pressable>
          </Animated.View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

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

          <Pressable onPress={() => navigation.replace('Login')} disabled={submitting}>
            <Text style={styles.link}>
              Ya tienes cuenta? <Text style={styles.linkAccent}>Inicia sesion</Text>
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
  orb: {
    position: 'absolute',
    top: -100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primary,
    opacity: 0.05,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
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
  fields: { gap: spacing.sm },
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
  inputWrapFocused: { borderColor: colors.primary },
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
  roleLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  roleRow: { flexDirection: 'row', gap: spacing.xs },
  roleChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.round,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
  },
  roleChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  roleChipDisabled: { opacity: 0.65 },
  roleText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  roleTextActive: { color: '#0C0C0E', fontWeight: '800' },
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
