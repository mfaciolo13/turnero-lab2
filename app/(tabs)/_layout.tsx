import { Tabs } from 'expo-router';
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
    <Tabs.Screen name="index" options={{ title: 'Agenda', headerShown: false }} />
    <Tabs.Screen name="especialidades" options={{ title: 'Especialidades' }} />
    <Tabs.Screen name="info" options={{ title: 'El centro' }} />
  </Tabs>
);

export default TabsLayout;
