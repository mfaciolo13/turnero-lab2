import { Alert, AlertButton, Linking, Platform } from 'react-native';
import {
  abrirAjustesUbicacion,
  avisar,
  avisarGpsApagado,
  confirmar,
  pedirAjustes,
} from '../dialogos';

const ventana = globalThis as unknown as {
  window: { alert: jest.Mock; confirm: jest.Mock };
};

const botones = () => jest.mocked(Alert.alert).mock.calls[0][2] as AlertButton[];

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(Linking, 'openSettings').mockResolvedValue();
  ventana.window = { alert: jest.fn(), confirm: jest.fn() };
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('avisar', () => {
  it('usa la alerta nativa en el celular', () => {
    avisar('Hola', 'Mensaje');

    expect(Alert.alert).toHaveBeenCalledWith('Hola', 'Mensaje');
  });

  it('usa la alerta del navegador en la web', () => {
    jest.replaceProperty(Platform, 'OS', 'web');

    avisar('Hola', 'Mensaje');

    expect(ventana.window.alert).toHaveBeenCalledWith('Hola\n\nMensaje');
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});

describe('confirmar en el celular', () => {
  it('ofrece volver o confirmar', () => {
    confirmar('Cancelar', '¿Seguro?', jest.fn());

    expect(Alert.alert).toHaveBeenCalledWith('Cancelar', '¿Seguro?', expect.any(Array));
    expect(botones().map((boton) => boton.text)).toEqual(['Volver', 'Confirmar']);
  });

  it('ejecuta la acción solo al confirmar', () => {
    const accion = jest.fn();
    confirmar('Cancelar', '¿Seguro?', accion);

    botones()[0].onPress?.();
    expect(accion).not.toHaveBeenCalled();

    botones()[1].onPress?.();
    expect(accion).toHaveBeenCalledTimes(1);
  });
});

describe('confirmar en la web', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'web');
  });

  it('ejecuta la acción si el usuario acepta', () => {
    ventana.window.confirm.mockReturnValue(true);
    const accion = jest.fn();

    confirmar('Cancelar', '¿Seguro?', accion);

    expect(ventana.window.confirm).toHaveBeenCalledWith('Cancelar\n\n¿Seguro?');
    expect(accion).toHaveBeenCalledTimes(1);
  });

  it('no hace nada si el usuario rechaza', () => {
    ventana.window.confirm.mockReturnValue(false);
    const accion = jest.fn();

    confirmar('Cancelar', '¿Seguro?', accion);

    expect(accion).not.toHaveBeenCalled();
  });
});

describe('pedirAjustes', () => {
  it('ofrece abrir los ajustes de la app', () => {
    pedirAjustes('Sin permiso', 'Activalo en Ajustes.');

    expect(botones().map((boton) => boton.text)).toEqual(['Ahora no', 'Abrir ajustes']);
    expect(botones()[0].style).toBe('cancel');
  });

  it('abre los ajustes solo desde el botón correspondiente', () => {
    pedirAjustes('Sin permiso', 'Activalo en Ajustes.');

    expect(Linking.openSettings).not.toHaveBeenCalled();
    botones()[1].onPress?.();
    expect(Linking.openSettings).toHaveBeenCalledTimes(1);
  });

  it('usa la alerta del navegador en la web', () => {
    jest.replaceProperty(Platform, 'OS', 'web');

    pedirAjustes('Sin permiso', 'Activalo en Ajustes.');

    expect(ventana.window.alert).toHaveBeenCalledWith('Sin permiso\n\nActivalo en Ajustes.');
  });
});

describe('abrirAjustesUbicacion', () => {
  it('abre la pantalla de ubicación en Android', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const intent = jest.spyOn(Linking, 'sendIntent').mockResolvedValue();

    abrirAjustesUbicacion();

    expect(intent).toHaveBeenCalledWith('android.settings.LOCATION_SOURCE_SETTINGS');
    expect(Linking.openSettings).not.toHaveBeenCalled();
  });

  it('cae en los ajustes generales si Android no puede', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    jest.spyOn(Linking, 'sendIntent').mockRejectedValue(new Error('sin pantalla'));

    abrirAjustesUbicacion();
    await Promise.resolve();
    await Promise.resolve();

    expect(Linking.openSettings).toHaveBeenCalledTimes(1);
  });

  it('abre los ajustes generales en iOS', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');

    abrirAjustesUbicacion();

    expect(Linking.openSettings).toHaveBeenCalledTimes(1);
  });
});

describe('avisarGpsApagado', () => {
  it('ofrece abrir los ajustes de ubicación', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const intent = jest.spyOn(Linking, 'sendIntent').mockResolvedValue();

    avisarGpsApagado();
    botones()[1].onPress?.();

    expect(Alert.alert).toHaveBeenCalledWith('GPS apagado', expect.any(String), expect.any(Array));
    expect(intent).toHaveBeenCalledTimes(1);
  });

  it('usa la alerta del navegador en la web', () => {
    jest.replaceProperty(Platform, 'OS', 'web');

    avisarGpsApagado();

    expect(ventana.window.alert).toHaveBeenCalledWith(
      'GPS apagado\n\nEncendé la ubicación del dispositivo.',
    );
  });
});
