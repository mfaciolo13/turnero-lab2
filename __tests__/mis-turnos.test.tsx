import { Alert, AlertButton } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import MisTurnos from '../app/(tabs)/mis-turnos';
import { borrarReserva } from '../src/db/reservas';
import { useTurnosStore } from '../src/store/turnos';
import { Reserva } from '../src/types';

const mockRouter = { push: jest.fn(), navigate: jest.fn() };

jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('../src/db/reservas');

const reserva = (id: string, hora: string, extra: Partial<Reserva> = {}): Reserva => ({
  id,
  pacienteId: 1,
  profesionalId: Number(id.split('-')[0]),
  profesional: `Profesional ${id}`,
  especialidad: 'Pediatria',
  consultorio: 'Consultorio 2',
  foto: 'https://dummyjson.com/icon/emilys/128',
  hora,
  orden: null,
  ...extra,
});

const confirmarAlerta = async (texto: string) => {
  const botones = jest.mocked(Alert.alert).mock.calls[0][2] as AlertButton[];
  await act(async () => botones.find((boton) => boton.text === texto)?.onPress?.());
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.mocked(borrarReserva).mockResolvedValue(undefined);
  useTurnosStore.setState({ reservas: [], cargada: true, pacienteActivo: 1 });
});

describe('Mis turnos sin reservas', () => {
  it('avisa que todavía no hay turnos', async () => {
    await render(<MisTurnos />);

    expect(screen.getByText('Todavía no reservaste ningún turno.')).toBeOnTheScreen();
  });

  it('lleva a la agenda desde el botón', async () => {
    await render(<MisTurnos />);

    await fireEvent.press(screen.getByText('Ir a la agenda'));

    expect(mockRouter.navigate).toHaveBeenCalledWith('/');
  });
});

describe('Mis turnos con reservas', () => {
  beforeEach(() => {
    useTurnosStore.setState({
      reservas: [reserva('1-09:00', '09:00'), reserva('2-15:00', '15:00')],
    });
  });

  it('cuenta los turnos en plural', async () => {
    await render(<MisTurnos />);

    expect(screen.getByText(/Tenés 2 turnos para hoy/)).toBeOnTheScreen();
  });

  it('cuenta el turno en singular cuando hay uno solo', async () => {
    useTurnosStore.setState({ reservas: [reserva('1-09:00', '09:00')] });

    await render(<MisTurnos />);

    expect(screen.getByText(/Tenés 1 turno para hoy/)).toBeOnTheScreen();
  });

  it('agrupa los turnos por mañana y tarde', async () => {
    await render(<MisTurnos />);

    expect(screen.getByText('Mañana')).toBeOnTheScreen();
    expect(screen.getByText('Tarde')).toBeOnTheScreen();
    expect(screen.getByText('Profesional 1-09:00')).toBeOnTheScreen();
    expect(screen.getByText('Profesional 2-15:00')).toBeOnTheScreen();
  });

  it('no muestra el mensaje de lista vacía', async () => {
    await render(<MisTurnos />);

    expect(screen.queryByText('Todavía no reservaste ningún turno.')).toBeNull();
  });

  it('indica cuáles turnos ya tienen la orden médica adjunta', async () => {
    useTurnosStore.setState({
      reservas: [reserva('1-09:00', '09:00', { orden: 'file:///orden.jpg' })],
    });

    await render(<MisTurnos />);

    expect(screen.getByText('Orden adjunta')).toBeOnTheScreen();
  });

  it('abre el comprobante del turno que se toca', async () => {
    await render(<MisTurnos />);

    await fireEvent.press(screen.getByText('Profesional 2-15:00'));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/turno/[id]',
      params: { id: '2-15:00' },
    });
  });
});

describe('Cancelar un turno', () => {
  beforeEach(() => {
    useTurnosStore.setState({ reservas: [reserva('1-09:00', '09:00')] });
  });

  it('pide confirmación antes de borrar nada', async () => {
    await render(<MisTurnos />);

    await fireEvent.press(screen.getByTestId('cancelar-turno'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Cancelar turno',
      '¿Querés liberar el turno de las 09:00?',
      expect.any(Array),
    );
    expect(borrarReserva).not.toHaveBeenCalled();
    expect(screen.getByText('Profesional 1-09:00')).toBeOnTheScreen();
  });

  it('conserva el turno si el usuario decide volver', async () => {
    await render(<MisTurnos />);
    await fireEvent.press(screen.getByTestId('cancelar-turno'));

    await confirmarAlerta('Volver');

    expect(borrarReserva).not.toHaveBeenCalled();
    expect(screen.getByText('Profesional 1-09:00')).toBeOnTheScreen();
  });

  it('borra el turno y vuelve a mostrar la lista vacía al confirmar', async () => {
    await render(<MisTurnos />);
    await fireEvent.press(screen.getByTestId('cancelar-turno'));

    await confirmarAlerta('Confirmar');

    await waitFor(() => expect(borrarReserva).toHaveBeenCalledWith('1-09:00'));
    await waitFor(() =>
      expect(screen.getByText('Todavía no reservaste ningún turno.')).toBeOnTheScreen(),
    );
    expect(useTurnosStore.getState().reservas).toEqual([]);
  });

  it('solo saca el turno cancelado y deja los demás', async () => {
    useTurnosStore.setState({
      reservas: [reserva('1-09:00', '09:00'), reserva('2-10:00', '10:00')],
    });
    await render(<MisTurnos />);
    await fireEvent.press(screen.getAllByTestId('cancelar-turno')[0]);

    await confirmarAlerta('Confirmar');

    await waitFor(() => expect(screen.queryByText('Profesional 1-09:00')).toBeNull());
    expect(screen.getByText('Profesional 2-10:00')).toBeOnTheScreen();
  });
});
