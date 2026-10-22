import { Alert, AlertButton, Linking } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import DetalleProfesional from '../app/profesional/[id]';
import { borrarReserva, insertarReserva } from '../src/db/reservas';
import { useTurnosStore } from '../src/store/turnos';
import { Paciente, Profesional } from '../src/types';

const mockRouter = { back: jest.fn() };
const mockProfesional = jest.fn();
let mockPaciente: Paciente | undefined;

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ id: '1' }),
  Stack: { Screen: () => null },
}));
jest.mock('../src/hooks/useProfesionales', () => ({
  useProfesional: () => mockProfesional(),
}));
jest.mock('../src/hooks/useFicha', () => ({ usePaciente: () => ({ data: mockPaciente }) }));
jest.mock('../src/db/reservas');

const profesional: Profesional = {
  id: 1,
  nombre: 'Dra. Emily Johnson',
  especialidad: 'Pediatria',
  consultorio: 'Consultorio 2 - Primer piso',
  foto: 'https://dummyjson.com/icon/emilys/128',
  valoracion: 4.1,
  cobertura: 'PAMI - Particular',
  telefono: '+81 965-431-3024',
  horarios: [
    { hora: '08:00', ocupado: false },
    { hora: '08:40', ocupado: true },
    { hora: '14:00', ocupado: false },
  ],
};

const resultado = (extra = {}) => ({
  data: profesional,
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  ...extra,
});

const apretar = async (llamada: number, texto: string) => {
  const botones = jest.mocked(Alert.alert).mock.calls[llamada][2] as AlertButton[];
  await act(async () => botones.find((boton) => boton.text === texto)?.onPress?.());
};

beforeEach(() => {
  jest.clearAllMocks();
  mockProfesional.mockReturnValue(resultado());
  mockPaciente = {
    id: 1,
    nombre: 'Lucia',
    parentesco: 'Hija',
    obraSocial: null,
    afiliado: null,
  };
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  jest.mocked(insertarReserva).mockResolvedValue(undefined);
  jest.mocked(borrarReserva).mockResolvedValue(undefined);
  useTurnosStore.setState({ reservas: [], cargada: true, pacienteActivo: 1 });
});

