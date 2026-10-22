import { Animated } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { Accelerometer } from 'expo-sensors';
import { Medicion } from '../../utils/sensores';
import { useAcelerometro } from '../useAcelerometro';

jest.mock('expo-sensors', () => ({
  Accelerometer: {
    isAvailableAsync: jest.fn(),
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(),
  },
}));

const sensor = jest.mocked(Accelerometer);
const quieto: Medicion = { x: 0, y: 0, z: 1 };
const agitado: Medicion = { x: 1.2, y: 0.8, z: 0.6 };
const volcado: Medicion = { x: 0.9, y: 0, z: 0.4 };

let medir: (medicion: Medicion) => void;
let ahora = 1_000_000;
const quitar = jest.fn();

const valorDe = (valor: Animated.Value) =>
  (valor as unknown as { __getValue: () => number }).__getValue();

const montar = async (acciones: Parameters<typeof useAcelerometro>[0] = {}) => {
  const resultado = await renderHook(() => useAcelerometro(acciones));
  await act(async () => {});
  return resultado;
};

const medirEn = async (medicion: Medicion, avance = 0) => {
  ahora += avance;
  await act(async () => medir(medicion));
};

beforeEach(() => {
  jest.resetAllMocks();
  ahora = 1_000_000;
  jest.spyOn(Date, 'now').mockImplementation(() => ahora);
  sensor.isAvailableAsync.mockResolvedValue(true);
  sensor.addListener.mockImplementation(((escuchar: (medicion: Medicion) => void) => {
    medir = escuchar;
    return { remove: quitar };
  }) as never);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useAcelerometro', () => {
  it('se suscribe al sensor y pide una lectura cada 100 milisegundos', async () => {
    await montar();

    expect(sensor.setUpdateInterval).toHaveBeenCalledWith(100);
    expect(sensor.addListener).toHaveBeenCalledTimes(1);
  });

  it('avisa cuando el celular se agita', async () => {
    const onSacudida = jest.fn();
    await montar({ onSacudida });

    await medirEn(agitado);

    expect(onSacudida).toHaveBeenCalledTimes(1);
  });

  it('no avisa con el celular quieto', async () => {
    const onSacudida = jest.fn();
    const onVolcado = jest.fn();
    await montar({ onSacudida, onVolcado });

    await medirEn(quieto, 1000);
    await medirEn(quieto, 1000);

    expect(onSacudida).not.toHaveBeenCalled();
    expect(onVolcado).not.toHaveBeenCalled();
  });

  it('avisa cuando se inclina fuerte hacia un lado', async () => {
    const onVolcado = jest.fn();
    await montar({ onVolcado });

    await medirEn(volcado);

    expect(onVolcado).toHaveBeenCalledTimes(1);
  });

  it('avisa una sola vez mientras sigue inclinado del mismo lado', async () => {
    const onVolcado = jest.fn();
    await montar({ onVolcado });

    await medirEn(volcado);
    await medirEn(volcado, 1000);
    await medirEn(volcado, 1000);

    expect(onVolcado).toHaveBeenCalledTimes(1);
  });

  it('vuelve a avisar si se inclina hacia el otro lado', async () => {
    const onVolcado = jest.fn();
    await montar({ onVolcado });

    await medirEn(volcado);
    await medirEn({ ...volcado, x: -0.9 }, 1000);

    expect(onVolcado).toHaveBeenCalledTimes(2);
  });

  it('espera 600 milisegundos entre un aviso y el siguiente', async () => {
    const onSacudida = jest.fn();
    await montar({ onSacudida });

    await medirEn(agitado);
    await medirEn(agitado, 300);
    expect(onSacudida).toHaveBeenCalledTimes(1);

    await medirEn(agitado, 400);
    expect(onSacudida).toHaveBeenCalledTimes(2);
  });

  it('refleja la inclinación lateral entre -1 y 1', async () => {
    const { result } = await montar();

    await medirEn({ x: 0.5, y: 0, z: 0.8 });
    expect(valorDe(result.current.inclinacion)).toBe(0.5);

    await medirEn({ x: 3, y: 0, z: 0 });
    expect(valorDe(result.current.inclinacion)).toBe(1);

    await medirEn({ x: -3, y: 0, z: 0 });
    expect(valorDe(result.current.inclinacion)).toBe(-1);
  });

  it('usa las acciones más nuevas sin volver a suscribirse', async () => {
    const primera = jest.fn();
    const segunda = jest.fn();
    const { rerender } = await renderHook(
      ({ accion }: { accion: () => void }) => useAcelerometro({ onSacudida: accion }),
      { initialProps: { accion: primera } },
    );
    await act(async () => {});

    await rerender({ accion: segunda });
    await medirEn(agitado);

    expect(primera).not.toHaveBeenCalled();
    expect(segunda).toHaveBeenCalledTimes(1);
    expect(sensor.addListener).toHaveBeenCalledTimes(1);
  });

  it('deja de escuchar al desmontarse', async () => {
    const { unmount } = await montar();

    await unmount();

    expect(quitar).toHaveBeenCalledTimes(1);
  });

  it('queda como no disponible si el dispositivo no tiene acelerómetro', async () => {
    sensor.isAvailableAsync.mockResolvedValue(false);

    const { result } = await montar();

    expect(result.current.disponible).toBe(false);
    expect(sensor.addListener).not.toHaveBeenCalled();
  });

  it('queda como no disponible si el sensor falla al iniciar', async () => {
    sensor.addListener.mockImplementation(() => {
      throw new Error('sin permisos');
    });

    const { result } = await montar();

    expect(result.current.disponible).toBe(false);
  });
});
