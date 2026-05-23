import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme';
import { LooksScreen } from './LooksScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Looks'>;

export function LooksScreenByRole({ navigation, route }: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  return <LooksScreen navigation={navigation} route={route} />;
}
