import { Alert, AlertButton } from 'react-native';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import Ficha from '../app/(tabs)/ficha';
import { crearPaciente, guardarAtributo, listarAtributos } from '../src/db/ficha';
import { useTurnosStore } from '../src/store/turnos';
import { renderConConsultas } from '../src/test/conConsultas';

jest.mock('expo-sqlite', () => require('../src/test/sqliteEnMemoria'));

const confirmarAlerta = async (texto: string) => {
  const botones = jest.mocked(Alert.alert).mock.calls[0][2] as AlertButton[];
  await act(async () => botones.find((boton) => boton.text === texto)?.onPress?.());
};

const escribir = async (campo: string, valor: string) => {
  await fireEvent.changeText(screen.getByTestId('input-campo'), campo);
  await fireEvent.changeText(screen.getByTestId('input-valor'), valor);
};

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  useTurnosStore.setState({ reservas: [], cargada: true, pacienteActivo: 1 });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Ficha del titular', () => {
  it('muestra los datos con los que arranca', async () => {
    await renderConConsultas(<Ficha />);

    expect(await screen.findByTestId('fila-nombre')).toBeOnTheScreen();
    expect(screen.getByTestId('fila-parentesco')).toBeOnTheScreen();
    expect(screen.getByText(/Ficha de/)).toBeOnTheScreen();
  });

  it('no ofrece borrar al titular', async () => {
    await renderConConsultas(<Ficha />);
    await screen.findByTestId('fila-nombre');

    expect(screen.queryByTestId('boton-borrar-familiar')).toBeNull();
  });

  it('agrega un dato nuevo y limpia el formulario', async () => {
    await renderConConsultas(<Ficha />);
    await screen.findByTestId('fila-nombre');

    await escribir('Grupo sanguíneo', 'A+');
    await fireEvent.press(screen.getByTestId('boton-guardar-campo'));

    expect(await screen.findByTestId('fila-grupo_sanguineo')).toBeOnTheScreen();
    expect(screen.getByText('A+')).toBeOnTheScreen();
    await waitFor(() => expect(screen.getByTestId('input-campo')).toHaveDisplayValue(''));
    expect(screen.getByTestId('input-valor')).toHaveDisplayValue('');
  });

  it('completa el campo desde una sugerencia', async () => {
    await renderConConsultas(<Ficha />);
    await screen.findByTestId('fila-nombre');

    await fireEvent.press(screen.getByTestId('sugerencia-contacto_emergencia'));

    expect(screen.getByTestId('input-campo')).toHaveDisplayValue('Contacto emergencia');
  });

  it('actualiza un dato existente en lugar de duplicarlo', async () => {
    await guardarAtributo(1, 'obra_social', 'OSDE');
    await renderConConsultas(<Ficha />);
    await screen.findByTestId('fila-obra_social');

    await fireEvent.press(screen.getByTestId('editar-obra_social'));
    expect(screen.getByTestId('input-valor')).toHaveDisplayValue('OSDE');
    await fireEvent.changeText(screen.getByTestId('input-valor'), 'Galeno');
    await fireEvent.press(screen.getByTestId('boton-guardar-campo'));

    await waitFor(() => expect(screen.getByText('Galeno')).toBeOnTheScreen());
    expect(screen.queryByText('OSDE')).toBeNull();
    expect(screen.getAllByTestId('fila-obra_social')).toHaveLength(1);
  });

  it('puede cancelar una edición sin guardar nada', async () => {
    await guardarAtributo(1, 'medicacion', 'Ibuprofeno');
    await renderConConsultas(<Ficha />);
    await screen.findByTestId('fila-medicacion');

    await fireEvent.press(screen.getByTestId('editar-medicacion'));
    await fireEvent.changeText(screen.getByTestId('input-valor'), 'Otra cosa');
    await fireEvent.press(screen.getByTestId('boton-cancelar-edicion'));

    expect(screen.getByText('Ibuprofeno')).toBeOnTheScreen();
    expect(screen.queryByText('Otra cosa')).toBeNull();
    expect(screen.getByTestId('input-valor')).toHaveDisplayValue('');
  });

  it('pide confirmación antes de borrar un dato', async () => {
    await guardarAtributo(1, 'alergias', 'Polen');
    await renderConConsultas(<Ficha />);
    await screen.findByTestId('fila-alergias');

    await fireEvent.press(screen.getByTestId('borrar-alergias'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Borrar dato',
      '¿Querés borrar "Alergias"?',
      expect.any(Array),
    );
    expect(screen.getByTestId('fila-alergias')).toBeOnTheScreen();
  });

  it('borra el dato al confirmar', async () => {
    await guardarAtributo(1, 'alergias', 'Polen');
    await renderConConsultas(<Ficha />);
    await screen.findByTestId('fila-alergias');
    await fireEvent.press(screen.getByTestId('borrar-alergias'));

    await confirmarAlerta('Confirmar');

    await waitFor(() => expect(screen.queryByTestId('fila-alergias')).toBeNull());
    expect((await listarAtributos(1)).map((atributo) => atributo.attribute)).not.toContain(
      'alergias',
    );
  });
});

