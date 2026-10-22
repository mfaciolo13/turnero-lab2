import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { tema } from '../src/theme/tema';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

const Navegacion = () => {
  const { colores } = useTheme();

  return (
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
      <Stack.Screen name="turno/[id]" options={{ title: 'Comprobante' }} />
      <Stack.Screen
        name="camara"
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
    </Stack>
  );
};

const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={tema}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Navegacion />
      </SafeAreaProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default RootLayout;
