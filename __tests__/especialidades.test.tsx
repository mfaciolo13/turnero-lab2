import { fireEvent, render, screen } from '@testing-library/react-native';
import Especialidades from '../app/(tabs)/especialidades';

const mockRouter = { navigate: jest.fn() };
const mockResumen = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('../src/hooks/useProfesionales', () => ({
  useResumenEspecialidades: () => mockResumen(),
}));

const consulta = (extra = {}) => ({
  data: [
    { id: 'pediatria', nombre: 'Pediatria', profesionales: 2, disponibles: 10, ocupados: 4 },
    { id: 'cardiologia', nombre: 'Cardiologia', profesionales: 1, disponibles: 3, ocupados: 2 },
  ],
  isLoading: false,
  isError: false,
  isRefetching: false,
  refetch: jest.fn(),
  ...extra,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockResumen.mockReturnValue(consulta());
});

describe('Especialidades', () => {
  it('lista cada especialidad con sus profesionales y turnos libres', async () => {
    await render(<Especialidades />);

    expect(screen.getByText('Pediatria')).toBeOnTheScreen();
    expect(screen.getByText('2 profesionales · 10 turnos libres')).toBeOnTheScreen();
    expect(screen.getByText('Cardiologia')).toBeOnTheScreen();
    expect(screen.getByText('1 profesional · 3 turnos libres')).toBeOnTheScreen();
  });

  it('lleva a la agenda filtrada por la especialidad que se toca', async () => {
    await render(<Especialidades />);

    await fireEvent.press(screen.getByText('Cardiologia'));

    expect(mockRouter.navigate).toHaveBeenCalledWith({
      pathname: '/',
      params: { especialidad: 'cardiologia' },
    });
  });

  it('explica qué pasa al tocar una especialidad', async () => {
    await render(<Especialidades />);

    expect(screen.getByText(/te llevamos a la agenda del día filtrada/)).toBeOnTheScreen();
  });

  it('muestra que está contando los turnos mientras carga', async () => {
    mockResumen.mockReturnValue(consulta({ data: undefined, isLoading: true }));

    await render(<Especialidades />);

    expect(screen.getByText('Contando turnos disponibles...')).toBeOnTheScreen();
  });

  it('muestra el error y permite reintentar', async () => {
    const refetch = jest.fn();
    mockResumen.mockReturnValue(consulta({ data: undefined, isError: true, refetch }));
    await render(<Especialidades />);

    await fireEvent.press(screen.getByText('Reintentar'));

    expect(screen.getByText('No pudimos traer las especialidades.')).toBeOnTheScreen();
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