describe('Detalle mientras carga o falla', () => {
  it('muestra que está cargando', async () => {
    mockProfesional.mockReturnValue(resultado({ data: undefined, isLoading: true }));

    await render(<DetalleProfesional />);

    expect(screen.getByText('Cargando la agenda del profesional...')).toBeOnTheScreen();
  });

  it('muestra el error y permite reintentar', async () => {
    const refetch = jest.fn();
    mockProfesional.mockReturnValue(resultado({ data: undefined, isError: true, refetch }));
    await render(<DetalleProfesional />);

    await fireEvent.press(screen.getByText('Reintentar'));

    expect(screen.getByText('No pudimos cargar este profesional.')).toBeOnTheScreen();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('permite volver a la agenda desde el error', async () => {
    mockProfesional.mockReturnValue(resultado({ data: undefined, isError: true }));
    await render(<DetalleProfesional />);

    await fireEvent.press(screen.getByText('Volver a la agenda'));

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });
});

describe('Detalle del profesional', () => {
  it('muestra sus datos y para quién es el turno', async () => {
    await render(<DetalleProfesional />);

    expect(screen.getByText('Dra. Emily Johnson')).toBeOnTheScreen();
    expect(screen.getByText('Consultorio 2 - Primer piso')).toBeOnTheScreen();
    expect(screen.getByText('PAMI - Particular')).toBeOnTheScreen();
    expect(screen.getByTestId('paciente-del-turno')).toHaveTextContent('Turno para: Lucia');
  });

  it('agrupa los horarios por mañana y tarde', async () => {
    await render(<DetalleProfesional />);

    expect(screen.getByText('Mañana')).toBeOnTheScreen();
    expect(screen.getByText('Tarde')).toBeOnTheScreen();
    expect(screen.getByText('08:00')).toBeOnTheScreen();
    expect(screen.getByText('14:00')).toBeOnTheScreen();
  });

  it('cuenta los horarios disponibles', async () => {
    await render(<DetalleProfesional />);

    expect(screen.getByText('2 de 3 horarios disponibles')).toBeOnTheScreen();
  });

  it('ofrece reservar solo los horarios libres', async () => {
    await render(<DetalleProfesional />);

    expect(screen.getAllByText('Reservar')).toHaveLength(2);
    expect(screen.getByText('Reservado')).toBeOnTheScreen();
  });

  it('llama al consultorio con el teléfono sin espacios ni guiones', async () => {
    await render(<DetalleProfesional />);

    await fireEvent.press(screen.getByText('Llamar al consultorio'));

    expect(Linking.openURL).toHaveBeenCalledWith('tel:+819654313024');
  });
});

describe('Reservar un turno', () => {
  it('pide confirmación antes de reservar', async () => {
    await render(<DetalleProfesional />);

    await fireEvent.press(screen.getAllByText('Reservar')[0]);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Confirmar turno',
      'Dra. Emily Johnson\nPediatria - hoy a las 08:00',
      expect.any(Array),
    );
    expect(insertarReserva).not.toHaveBeenCalled();
  });

  it('no reserva si el usuario vuelve atrás', async () => {
    await render(<DetalleProfesional />);
    await fireEvent.press(screen.getAllByText('Reservar')[0]);

    await apretar(0, 'Volver');

    expect(insertarReserva).not.toHaveBeenCalled();
    expect(useTurnosStore.getState().reservas).toEqual([]);
  });

  it('guarda la reserva a nombre del paciente y avisa al confirmar', async () => {
    useTurnosStore.setState({ pacienteActivo: 5 });
    await render(<DetalleProfesional />);
    await fireEvent.press(screen.getAllByText('Reservar')[0]);

    await apretar(0, 'Confirmar');

    await waitFor(() =>
      expect(insertarReserva).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1-08:00', pacienteId: 5, hora: '08:00' }),
      ),
    );
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Turno reservado',
        'Lo vas a encontrar en la pestaña Mis turnos.',
      ),
    );
  });

  it('muestra el horario reservado como tu turno', async () => {
    await render(<DetalleProfesional />);
    await fireEvent.press(screen.getAllByText('Reservar')[0]);

    await apretar(0, 'Confirmar');

    expect(await screen.findByText('Tu turno')).toBeOnTheScreen();
    expect(screen.getAllByText('Reservar')).toHaveLength(1);
    expect(screen.getByText('1 de 3 horarios disponibles')).toBeOnTheScreen();
  });

  it('no muestra el aviso de reservado si la base falla', async () => {
    jest.mocked(insertarReserva).mockRejectedValue(new Error('sin espacio'));
    const errores = jest.spyOn(console, 'error').mockImplementation(() => {});
    await render(<DetalleProfesional />);
    await fireEvent.press(screen.getAllByText('Reservar')[0]);

    await apretar(0, 'Confirmar').catch(() => {});

    expect(Alert.alert).not.toHaveBeenCalledWith('Turno reservado', expect.any(String));
    expect(useTurnosStore.getState().reservas).toEqual([]);
    errores.mockRestore();
  });
});

describe('Cancelar un turno propio', () => {
  beforeEach(() => {
    useTurnosStore.setState({
      reservas: [
        {
          id: '1-08:00',
          pacienteId: 1,
          profesionalId: 1,
          profesional: profesional.nombre,
          especialidad: profesional.especialidad,
          consultorio: profesional.consultorio,
          foto: profesional.foto,
          hora: '08:00',
          orden: null,
        },
      ],
    });
  });

  it('muestra el turno propio con la opción de cancelarlo', async () => {
    await render(<DetalleProfesional />);

    expect(screen.getByText('Tu turno')).toBeOnTheScreen();
    expect(screen.getByText('Cancelar')).toBeOnTheScreen();
  });

  it('pide confirmación y libera el horario al confirmar', async () => {
    await render(<DetalleProfesional />);
    await fireEvent.press(screen.getByText('Cancelar'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Cancelar turno',
      '¿Querés liberar el turno de las 08:00?',
      expect.any(Array),
    );
    await apretar(0, 'Confirmar');

    await waitFor(() => expect(borrarReserva).toHaveBeenCalledWith('1-08:00'));
    await waitFor(() => expect(screen.queryByText('Tu turno')).toBeNull());
    expect(screen.getAllByText('Reservar')).toHaveLength(2);
  });
});
