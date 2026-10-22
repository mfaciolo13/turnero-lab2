import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Accelerometer } from 'expo-sensors';
import Agenda from '../app/(tabs)/index';
import { useTurnosStore } from '../src/store/turnos';
import { Profesional } from '../src/types';

const mockRouter = { push: jest.fn() };
const mockProfesionales = jest.fn();
const mockResumen = jest.fn();
let mockParams: { especialidad?: string } = {};

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockParams,
}));
jest.mock('../src/hooks/useProfesionales', () => ({
  useProfesionales: (busqueda: string) => mockProfesionales(busqueda),
  useResumenEspecialidades: () => mockResumen(),
}));
jest.mock('../src/db/reservas');
jest.mock('expo-sensors', () => ({
  Accelerometer: {
    isAvailableAsync: jest.fn(),
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(),
  },
}));

const sensor = jest.mocked(Accelerometer);

const profesional = (id: number, nombre: string, especialidad: string): Profesional => ({
  id,
  nombre,
  especialidad,
  consultorio: `Consultorio ${id}`,
  foto: 'https://dummyjson.com/icon/emilys/128',
  valoracion: 4.5,
  cobertura: 'PAMI - Particular',
  telefono: '+54 351 000',
  horarios: [
    { hora: '08:00', ocupado: false },
    { hora: '08:40', ocupado: true },
  ],
});

const profesionales = [
  profesional(1, 'Dra. Emily Johnson', 'Pediatria'),
  profesional(2, 'Dr. Michael Williams', 'Cardiologia'),
  profesional(3, 'Dra. Sophia Brown', 'Pediatria'),
];

const consulta = (extra = {}) => ({
  data: { pages: [{ profesionales }] },
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  isRefetching: false,
  fetchNextPage: jest.fn(),
  hasNextPage: true,
  isFetchingNextPage: false,
  ...extra,
});

const resumen = {
  data: [
    { id: 'pediatria', nombre: 'Pediatria', profesionales: 2, disponibles: 10, ocupados: 4 },
    { id: 'cardiologia', nombre: 'Cardiologia', profesionales: 1, disponibles: 3, ocupados: 2 },
  ],
};

let medir: (medicion: { x: number; y: number; z: number }) => void;

const montar = async () => {
  await render(<Agenda />);
  await act(async () => {});
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  mockParams = {};
  mockProfesionales.mockReturnValue(consulta());
  mockResumen.mockReturnValue(resumen);
  sensor.isAvailableAsync.mockResolvedValue(true);
  sensor.addListener.mockImplementation(((escuchar: typeof medir) => {
    medir = escuchar;
    return { remove: jest.fn() };
  }) as never);
  useTurnosStore.setState({ reservas: [], cargada: true, pacienteActivo: 1 });
});

describe('Agenda con profesionales', () => {
  it('muestra el centro y la lista de profesionales', async () => {
    await montar();

    expect(screen.getByText('Turnero Laboratorio 2')).toBeOnTheScreen();
    expect(screen.getByText('Dra. Emily Johnson')).toBeOnTheScreen();
    expect(screen.getByText('Dr. Michael Williams')).toBeOnTheScreen();
    expect(screen.getByText('Dra. Sophia Brown')).toBeOnTheScreen();
  });

  it('cuenta los profesionales cargados', async () => {
    await montar();

    expect(screen.getByText(/3 cargados/)).toBeOnTheScreen();
  });

  it('muestra los indicadores calculados con las reservas', async () => {
    useTurnosStore.setState({
      reservas: [
        {
          id: '1-08:00',
          pacienteId: 1,
          profesionalId: 1,
          profesional: 'Dra. Emily Johnson',
          especialidad: 'Pediatria',
          consultorio: 'C1',
          foto: '',
          hora: '08:00',
          orden: null,
        },
      ],
    });

    await montar();

    expect(screen.getByText('12')).toBeOnTheScreen();
    expect(screen.getByText('7')).toBeOnTheScreen();
    expect(screen.getByText('Mis turnos')).toBeOnTheScreen();
  });

  it('abre el detalle del profesional que se toca', async () => {
    await montar();

    await fireEvent.press(screen.getByText('Dr. Michael Williams'));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/profesional/[id]',
      params: { id: 2 },
    });
  });

  it('abre el detalle al tocar un horario libre', async () => {
    await montar();

    await fireEvent.press(screen.getAllByText('08:00')[0]);

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/profesional/[id]',
      params: { id: 1 },
    });
  });
});

