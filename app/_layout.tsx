import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colores } from '../src/theme/colores';

const RootLayout = () => (
  <SafeAreaProvider>
    <StatusBar style="light" />
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.primarioOscuro },
        headerTintColor: colores.superficie,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profesional/[id]" options={{ title: 'Profesional' }} />
    </Stack>
  </SafeAreaProvider>
);

export default RootLayout;
