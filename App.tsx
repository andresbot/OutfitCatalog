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
import { RootStackParamList } from './src/types';
import { initDependencies } from './src/core/di/injectionContainer';

initDependencies();

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="UserHome" component={UserHomeScreen} />
          <Stack.Screen name="VendorHome" component={VendorHomeScreen} />
          <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
          <Stack.Screen name="GarmentGallery" component={GarmentGalleryScreen} />
          <Stack.Screen name="GarmentDetail" component={GarmentDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}