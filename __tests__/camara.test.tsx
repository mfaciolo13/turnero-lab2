import { Alert, Linking } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import Camara from '../app/camara';
import { useTurnosStore } from '../src/store/turnos';
import { Reserva } from '../src/types';

const mockRouter = { back: jest.fn() };
const mockPermiso = jest.fn();
const mockTomarFoto = jest.fn();
let mockCamaraLista = true;

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ reservaId: '1-09:00' }),
}));

jest.mock('expo-camera', () => {
  const { forwardRef, useEffect, useImperativeHandle } = require('react');
  const { View } = require('react-native');

  return {
    useCameraPermissions: () => mockPermiso(),
    CameraView: forwardRef(
      ({ facing, onCameraReady }: { facing: string; onCameraReady: () => void }, ref: unknown) => {
        useImperativeHandle(ref, () => ({ takePictureAsync: mockTomarFoto }));
        useEffect(() => {
          if (mockCamaraLista) {
            onCameraReady();
          }
        }, [onCameraReady]);
        return <View testID="vista-camara" facing={facing} />;
      },
    ),
  };
});

jest.mock('../src/db/reservas');
jest.mock('../src/utils/archivos', () => ({
  conservarImagen: jest.fn(async (uri: string) => `guardada:${uri}`),
}));

const reserva: Reserva = {
  id: '1-09:00',
  pacienteId: 1,
  profesionalId: 1,
  profesional: 'Dra. Emily Johnson',
  especialidad: 'Pediatria',
  consultorio: 'Consultorio 2',
  foto: 'https://dummyjson.com/icon/emilys/128',
  hora: '09:00',
  orden: null,
};

const concedido = [{ granted: true, canAskAgain: true }, jest.fn()];

beforeEach(() => {
  jest.clearAllMocks();
  mockCamaraLista = true;
  mockPermiso.mockReturnValue(concedido);
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(Linking, 'openSettings').mockResolvedValue();
  require('../src/db/reservas').guardarOrden.mockResolvedValue(undefined);
  useTurnosStore.setState({ reservas: [reserva], cargada: true, pacienteActivo: 1 });
});

describe('Cámara sin permiso', () => {
  it('no muestra nada mientras se consulta el permiso', async () => {
    mockPermiso.mockReturnValue([null, jest.fn()]);

    await render(<Camara />);

    expect(screen.queryByText('Necesitamos permiso para usar la cámara')).toBeNull();
    expect(screen.queryByTestId('disparador')).toBeNull();
  });

  it('pide el permiso si todavía se puede pedir', async () => {
    const pedir = jest.fn();
    mockPermiso.mockReturnValue([{ granted: false, canAskAgain: true }, pedir]);
    await render(<Camara />);

    await fireEvent.press(screen.getByText('Conceder permiso'));

    expect(pedir).toHaveBeenCalledTimes(1);
  });

  it('lleva a los ajustes si el permiso ya fue rechazado', async () => {
    mockPermiso.mockReturnValue([{ granted: false, canAskAgain: false }, jest.fn()]);
    await render(<Camara />);

    await fireEvent.press(screen.getByText('Abrir ajustes'));

    expect(Linking.openSettings).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Conceder permiso')).toBeNull();
  });

  it('permite volver sin sacar la foto', async () => {
    mockPermiso.mockReturnValue([{ granted: false, canAskAgain: true }, jest.fn()]);
    await render(<Camara />);

    await fireEvent.press(screen.getByText('Volver'));

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });
});

describe('Cámara con permiso', () => {
  it('muestra la vista de la cámara y el disparador', async () => {
    await render(<Camara />);

    expect(screen.getByTestId('vista-camara')).toBeOnTheScreen();
    expect(screen.getByTestId('disparador')).toBeOnTheScreen();
  });

  it('empieza con la cámara trasera y la gira al tocar el botón', async () => {
    await render(<Camara />);
    expect(screen.getByTestId('vista-camara')).toHaveProp('facing', 'back');

    await fireEvent.press(screen.getByTestId('girar-camara'));
    expect(screen.getByTestId('vista-camara')).toHaveProp('facing', 'front');

    await fireEvent.press(screen.getByTestId('girar-camara'));
    expect(screen.getByTestId('vista-camara')).toHaveProp('facing', 'back');
  });

  it('saca la foto, la adjunta a la reserva y vuelve', async () => {
    mockTomarFoto.mockResolvedValue({ uri: 'file:///cache/foto.jpg' });
    await render(<Camara />);

    await fireEvent.press(screen.getByTestId('disparador'));

    expect(mockTomarFoto).toHaveBeenCalledWith({ quality: 0.7 });
    expect(useTurnosStore.getState().reservas[0].orden).toBe('guardada:file:///cache/foto.jpg');
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it('no deja sacar la foto hasta que la cámara termine de iniciar', async () => {
    mockCamaraLista = false;
    await render(<Camara />);

    await fireEvent.press(screen.getByTestId('disparador'));

    expect(mockTomarFoto).not.toHaveBeenCalled();
    expect(screen.getByTestId('disparador')).toBeDisabled();
  });

  it('avisa si no se pudo sacar la foto y se queda en la cámara', async () => {
    mockTomarFoto.mockRejectedValue(new Error('sin memoria'));
    await render(<Camara />);

    await fireEvent.press(screen.getByTestId('disparador'));

    expect(Alert.alert).toHaveBeenCalledWith('No se pudo sacar la foto', 'Probá de nuevo.');
    expect(mockRouter.back).not.toHaveBeenCalled();
    expect(useTurnosStore.getState().reservas[0].orden).toBeNull();
  });

  it('cancela y vuelve sin adjuntar nada', async () => {
    await render(<Camara />);

    await act(async () => fireEvent.press(screen.getByText('Cancelar')));

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
    expect(mockTomarFoto).not.toHaveBeenCalled();
  });
});
