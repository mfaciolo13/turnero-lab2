import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  obtenerProfesional,
  obtenerProfesionales,
  obtenerResumenEspecialidades,
} from '../../api/profesionales';
import { useTurnosStore } from '../../store/turnos';
import { useIndicadores } from '../useIndicadores';
import { useProfesional, useProfesionales, useResumenEspecialidades } from '../useProfesionales';

jest.mock('../../api/profesionales');
jest.mock('../../db/reservas');

const api = {
  lista: jest.mocked(obtenerProfesionales),
  detalle: jest.mocked(obtenerProfesional),
  resumen: jest.mocked(obtenerResumenEspecialidades),
};

const crearEnvoltorio = () => {
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
  );
};

const pagina = (siguiente?: number) => ({ profesionales: [], siguiente });

const resumen = [
  { id: 'a', nombre: 'A', profesionales: 2, disponibles: 10, ocupados: 4 },
  { id: 'b', nombre: 'B', profesionales: 1, disponibles: 5, ocupados: 1 },
];

beforeEach(() => {
  jest.clearAllMocks();
  useTurnosStore.setState({ reservas: [], cargada: true, pacienteActivo: 1 });
});

describe('useProfesionales', () => {
  it('pide la primera página con el texto de búsqueda', async () => {
    api.lista.mockResolvedValue(pagina());

    const { result } = await renderHook(() => useProfesionales('emma'), {
      wrapper: crearEnvoltorio(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.lista).toHaveBeenCalledWith(0, 'emma');
  });

  it('tiene página siguiente mientras la API indique una', async () => {
    api.lista.mockResolvedValue(pagina(1));

    const { result } = await renderHook(() => useProfesionales(''), { wrapper: crearEnvoltorio() });

    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
  });

  it('no tiene página siguiente en la última', async () => {
    api.lista.mockResolvedValue(pagina(undefined));

    const { result } = await renderHook(() => useProfesionales(''), { wrapper: crearEnvoltorio() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('pide la página que indica la API al traer más', async () => {
    api.lista.mockResolvedValueOnce(pagina(1)).mockResolvedValueOnce(pagina(undefined));
    const { result } = await renderHook(() => useProfesionales(''), { wrapper: crearEnvoltorio() });
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(api.lista).toHaveBeenLastCalledWith(1, '');
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
  });

  it('empieza de nuevo cuando cambia el texto de búsqueda', async () => {
    api.lista.mockResolvedValue(pagina());
    const { result, rerender } = await renderHook(
      ({ texto }: { texto: string }) => useProfesionales(texto),
      { wrapper: crearEnvoltorio(), initialProps: { texto: '' } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await rerender({ texto: 'emma' });

    await waitFor(() => expect(api.lista).toHaveBeenCalledWith(0, 'emma'));
  });
});

describe('useProfesional', () => {
  it('pide el profesional por su id', async () => {
    api.detalle.mockResolvedValue({ id: 7 } as never);

    const { result } = await renderHook(() => useProfesional(7), { wrapper: crearEnvoltorio() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.detalle).toHaveBeenCalledWith(7);
  });

  it.each([0, -1, 1.5, NaN])('no pide nada con el id inválido %s', async (id) => {
    await renderHook(() => useProfesional(id), { wrapper: crearEnvoltorio() });

    expect(api.detalle).not.toHaveBeenCalled();
  });
});

describe('useResumenEspecialidades', () => {
  it('trae el resumen por especialidad', async () => {
    api.resumen.mockResolvedValue(resumen);

    const { result } = await renderHook(() => useResumenEspecialidades(), {
      wrapper: crearEnvoltorio(),
    });

    await waitFor(() => expect(result.current.data).toEqual(resumen));
  });
});

describe('useIndicadores', () => {
  const indicadores = async () => {
    const { result } = await renderHook(() => useIndicadores(), { wrapper: crearEnvoltorio() });
    await waitFor(() => expect(result.current[0].valor).not.toBe('-'));
    return result;
  };

  it('muestra un guion mientras todavía no llegó el resumen', async () => {
    api.resumen.mockReturnValue(new Promise(() => {}));

    const { result } = await renderHook(() => useIndicadores(), { wrapper: crearEnvoltorio() });

    expect(result.current.map((item) => item.valor)).toEqual(['-', '-', '0']);
  });

  it('suma los turnos libres y reservados de todas las especialidades', async () => {
    api.resumen.mockResolvedValue(resumen);

    const result = await indicadores();

    expect(result.current.map((item) => item.valor)).toEqual(['15', '5', '0']);
  });

  it('descuenta de los libres cada turno que reservaste', async () => {
    api.resumen.mockResolvedValue(resumen);
    useTurnosStore.setState({
      reservas: [
        {
          id: '1-08:00',
          pacienteId: 1,
          profesionalId: 1,
          profesional: 'x',
          especialidad: 'y',
          consultorio: 'z',
          foto: '',
          hora: '08:00',
          orden: null,
        },
      ],
    });

    const result = await indicadores();

    expect(result.current.map((item) => item.valor)).toEqual(['14', '6', '1']);
  });

  it('etiqueta cada indicador con su tono', async () => {
    api.resumen.mockResolvedValue(resumen);

    const result = await indicadores();

    expect(result.current.map((item) => [item.etiqueta, item.tono])).toEqual([
      ['Turnos libres', 'exito'],
      ['Reservados', 'ocupado'],
      ['Mis turnos', 'primario'],
    ]);
  });
});
