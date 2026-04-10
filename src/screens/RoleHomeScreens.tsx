import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RoleDashboard } from '../components/RoleDashboard';
import { useAuth } from '../auth/AuthContext';
import { RootStackParamList } from '../types';

type UserProps = NativeStackScreenProps<RootStackParamList, 'UserHome'>;
type VendorProps = NativeStackScreenProps<RootStackParamList, 'VendorHome'>;
type AdminProps = NativeStackScreenProps<RootStackParamList, 'AdminHome'>;

export function UserHomeScreen({ navigation }: UserProps) {
  const auth = useAuth();
  const userName = auth.user?.name ?? 'Usuario';

  return (
    <RoleDashboard
      title="Panel Usuario"
      subtitle="Explora prendas y arma looks para tu estilo diario."
      userName={userName}
      stats={[
        { label: 'Favoritos', value: '12' },
        { label: 'Looks', value: '4' },
      ]}
      quick={[
        { label: 'Mis looks', hint: 'Combinaciones guardadas.' },
        { label: 'Tendencias', hint: 'Inspiracion semanal.' },
      ]}
      primaryActionLabel="Explorar catalogo"
      onPrimaryAction={() => navigation.navigate('GarmentGallery')}
      secondaryActionLabel="Ver base de datos"
      onSecondaryAction={() => navigation.navigate('DatabaseInspector')}
      onLogout={() => {
        auth.logout();
        navigation.replace('Login');
      }}
    />
  );
}

export function VendorHomeScreen({ navigation }: VendorProps) {
  const auth = useAuth();
  const userName = auth.user?.name ?? 'Vendedor';

  return (
    <RoleDashboard
      title="Panel Vendedor"
      subtitle="Gestiona inventario, publicaciones y disponibilidad de prendas."
      userName={userName}
      stats={[
        { label: 'Prendas activas', value: '38' },
        { label: 'Stock bajo', value: '5' },
      ]}
      quick={[
        { label: 'Inventario', hint: 'Revision de existencias.' },
        { label: 'Publicaciones', hint: 'Catalogo publicado.' },
      ]}
      primaryActionLabel="Ir al catalogo"
      onPrimaryAction={() => navigation.navigate('GarmentGallery')}
      secondaryActionLabel="Ver base de datos"
      onSecondaryAction={() => navigation.navigate('DatabaseInspector')}
      onLogout={() => {
        auth.logout();
        navigation.replace('Login');
      }}
    />
  );
}

export function AdminHomeScreen({ navigation }: AdminProps) {
  const auth = useAuth();
  const userName = auth.user?.name ?? 'Administrador';

  return (
    <RoleDashboard
      title="Panel Administrador"
      subtitle="Supervisa usuarios, vendedores y calidad del catalogo global."
      userName={userName}
      stats={[
        { label: 'Usuarios', value: '124' },
        { label: 'Vendedores', value: '16' },
      ]}
      quick={[
        { label: 'Moderacion', hint: 'Control de contenido.' },
        { label: 'Reportes', hint: 'Resumen del sistema.' },
      ]}
      primaryActionLabel="Ver catalogo completo"
      onPrimaryAction={() => navigation.navigate('GarmentGallery')}
      secondaryActionLabel="Ver base de datos"
      onSecondaryAction={() => navigation.navigate('DatabaseInspector')}
      onLogout={() => {
        auth.logout();
        navigation.replace('Login');
      }}
    />
  );
}