describe('Familiares', () => {
  it('agrega un familiar, lo selecciona y muestra su ficha vacía', async () => {
    await renderConConsultas(<Ficha />);
    await screen.findByTestId('fila-nombre');

    await fireEvent.press(screen.getByTestId('agregar-familiar'));
    await fireEvent.changeText(screen.getByTestId('input-nombre-familiar'), 'Valentina');
    await fireEvent.changeText(screen.getByTestId('input-parentesco-familiar'), 'Hija');
    await fireEvent.press(screen.getByTestId('boton-crear-familiar'));

    expect(await screen.findByText('Ficha de Valentina')).toBeOnTheScreen();
    expect(await screen.findByTestId('fila-nombre')).toHaveTextContent(/Valentina/);
    expect(screen.getByTestId('fila-parentesco')).toHaveTextContent(/Hija/);
    expect(screen.queryByTestId('input-nombre-familiar')).toBeNull();
    expect(useTurnosStore.getState().pacienteActivo).toBeGreaterThan(1);
  });

  it('muestra los datos de cada persona al cambiar de seleccionado', async () => {
    const id = await crearPaciente('Tomas', 'Hijo');
    await guardarAtributo(id, 'alergias', 'Ninguna');
    await renderConConsultas(<Ficha />);
    await screen.findByTestId('fila-nombre');

    await fireEvent.press(await screen.findByTestId(`paciente-${id}`));

    expect(await screen.findByText('Ficha de Tomas')).toBeOnTheScreen();
    expect(await screen.findByTestId('fila-alergias')).toBeOnTheScreen();

    await fireEvent.press(screen.getByTestId('paciente-1'));

    await waitFor(() => expect(screen.queryByText('Ficha de Tomas')).toBeNull());
    expect(screen.queryByTestId('fila-alergias')).toBeNull();
  });

  it('ofrece borrar a un familiar pero no al titular', async () => {
    const id = await crearPaciente('Camila', 'Sobrina');
    useTurnosStore.setState({ pacienteActivo: id });

    await renderConConsultas(<Ficha />);

    expect(await screen.findByTestId('boton-borrar-familiar')).toBeOnTheScreen();
  });

  it('borra al familiar y vuelve al titular al confirmar', async () => {
    const id = await crearPaciente('Mateo', 'Sobrino');
    useTurnosStore.setState({ pacienteActivo: id });
    await renderConConsultas(<Ficha />);
    await fireEvent.press(await screen.findByTestId('boton-borrar-familiar'));

    await confirmarAlerta('Confirmar');

    await waitFor(() => expect(screen.queryByTestId(`paciente-${id}`)).toBeNull());
    expect(useTurnosStore.getState().pacienteActivo).toBe(1);
  });

  it('no deja crear un familiar sin nombre', async () => {
    await renderConConsultas(<Ficha />);
    await screen.findByTestId('fila-nombre');

    await fireEvent.press(screen.getByTestId('agregar-familiar'));

    expect(screen.getByTestId('boton-crear-familiar')).toBeDisabled();
  });

  it('cierra el formulario al cancelar', async () => {
    await renderConConsultas(<Ficha />);
    await screen.findByTestId('fila-nombre');
    await fireEvent.press(screen.getByTestId('agregar-familiar'));

    await fireEvent.press(screen.getAllByText('Cancelar')[0]);

    expect(screen.queryByTestId('input-nombre-familiar')).toBeNull();
  });
});
