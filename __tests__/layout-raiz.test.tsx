import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import RootLayout from '../app/_layout';
import { useTurnosStore } from '../src/store/turnos';

const mockCargar = jest.fn();

jest.mock('expo-router', () => {
  const { Text: Texto } = require('react-native');
  const Stack = () => <Texto>navegación lista</Texto>;
  Stack.Screen = () => null;
  return { Stack };
});
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('../src/db/reservas');

beforeEach(() => {
  jest.clearAllMocks();
  mockCargar.mockResolvedValue(undefined);
  useTurnosStore.setState({ reservas: [], cargada: false, cargar: mockCargar });
});

describe('RootLayout', () => {
  it('muestra la pantalla de carga hasta que se abre la base', async () => {
    await render(<RootLayout />);

    expect(screen.getByText('Abriendo tus turnos...')).toBeOnTheScreen();
    expect(screen.queryByText('navegación lista')).toBeNull();
  });

  it('empieza a cargar las reservas guardadas al abrirse', async () => {
    await render(<RootLayout />);

    expect(mockCargar).toHaveBeenCalledTimes(1);
  });

  it('muestra la navegación cuando las reservas ya se cargaron', async () => {
    useTurnosStore.setState({ cargada: true });

    await render(<RootLayout />);

    expect(screen.getByText('navegación lista')).toBeOnTheScreen();
    expect(screen.queryByText('Abriendo tus turnos...')).toBeNull();
  });

  it('pasa de la carga a la navegación cuando termina de cargar', async () => {
    await render(<RootLayout />);
    expect(screen.getByText('Abriendo tus turnos...')).toBeOnTheScreen();

    await screen.rerender(<RootLayout />);
    useTurnosStore.setState({ cargada: true });

    expect(await screen.findByText('navegación lista')).toBeOnTheScreen();
  });
});
