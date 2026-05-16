import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RoleDashboard } from '../components/RoleDashboard';
import { useAuth } from '../auth/AuthContext';
import { RootStackParamList } from '../types';
import { GarmentDao } from '../core/database/daos/GarmentDao';
import { LookDao } from '../core/database/daos/LookDao';
import { FavoriteDao } from '../core/database/daos/FavoriteDao';
import { getDatabase } from '../core/database/database';
import { listAllUsers } from '../auth/firebaseUsers';

type UserProps = NativeStackScreenProps<RootStackParamList, 'UserHome'>;
type VendorProps = NativeStackScreenProps<RootStackParamList, 'VendorHome'>;
type AdminProps = NativeStackScreenProps<RootStackParamList, 'AdminHome'>;

export function UserHomeScreen({ navigation }: UserProps) {
  const auth = useAuth();
  const userName = auth.user?.name ?? 'Usuario';
  const favoriteDao = useMemo(() => new FavoriteDao(getDatabase), []);
  const lookDao = useMemo(() => new LookDao(getDatabase), []);
  const [favorites, setFavorites] = useState(0);
  const [looksCount, setLooksCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      Promise.all([favoriteDao.list(), lookDao.list()]).then(([favs, looks]) => {
        setFavorites(favs.filter((f) => f.entityType === 'garment').length);
        setLooksCount(looks.length);
      });
    }, [favoriteDao, lookDao]),
  );

  return (
    <RoleDashboard
      title="Panel Cliente"
      subtitle="Explora prendas, guarda favoritos y arma looks para tu estilo diario."
      userName={userName}
      stats={[
        { label: 'Favoritos', value: String(favorites) },
        { label: 'Mis looks', value: String(looksCount) },
      ]}
      quick={[
        {
          label: 'Mis looks',
          hint: 'Combinaciones guardadas.',
          onPress: () => navigation.navigate('Looks'),
        },
        {
          label: 'Favoritos',
          hint: 'Prendas guardadas.',
          onPress: () => navigation.navigate('Favorites'),
        },
        {
          label: 'Crear nuevo look',
          hint: 'Selecciona prendas y combina.',
          onPress: () => navigation.navigate('GarmentGallery', { selectionMode: true }),
        },
      ]}
      primaryActionLabel="Explorar catalogo"
      onPrimaryAction={() => navigation.navigate('GarmentGallery')}
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
  const garmentDao = useMemo(() => new GarmentDao(getDatabase), []);
  const [total, setTotal] = useState(0);
  const [low, setLow] = useState(0);

  useFocusEffect(
    useCallback(() => {
      garmentDao.list().then((rows) => {
        setTotal(rows.length);
        setLow(rows.filter((g) => g.stock > 0 && g.stock <= 5).length);
      });
    }, [garmentDao]),
  );

  return (
    <RoleDashboard
      title="Panel Vendedor"
      subtitle="Gestiona inventario, publicaciones y disponibilidad de prendas."
      userName={userName}
      stats={[
        { label: 'Prendas activas', value: String(total) },
        { label: 'Stock bajo', value: String(low) },
      ]}
      quick={[
        {
          label: 'Gestionar inventario',
          hint: 'Editar, eliminar y revisar stock.',
          onPress: () => navigation.navigate('InventoryManagement'),
        },
        {
          label: 'Agregar prenda',
          hint: 'Publica un nuevo articulo.',
          onPress: () => navigation.navigate('AddEditGarment'),
        },
        {
          label: 'Ver catalogo publico',
          hint: 'Como lo ven los clientes.',
          onPress: () => navigation.navigate('GarmentGallery'),
        },
        {
          label: 'Inspiraciones',
          hint: 'Tus looks y referencias.',
          onPress: () => navigation.navigate('Looks'),
        },
      ]}
      primaryActionLabel="Gestionar inventario"
      onPrimaryAction={() => navigation.navigate('InventoryManagement')}
      secondaryActionLabel="+ Agregar prenda"
      onSecondaryAction={() => navigation.navigate('AddEditGarment')}
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
  const [usersCount, setUsersCount] = useState(0);
  const [vendorsCount, setVendorsCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      listAllUsers()
        .then((users) => {
          setUsersCount(users.length);
          setVendorsCount(users.filter((u) => u.role === 'vendor').length);
        })
        .catch(() => {
          setUsersCount(0);
          setVendorsCount(0);
        });
    }, []),
  );

  return (
    <RoleDashboard
      title="Panel Administrador"
      subtitle="Supervisa usuarios, vendedores y calidad del catalogo global."
      userName={userName}
      stats={[
        { label: 'Usuarios', value: String(usersCount) },
        { label: 'Vendedores', value: String(vendorsCount) },
      ]}
      quick={[
        {
          label: 'Gestion de usuarios',
          hint: 'Cambiar roles y eliminar perfiles.',
          onPress: () => navigation.navigate('UserManagement'),
        },
        {
          label: 'Moderacion de looks',
          hint: 'Revisa y modera looks del sistema.',
          onPress: () => navigation.navigate('LookModeration'),
        },
        {
          label: 'Reportes',
          hint: 'Estadisticas del sistema.',
          onPress: () => navigation.navigate('AdminReports'),
        },
        {
          label: 'Catalogo global',
          hint: 'Ver inventario completo.',
          onPress: () => navigation.navigate('GarmentGallery'),
        },
      ]}
      primaryActionLabel="Gestionar usuarios"
      onPrimaryAction={() => navigation.navigate('UserManagement')}
      secondaryActionLabel="Ver reportes"
      onSecondaryAction={() => navigation.navigate('AdminReports')}
      onLogout={() => {
        auth.logout();
        navigation.replace('Login');
      }}
    />
  );
}
