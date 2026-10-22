import { Alert, Linking } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import Info from '../app/(tabs)/info';
import { useTurnosStore } from '../src/store/turnos';

jest.mock('expo-router', () => {
  const { Text } = require('react-native');
  return { Link: ({ children }: { children: string }) => <Text>{children}</Text> };
});
jest.mock('../src/hooks/useProfesionales', () => ({
  useResumenEspecialidades: () => ({
    data: [{ id: 'pediatria', nombre: 'Pediatria', profesionales: 2, disponibles: 6, ocupados: 2 }],
  }),
}));
jest.mock('../src/db/reservas');
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

const ubicacion = jest.mocked(Location);

const estoyEn = (latitude: number, longitude: number) =>
  ubicacion.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude, longitude } } as never);

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  ubicacion.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
  ubicacion.hasServicesEnabledAsync.mockResolvedValue(true);
  ubicacion.reverseGeocodeAsync.mockResolvedValue([
    { city: 'Buenos Aires', region: 'Buenos Aires', country: 'Argentina' },
  ] as never);
  estoyEn(-34.6037, -58.3816);
  useTurnosStore.setState({ reservas: [], cargada: true, pacienteActivo: 1 });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('El centro', () => {
  it('muestra el nombre, la sede y el horario de atención', async () => {
    await render(<Info />);

    expect(screen.getByText('Turnero Laboratorio 2')).toBeOnTheScreen();
    expect(screen.getByText('Sede Centro - Av. Colon 1240')).toBeOnTheScreen();
    expect(screen.getByText(/Lunes a viernes de 08:00 a 20:00/)).toBeOnTheScreen();
  });

  it('abre el mapa con la dirección de la sede', async () => {
    await render(<Info />);

    await fireEvent.press(screen.getByText('Cómo llegar'));

    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://maps.google.com/?q=Av.+Colon+1240+Cordoba',
    );
  });

  it('llama por teléfono al centro', async () => {
    await render(<Info />);

    await fireEvent.press(screen.getByText('Llamar'));

    expect(Linking.openURL).toHaveBeenCalledWith('tel:+543514567890');
  });

  it('muestra las condiciones de cancelación', async () => {
    await render(<Info />);

    expect(screen.getByText('Cancelaciones')).toBeOnTheScreen();
  });
});

describe('Distancia al centro', () => {
  it('invita a buscar la ubicación antes de calcular nada', async () => {
    await render(<Info />);

    expect(screen.getByText('¿Qué tan lejos estás?')).toBeOnTheScreen();
    expect(screen.getByText('Dónde estoy')).toBeOnTheScreen();
    expect(screen.queryByTestId('distancia')).toBeNull();
  });

  it('calcula los kilómetros hasta la sede y muestra dónde estás', async () => {
    await render(<Info />);

    await fireEvent.press(screen.getByTestId('boton-ubicacion'));

    await waitFor(() => expect(screen.getByTestId('distancia')).toBeOnTheScreen());
    expect(screen.getByTestId('distancia')).toHaveTextContent(/^A 6\d\d,\d km del centro$/);
    expect(screen.getByText('Estás en Buenos Aires, Buenos Aires, Argentina')).toBeOnTheScreen();
  });

  it('muestra metros cuando estás casi en la sede', async () => {
    estoyEn(-31.4124, -64.1833);
    await render(<Info />);

    await fireEvent.press(screen.getByTestId('boton-ubicacion'));

    await waitFor(() =>
      expect(screen.getByTestId('distancia')).toHaveTextContent('A 0 m del centro'),
    );
  });

  it('muestra las coordenadas si no se pudo averiguar el nombre del lugar', async () => {
    ubicacion.reverseGeocodeAsync.mockRejectedValue(new Error('sin internet'));
    await render(<Info />);

    await fireEvent.press(screen.getByTestId('boton-ubicacion'));

    await waitFor(() => expect(screen.getByText('Estás en -34.604, -58.382')).toBeOnTheScreen());
  });

  it('muestra que está buscando y deshabilita el botón mientras tanto', async () => {
    let terminar: (valor: unknown) => void = () => {};
    ubicacion.getCurrentPositionAsync.mockReturnValue(
      new Promise((resolver) => {
        terminar = resolver;
      }) as never,
    );
    await render(<Info />);

    const pulsacion = fireEvent.press(screen.getByTestId('boton-ubicacion'));
    await waitFor(() => expect(screen.getByText('Buscando ubicación...')).toBeOnTheScreen());
    expect(screen.getByTestId('boton-ubicacion')).toBeDisabled();

    terminar({ coords: { latitude: -34.6, longitude: -58.38 } });
    await pulsacion;
    await waitFor(() => expect(screen.getByText('Dónde estoy')).toBeOnTheScreen());
  });

  it('no calcula nada si falta el permiso', async () => {
    ubicacion.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);
    await render(<Info />);

    await fireEvent.press(screen.getByTestId('boton-ubicacion'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Sin permiso de ubicación',
      expect.any(String),
      expect.any(Array),
    );
    expect(screen.queryByTestId('distancia')).toBeNull();
  });
});
