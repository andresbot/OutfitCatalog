import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getIt } from '../core/di/getIt';
import { DI_TOKENS } from '../core/di/injectionContainer';
import { GetAllLooksUseCase } from '../features/look/domain/usecases/GetAllLooksUseCase';
import { useAuth } from '../auth/AuthContext';
import { RootStackParamList } from '../types';
import { colors } from '../theme';
import { LooksScreen } from './LooksScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Looks'>;

export function LooksScreenByRole({ navigation, route }: Props) {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const getAllLooksUseCase = useMemo(
    () => getIt.get<GetAllLooksUseCase>(DI_TOKENS.getAllLooksUseCase),
    [],
  );

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
