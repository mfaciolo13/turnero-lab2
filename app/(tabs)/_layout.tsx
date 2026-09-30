import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../../src/theme/colores';

const TabsLayout = () => (
  <Tabs
    screenOptions={{
      headerStyle: { backgroundColor: colores.primarioOscuro },
      headerTintColor: colores.superficie,
      headerTitleStyle: { fontWeight: '700' },
      tabBarActiveTintColor: colores.primario,
      tabBarInactiveTintColor: colores.textoSuave,
      tabBarStyle: { backgroundColor: colores.superficie, borderTopColor: colores.borde },
    }}
  >
    <Tabs.Screen
      name="index"
      options={{
        title: 'Agenda',
        headerShown: false,
        tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
      }}
    />
    <Tabs.Screen
      name="especialidades"
      options={{
        title: 'Especialidades',
        tabBarIcon: ({ color, size }) => <Ionicons name="medkit" size={size} color={color} />,
      }}
    />
    <Tabs.Screen
      name="info"
      options={{
        title: 'El centro',
        tabBarIcon: ({ color, size }) => <Ionicons name="business" size={size} color={color} />,
      }}
    />
  </Tabs>
);

export default TabsLayout;
