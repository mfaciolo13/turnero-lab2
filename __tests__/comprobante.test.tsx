import { Alert, Share } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { Accelerometer } from 'expo-sensors';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import Comprobante from '../app/turno/[id]';
import { useTurnosStore } from '../src/store/turnos';
import { Paciente, Reserva } from '../src/types';

const mockRouter = { push: jest.fn(), back: jest.fn() };
let mockParams: { id?: string } = { id: '1-09:00' };
let mockPaciente: Paciente | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
  Stack: { Screen: () => null },
}));
jest.mock('../src/hooks/useFicha', () => ({ usePaciente: () => ({ data: mockPaciente }) }));
jest.mock('../src/db/reservas');
jest.mock('../src/utils/archivos', () => ({
  conservarImagen: jest.fn(async (uri: string) => `guardada:${uri}`),
}));
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));
jest.mock('expo-sensors', () => ({
  Accelerometer: {
    isAvailableAsync: jest.fn(),
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(),
  },
}));

const picker = jest.mocked(ImagePicker);
const compartir = jest.mocked(Sharing);
const sensor = jest.mocked(Accelerometer);

const reserva: Reserva = {
  id: '1-09:00',
  pacienteId: 2,
  profesionalId: 1,
  profesional: 'Dra. Emily Johnson',
  especialidad: 'Pediatria',
  consultorio: 'Consultorio 2 - Primer piso',
  foto: 'https://dummyjson.com/icon/emilys/128',
  hora: '09:00',
  orden: null,
};

const lucia: Paciente = {
  id: 2,
  nombre: 'Lucia',
  parentesco: 'Hija',
  obraSocial: 'OSDE',
  afiliado: '123456',
};

let medir: (medicion: { x: number; y: number; z: number }) => void;

const montar = async () => {
  await render(<Comprobante />);
  await act(async () => {});
};

const botonesDeAlerta = (llamada: number) =>
  (jest.mocked(Alert.alert).mock.calls[llamada][2] ?? []) as { text?: string }[];

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = { id: '1-09:00' };
  mockPaciente = lucia;
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
  require('../src/db/reservas').guardarOrden.mockResolvedValue(undefined);
  sensor.isAvailableAsync.mockResolvedValue(true);
  sensor.addListener.mockImplementation(((escuchar: typeof medir) => {
    medir = escuchar;
    return { remove: jest.fn() };
  }) as never);
  compartir.isAvailableAsync.mockResolvedValue(true);
  useTurnosStore.setState({ reservas: [reserva], cargada: true, pacienteActivo: 1 });
});

describe('Comprobante de un turno que no existe', () => {
  it('avisa que no se encontró el turno y ofrece volver', async () => {
    mockParams = { id: '9-99:99' };

    await montar();

    expect(screen.getByText(/No encontramos ese turno/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Ir a Mis turnos'));
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });
});

describe('Comprobante', () => {
  it('muestra los datos del turno y del paciente', async () => {
    await montar();

    expect(screen.getByText('Dra. Emily Johnson')).toBeOnTheScreen();
    expect(screen.getByText('Hoy a las 09:00 hs')).toBeOnTheScreen();
    expect(screen.getByTestId('paciente')).toHaveTextContent('Lucia (Hija)');
  });

  it('muestra el sello inicial', async () => {
    await montar();

    expect(screen.getByTestId('sello')).toHaveTextContent('✅');
  });
});

describe('Orden médica desde la cámara', () => {
  it('abre la cámara indicando a qué turno pertenece la foto', async () => {
    await montar();

    await fireEvent.press(screen.getByTestId('boton-camara'));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/camara',
      params: { reservaId: '1-09:00' },
    });
  });
});

describe('Orden médica desde la galería', () => {
  it('manda a los ajustes si no hay permiso para ver las fotos', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false } as never);
    await montar();

    await fireEvent.press(screen.getByTestId('boton-galeria'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Sin acceso a las fotos',
      expect.any(String),
      expect.any(Array),
    );
    expect(botonesDeAlerta(0).map((boton) => boton.text)).toEqual(['Ahora no', 'Abrir ajustes']);
    expect(picker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it('adjunta la foto elegida a la reserva', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///galeria/orden.jpg' }],
    } as never);
    await montar();

    await fireEvent.press(screen.getByTestId('boton-galeria'));

    await waitFor(() => expect(screen.getByTestId('imagen-orden')).toBeOnTheScreen());
    expect(useTurnosStore.getState().reservas[0].orden).toBe('guardada:file:///galeria/orden.jpg');
    expect(picker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });
  });

  it('no cambia nada si el usuario cierra la galería sin elegir', async () => {
    picker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true } as never);
    picker.launchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: null } as never);
    await montar();

    await fireEvent.press(screen.getByTestId('boton-galeria'));

    expect(useTurnosStore.getState().reservas[0].orden).toBeNull();
    expect(screen.getByText('Sin orden adjunta')).toBeOnTheScreen();
  });
});

