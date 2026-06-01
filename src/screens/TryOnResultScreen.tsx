import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TryOnResult'>;

export function TryOnResultScreen({ route }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0C0C0E', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#C9A84C' }}>Tu Look — placeholder</Text>
      <Text style={{ color: '#fff', marginTop: 8, fontSize: 10 }}>
        {route.params.resultImageUrl}
      </Text>
    </View>
  );
}
