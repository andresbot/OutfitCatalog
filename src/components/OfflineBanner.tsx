import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNetwork } from '../context/NetworkContext';
import { spacing } from '../theme';

export function OfflineBanner() {
  const { isConnected } = useNetwork();

  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.dot}>!</Text>
      <Text style={styles.text}>Sin conexion - mostrando datos guardados localmente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D2D2D',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  dot: {
    color: '#FF6B6B',
    fontSize: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