describe('Compartir el comprobante como imagen', () => {
  it('saca una captura de la tarjeta y la comparte como png', async () => {
    jest.mocked(captureRef).mockResolvedValue('file:///captura.png');
    await montar();

    await fireEvent.press(screen.getByTestId('boton-compartir-imagen'));

    expect(captureRef).toHaveBeenCalledWith(expect.anything(), { format: 'png', quality: 1 });
    expect(compartir.shareAsync).toHaveBeenCalledWith('file:///captura.png', {
      mimeType: 'image/png',
      dialogTitle: 'Compartir comprobante',
    });
  });

  it('avisa si el dispositivo no puede compartir y no saca la captura', async () => {
    compartir.isAvailableAsync.mockResolvedValue(false);
    await montar();

    await fireEvent.press(screen.getByTestId('boton-compartir-imagen'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'No se puede compartir acá',
      'Probá desde el celular.',
    );
    expect(captureRef).not.toHaveBeenCalled();
  });

  it('avisa si falla la captura', async () => {
    jest.mocked(captureRef).mockRejectedValue(new Error('vista no disponible'));
    await montar();

    await fireEvent.press(screen.getByTestId('boton-compartir-imagen'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'No se pudo compartir el comprobante',
      'Probá de nuevo.',
    );
    expect(compartir.shareAsync).not.toHaveBeenCalled();
  });
});

describe('Compartir solo el texto', () => {
  it('comparte los datos del turno y del paciente', async () => {
    await montar();

    await fireEvent.press(screen.getByTestId('boton-compartir-texto'));

    const { message } = jest.mocked(Share.share).mock.calls[0][0];
    expect(message).toContain('Dra. Emily Johnson - Pediatria');
    expect(message).toContain('Hoy a las 09:00 hs');
    expect(message).toContain('Paciente: Lucia');
  });
});

describe('Firma del paciente', () => {
  const firmar = async () => {
    const pad = screen.getByTestId('firma-pad');
    await fireEvent(pad, 'touchStart', { nativeEvent: { locationX: 10, locationY: 10 } });
    await fireEvent(pad, 'touchMove', { nativeEvent: { locationX: 60, locationY: 30 } });
  };

  it('no ofrece borrar la firma mientras está vacía', async () => {
    await montar();

    expect(screen.queryByTestId('boton-borrar-firma')).toBeNull();
  });

  it('ofrece borrar la firma apenas se firma', async () => {
    await montar();

    await firmar();

    expect(screen.getByTestId('boton-borrar-firma')).toBeOnTheScreen();
    expect(screen.getAllByTestId('segmento-firma').length).toBeGreaterThan(0);
  });

  it('borra la firma y vuelve a invitar a firmar', async () => {
    await montar();
    await firmar();

    await fireEvent.press(screen.getByTestId('boton-borrar-firma'));

    expect(screen.queryAllByTestId('segmento-firma')).toHaveLength(0);
    expect(screen.getByText('Firmá acá con el dedo')).toBeOnTheScreen();
    expect(screen.queryByTestId('boton-borrar-firma')).toBeNull();
  });
});

describe('Sensor de movimiento', () => {
  it('explica los gestos cuando el celular tiene acelerómetro', async () => {
    await montar();

    expect(screen.getByText(/agitalo para cambiar el sello/)).toBeOnTheScreen();
  });

  it('avisa cuando el dispositivo no tiene acelerómetro', async () => {
    sensor.isAvailableAsync.mockResolvedValue(false);

    await montar();

    expect(screen.getByText('Este dispositivo no tiene acelerómetro')).toBeOnTheScreen();
  });

  it('cambia el sello al agitar el celular', async () => {
    await montar();
    const antes = screen.getByTestId('sello').props.children;

    await act(async () => medir({ x: 1.2, y: 0.8, z: 0.6 }));

    expect(screen.getByTestId('sello').props.children).not.toBe(antes);
  });

  it('cambia el sello al inclinar fuerte el celular', async () => {
    await montar();
    const antes = screen.getByTestId('sello').props.children;

    await act(async () => medir({ x: 0.9, y: 0, z: 0.4 }));

    expect(screen.getByTestId('sello').props.children).not.toBe(antes);
  });

  it('mantiene el sello con el celular quieto', async () => {
    await montar();
    const antes = screen.getByTestId('sello').props.children;

    await act(async () => medir({ x: 0, y: 0, z: 1 }));

    expect(screen.getByTestId('sello').props.children).toBe(antes);
  });
});
