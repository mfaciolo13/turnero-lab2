import { Alert, AlertButton, Linking, Platform } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useUbicacion } from '../useUbicacion';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

const ubicacion = jest.mocked(Location);

const posicion = (latitude: number, longitude: number) => ({ coords: { latitude, longitude } });

const buscar = async () => {
  const resultado = await renderHook(() => useUbicacion());
  await act(async () => {
    await resultado.result.current.buscar();
  });
  return resultado;
};

const botonesDeAlerta = () => jest.mocked(Alert.alert).mock.calls[0][2] as AlertButton[];

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(Linking, 'openSettings').mockResolvedValue();
  ubicacion.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
  ubicacion.hasServicesEnabledAsync.mockResolvedValue(true);
  ubicacion.getCurrentPositionAsync.mockResolvedValue(posicion(-31.41, -64.18) as never);
  ubicacion.reverseGeocodeAsync.mockResolvedValue([
    { city: 'Córdoba', subregion: 'Capital', region: 'Córdoba', country: 'Argentina' },
  ] as never);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useUbicacion sin permiso', () => {
  it('avisa y ofrece abrir los ajustes', async () => {
    ubicacion.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);

    const { result } = await buscar();

    expect(Alert.alert).toHaveBeenCalledWith(
      'Sin permiso de ubicación',
      expect.any(String),
      expect.any(Array),
    );
    expect(botonesDeAlerta().map((boton) => boton.text)).toEqual(['Ahora no', 'Abrir ajustes']);
    expect(result.current.ubicacion).toBeNull();
  });

  it('no busca la posición si falta el permiso', async () => {
    ubicacion.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);

    await buscar();

    expect(ubicacion.hasServicesEnabledAsync).not.toHaveBeenCalled();
    expect(ubicacion.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('abre los ajustes de la app desde el aviso', async () => {
    ubicacion.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);
    await buscar();

    botonesDeAlerta()[1].onPress?.();

    expect(Linking.openSettings).toHaveBeenCalledTimes(1);
  });
});

describe('useUbicacion con el GPS apagado', () => {
  beforeEach(() => {
    ubicacion.hasServicesEnabledAsync.mockResolvedValue(false);
  });

  it('avisa que hay que encender la ubicación', async () => {
    const { result } = await buscar();

    expect(Alert.alert).toHaveBeenCalledWith('GPS apagado', expect.any(String), expect.any(Array));
    expect(result.current.ubicacion).toBeNull();
  });

  it('no pide la posición', async () => {
    await buscar();

    expect(ubicacion.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('lleva a los ajustes de ubicación de Android desde el aviso', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const intent = jest.spyOn(Linking, 'sendIntent').mockResolvedValue();
    await buscar();

    botonesDeAlerta()[1].onPress?.();

    expect(intent).toHaveBeenCalledWith('android.settings.LOCATION_SOURCE_SETTINGS');
  });

  it('abre los ajustes generales si Android no puede abrir los de ubicación', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    jest.spyOn(Linking, 'sendIntent').mockRejectedValue(new Error('sin pantalla'));
    await buscar();

    botonesDeAlerta()[1].onPress?.();
    await act(async () => {});

    expect(Linking.openSettings).toHaveBeenCalledTimes(1);
  });

  it('abre los ajustes generales en iOS', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    await buscar();

    botonesDeAlerta()[1].onPress?.();

    expect(Linking.openSettings).toHaveBeenCalledTimes(1);
  });
});

describe('useUbicacion con todo en orden', () => {
  it('pide la posición con precisión equilibrada', async () => {
    await buscar();

    expect(ubicacion.getCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: 3 });
  });

  it('guarda las coordenadas y el nombre del lugar', async () => {
    const { result } = await buscar();

    expect(result.current.ubicacion).toEqual({
      latitude: -31.41,
      longitude: -64.18,
      lugar: 'Córdoba, Córdoba, Argentina',
    });
  });

  it('usa la subregión cuando no hay ciudad', async () => {
    ubicacion.reverseGeocodeAsync.mockResolvedValue([
      { city: null, subregion: 'Capital', region: 'Córdoba', country: 'Argentina' },
    ] as never);

    const { result } = await buscar();

    expect(result.current.ubicacion?.lugar).toBe('Capital, Córdoba, Argentina');
  });

  it('se queda con las coordenadas si no se puede averiguar el nombre', async () => {
    ubicacion.reverseGeocodeAsync.mockRejectedValue(new Error('sin internet'));

    const { result } = await buscar();

    expect(result.current.ubicacion).toEqual({
      latitude: -31.41,
      longitude: -64.18,
      lugar: undefined,
    });
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('deja el lugar sin definir si la dirección vino vacía', async () => {
    ubicacion.reverseGeocodeAsync.mockResolvedValue([{}] as never);

    const { result } = await buscar();

    expect(result.current.ubicacion?.lugar).toBeUndefined();
  });

  it('empieza sin ubicación y sin buscar', async () => {
    const { result } = await renderHook(() => useUbicacion());

    expect(result.current.ubicacion).toBeNull();
    expect(result.current.buscando).toBe(false);
  });

  it('marca que está buscando mientras espera la posición', async () => {
    let terminar: (valor: unknown) => void = () => {};
    ubicacion.getCurrentPositionAsync.mockReturnValue(
      new Promise((resolver) => {
        terminar = resolver;
      }) as never,
    );
    const { result } = await renderHook(() => useUbicacion());

    let busqueda: Promise<void> = Promise.resolve();
    await act(async () => {
      busqueda = result.current.buscar();
    });
    expect(result.current.buscando).toBe(true);

    await act(async () => {
      terminar(posicion(-31.41, -64.18));
      await busqueda;
    });
    expect(result.current.buscando).toBe(false);
  });
});

describe('useUbicacion cuando falla', () => {
  beforeEach(() => {
    ubicacion.getCurrentPositionAsync.mockRejectedValue(new Error('sin señal'));
  });

  it('avisa que no se pudo obtener la ubicación', async () => {
    await buscar();

    expect(Alert.alert).toHaveBeenCalledWith(
      'No se pudo obtener la ubicación',
      'Probá de nuevo, cerca de una ventana o al aire libre.',
    );
  });

  it('deja de mostrar que está buscando', async () => {
    const { result } = await buscar();

    expect(result.current.buscando).toBe(false);
    expect(result.current.ubicacion).toBeNull();
  });
});