describe('Agenda filtrada por especialidad', () => {
  it('muestra solo la especialidad que se toca', async () => {
    await montar();

    await fireEvent.press(screen.getByTestId('especialidad-Cardiologia'));

    expect(screen.getByText('Dr. Michael Williams')).toBeOnTheScreen();
    expect(screen.queryByText('Dra. Emily Johnson')).toBeNull();
    expect(screen.queryByText('Dra. Sophia Brown')).toBeNull();
  });

  it('vuelve a mostrar todos al tocar de nuevo la misma especialidad', async () => {
    await montar();

    await fireEvent.press(screen.getByTestId('especialidad-Cardiologia'));
    await fireEvent.press(screen.getByTestId('especialidad-Cardiologia'));

    expect(screen.getByText('Dra. Emily Johnson')).toBeOnTheScreen();
    expect(screen.getByText('Dr. Michael Williams')).toBeOnTheScreen();
  });

  it('cambia de una especialidad a otra', async () => {
    await montar();

    await fireEvent.press(screen.getByTestId('especialidad-Cardiologia'));
    await fireEvent.press(screen.getByTestId('especialidad-Pediatria'));

    expect(screen.queryByText('Dr. Michael Williams')).toBeNull();
    expect(screen.getByText('Dra. Emily Johnson')).toBeOnTheScreen();
  });

  it('arranca filtrada cuando se llega desde la pestaña de especialidades', async () => {
    mockParams = { especialidad: 'cardiologia' };

    await montar();

    expect(screen.getByText('Dr. Michael Williams')).toBeOnTheScreen();
    expect(screen.queryByText('Dra. Emily Johnson')).toBeNull();
  });

  it('avisa si no hay profesionales para la especialidad elegida', async () => {
    mockProfesionales.mockReturnValue(
      consulta({ data: { pages: [{ profesionales: [profesionales[0]] }] } }),
    );
    await montar();

    await fireEvent.press(screen.getByTestId('especialidad-Cardiologia'));

    expect(screen.getByText('No hay profesionales para esa búsqueda.')).toBeOnTheScreen();
  });
});

describe('Agenda con búsqueda', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('pide los resultados recién cuando el usuario deja de escribir', async () => {
    await montar();
    expect(mockProfesionales).toHaveBeenLastCalledWith('');

    await fireEvent.changeText(screen.getByTestId('input-busqueda'), 'emma');
    expect(mockProfesionales).not.toHaveBeenLastCalledWith('emma');

    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(mockProfesionales).toHaveBeenLastCalledWith('emma');
  });

  it('ignora los espacios de los costados', async () => {
    await montar();

    await fireEvent.changeText(screen.getByTestId('input-busqueda'), '  emma  ');
    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    expect(mockProfesionales).toHaveBeenLastCalledWith('emma');
  });
});

describe('Agenda mientras carga o falla', () => {
  it('muestra que está buscando profesionales', async () => {
    mockProfesionales.mockReturnValue(consulta({ data: undefined, isLoading: true }));

    await montar();

    expect(screen.getByText('Buscando profesionales...')).toBeOnTheScreen();
  });

  it('muestra el error y permite reintentar', async () => {
    const refetch = jest.fn();
    mockProfesionales.mockReturnValue(consulta({ data: undefined, isError: true, refetch }));
    await montar();

    await fireEvent.press(screen.getByText('Reintentar'));

    expect(screen.getByText(/No pudimos traer la agenda/)).toBeOnTheScreen();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('avisa cuando la búsqueda no encuentra a nadie', async () => {
    mockProfesionales.mockReturnValue(consulta({ data: { pages: [{ profesionales: [] }] } }));

    await montar();

    expect(screen.getByText('No hay profesionales para esa búsqueda.')).toBeOnTheScreen();
  });
});

describe('Agenda con scroll infinito', () => {
  it('pide la página siguiente al llegar al final', async () => {
    const fetchNextPage = jest.fn();
    mockProfesionales.mockReturnValue(consulta({ fetchNextPage }));
    await montar();

    await fireEvent(screen.getByTestId('lista-profesionales'), 'endReached');

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('no pide más cuando ya no hay páginas', async () => {
    const fetchNextPage = jest.fn();
    mockProfesionales.mockReturnValue(consulta({ fetchNextPage, hasNextPage: false }));
    await montar();

    await fireEvent(screen.getByTestId('lista-profesionales'), 'endReached');

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('no pide otra página mientras ya está cargando una', async () => {
    const fetchNextPage = jest.fn();
    mockProfesionales.mockReturnValue(consulta({ fetchNextPage, isFetchingNextPage: true }));
    await montar();

    await fireEvent(screen.getByTestId('lista-profesionales'), 'endReached');

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('muestra el recordatorio final recién cuando no quedan más páginas', async () => {
    mockProfesionales.mockReturnValue(consulta({ hasNextPage: false }));

    await montar();

    expect(screen.getByText('Antes de venir')).toBeOnTheScreen();
  });

  it('no muestra el recordatorio mientras quedan páginas por traer', async () => {
    await montar();

    expect(screen.queryByText('Antes de venir')).toBeNull();
  });
});

describe('Agenda al agitar el celular', () => {
  it('avisa que se puede agitar para actualizar', async () => {
    await montar();

    expect(screen.getByText(/agitá para actualizar/)).toBeOnTheScreen();
  });

  it('actualiza la agenda al agitar', async () => {
    const refetch = jest.fn();
    mockProfesionales.mockReturnValue(consulta({ refetch }));
    await montar();

    await act(async () => medir({ x: 1.2, y: 0.8, z: 0.6 }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('no actualiza si ya se está actualizando', async () => {
    const refetch = jest.fn();
    mockProfesionales.mockReturnValue(consulta({ refetch, isRefetching: true }));
    await montar();

    await act(async () => medir({ x: 1.2, y: 0.8, z: 0.6 }));

    expect(refetch).not.toHaveBeenCalled();
  });

  it('no avisa de agitar si el dispositivo no tiene acelerómetro', async () => {
    sensor.isAvailableAsync.mockResolvedValue(false);

    await montar();

    expect(screen.queryByText(/agitá para actualizar/)).toBeNull();
  });
});
