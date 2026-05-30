import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'onboarding_completed_v1';

export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingCompleted(): Promise<void> {
  await AsyncStorage.setItem(KEY, 'true');
}
