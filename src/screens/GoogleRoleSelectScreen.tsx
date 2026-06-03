import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { RootStackParamList, UserRole } from '../types';
import { colors, radius, shadows, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GoogleRoleSelect'>;

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Cliente',
  vendor: 'Vendedor',
  admin: 'Admin',
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  user: 'Explora y guarda looks de moda',
  vendor: 'Publica y gestiona tu catalogo',
  admin: 'Administra la plataforma',
};

const ROLES: UserRole[] = ['user', 'vendor'];

function navigateByRole(role: UserRole, navigation: Props['navigation']) {
  if (role === 'user') navigation.replace('UserHome');
  if (role === 'vendor') navigation.replace('VendorHome');
  if (role === 'admin') navigation.replace('AdminHome');
}

export function GoogleRoleSelectScreen({ route, navigation }: Props) {
  const { uid, name, email } = route.params;
  const auth = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const btnScale = useRef(new Animated.Value(1)).current;

  const firstName = name.split(' ')[0];

  const onConfirm = async () => {
    if (loading) return;

    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true, speed: 50 }),
      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();

    setLoading(true);
    setError('');
    try {
      const createdUser = await auth.completeGoogleSignup(uid, name, email, role);
      if (!createdUser) {
        setError(auth.lastError ?? 'No se pudo crear la cuenta.');
        return;
      }
      navigateByRole(createdUser.role, navigation);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.orb} />
      <View style={styles.container}>
        <View style={styles.brandWrap}>
          <Text style={styles.brand}>ATELIER</Text>
          <Text style={styles.brandSub}>Fashion Catalog</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Un ultimo paso</Text>
          <Text style={styles.subtitle}>Hola {firstName}, elige como usaras la app</Text>

          <View style={styles.rolesContainer}>
            {ROLES.map((item) => {
              const active = role === item;
              return (
                <Pressable
                  key={item}
                  style={[styles.roleCard, active && styles.roleCardActive]}
                  onPress={() => setRole(item)}
                  disabled={loading}
                >
                  <View style={styles.roleCardContent}>
                    <Text style={[styles.roleTitle, active && styles.roleTitleActive]}>
                      {ROLE_LABELS[item]}
                    </Text>
                    <Text style={[styles.roleDesc, active && styles.roleDescActive]}>
                      {ROLE_DESCRIPTIONS[item]}
                    </Text>
                  </View>
                  {active && (
                    <View style={styles.checkWrap}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <Pressable
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#0C0C0E" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Comenzar como {ROLE_LABELS[role]}
                </Text>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </View>
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
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.primary,
    opacity: 0.06,
  },
  container: {
    flex: 1,
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
  rolesContainer: {
    gap: spacing.sm,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHigh,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 64,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  roleCardContent: {
    flex: 1,
    gap: 2,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roleTitleActive: {
    color: colors.primary,
  },
  roleDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
  roleDescActive: {
    color: colors.textSecondary,
  },
  checkWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#0C0C0E',
    fontWeight: '800',
    fontSize: 13,
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
});
