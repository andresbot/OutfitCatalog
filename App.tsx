import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/auth/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import {
  AdminHomeScreen,
  UserHomeScreen,
  VendorHomeScreen,
} from './src/screens/RoleHomeScreens';
import { GarmentGalleryScreen } from './src/screens/GarmentGalleryScreen';
import { GarmentDetailScreen } from './src/screens/GarmentDetailScreen';
import { LooksScreenByRole } from './src/screens/LooksScreenByRole';
import { LookDetailScreen } from './src/screens/LookDetailScreen';
import { CreateLookPreviewScreen } from './src/screens/CreateLookPreviewScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { InventoryManagementScreen } from './src/screens/InventoryManagementScreen';
import { AddEditGarmentScreen } from './src/screens/AddEditGarmentScreen';
import { UserManagementScreen } from './src/screens/UserManagementScreen';
import { AdminReportsScreen } from './src/screens/AdminReportsScreen';
import { LookModerationScreen } from './src/screens/LookModerationScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { VendorProfileScreen } from './src/screens/VendorProfileScreen';
import { RootStackParamList } from './src/types';
import { getIt } from './src/core/di/getIt';
import { DI_TOKENS, initDependencies } from './src/core/di/injectionContainer';
import { SyncGarmentsUseCase } from './src/features/garment/domain/usecases/SyncGarmentsUseCase';
import { NetworkProvider } from './src/context/NetworkContext';
import { isOnboardingCompleted } from './src/core/services/onboardingStorage';

initDependencies();

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'Login' | null>(null);

  useEffect(() => {
    isOnboardingCompleted().then((done) => {
      setInitialRoute(done ? 'Login' : 'Onboarding');
    });
  }, []);

  useEffect(() => {
    getIt.get<SyncGarmentsUseCase>(DI_TOKENS.syncGarmentsUseCase)
      .execute()
      .catch(() => {
        // Startup sync is best-effort and should not block app access.
      });
  }, []);

  if (!initialRoute) {
    return <View style={{ flex: 1, backgroundColor: '#0C0C0E' }} />;
  }

  return (
    <NetworkProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="UserHome" component={UserHomeScreen} />
            <Stack.Screen name="VendorHome" component={VendorHomeScreen} />
            <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
            <Stack.Screen name="GarmentGallery" component={GarmentGalleryScreen} />
            <Stack.Screen name="GarmentDetail" component={GarmentDetailScreen} />
            <Stack.Screen name="Looks" component={LooksScreenByRole} />
            <Stack.Screen name="LookDetail" component={LookDetailScreen} />
            <Stack.Screen name="CreateLookPreview" component={CreateLookPreviewScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="InventoryManagement" component={InventoryManagementScreen} />
            <Stack.Screen name="AddEditGarment" component={AddEditGarmentScreen} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
            <Stack.Screen name="LookModeration" component={LookModerationScreen} />
            <Stack.Screen name="VendorProfile" component={VendorProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </NetworkProvider>
  );
}
