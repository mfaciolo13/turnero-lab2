import { cliente } from '../cliente';
import {
  obtenerProfesional,
  obtenerProfesionales,
  obtenerResumenEspecialidades,
} from '../profesionales';

jest.mock('../cliente', () => ({ cliente: { get: jest.fn() } }));

const get = jest.mocked(cliente.get);

const usuario = (id: number, extra: Record<string, unknown> = {}) => ({
  id,
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: 'https://dummyjson.com/icon/emilys/128',
  phone: '+81 965-431-3024',
  ...extra,
});

const respuesta = (users: unknown[], skip = 0, total = users.length) => ({
  data: { users, skip, total, limit: users.length },
});

beforeEach(() => {
  get.mockReset();
});

describe('obtenerProfesionales', () => {
  it('pide la primera página de a diez usuarios', async () => {
    get.mockResolvedValue(respuesta([usuario(1)]));

    await obtenerProfesionales(0, '');

    expect(get).toHaveBeenCalledWith(
      '/users',
      expect.objectContaining({ params: expect.objectContaining({ limit: 10, skip: 0 }) }),
    );
  });

  it('salta los usuarios de las páginas anteriores', async () => {
    get.mockResolvedValue(respuesta([usuario(21)], 20, 100));

    await obtenerProfesionales(2, '');

    expect(get).toHaveBeenCalledWith(
      '/users',
      expect.objectContaining({ params: expect.objectContaining({ skip: 20 }) }),
    );
  });

  it('usa la ruta de búsqueda cuando hay texto', async () => {
    get.mockResolvedValue(respuesta([usuario(5)]));

    await obtenerProfesionales(0, 'emma');

    expect(get).toHaveBeenCalledWith(
      '/users/search',
      expect.objectContaining({ params: expect.objectContaining({ q: 'emma' }) }),
    );
  });

  it('indica la página siguiente mientras queden usuarios por traer', async () => {
    get.mockResolvedValue(
      respuesta(
        Array.from({ length: 10 }, (_, i) => usuario(i + 1)),
        0,
        25,
      ),
    );

    const pagina = await obtenerProfesionales(0, '');

    expect(pagina.siguiente).toBe(1);
  });

  it('no indica página siguiente en la última', async () => {
    get.mockResolvedValue(
      respuesta(
        Array.from({ length: 5 }, (_, i) => usuario(i + 21)),
        20,
        25,
      ),
    );

    const pagina = await obtenerProfesionales(2, '');

    expect(pagina.siguiente).toBeUndefined();
  });

  it('arma el nombre con Dra. para una mujer y Dr. para un varón', async () => {
    get.mockResolvedValue(
      respuesta([usuario(1), usuario(2, { firstName: 'Michael', gender: 'male' })]),
    );

    const { profesionales } = await obtenerProfesionales(0, '');

    expect(profesionales[0].nombre).toBe('Dra. Emily Johnson');
    expect(profesionales[1].nombre).toBe('Dr. Michael Johnson');
  });

  it('usa Lic. para los profesionales de kinesiología', async () => {
    get.mockResolvedValue(respuesta([usuario(4, { gender: 'male' })]));

    const { profesionales } = await obtenerProfesionales(0, '');

    expect(profesionales[0].especialidad).toBe('Kinesiologia');
    expect(profesionales[0].nombre.startsWith('Lic.')).toBe(true);
  });

  it('reparte las especialidades según el id', async () => {
    get.mockResolvedValue(respuesta([usuario(1), usuario(2), usuario(3)]));

    const { profesionales } = await obtenerProfesionales(0, '');

    expect(profesionales.map((item) => item.especialidad)).toEqual([
      'Pediatria',
      'Cardiologia',
      'Odontologia',
    ]);
  });

  it('toma la foto y el teléfono del usuario', async () => {
    get.mockResolvedValue(respuesta([usuario(1)]));

    const { profesionales } = await obtenerProfesionales(0, '');

    expect(profesionales[0].foto).toBe('https://dummyjson.com/icon/emilys/128');
    expect(profesionales[0].telefono).toBe('+81 965-431-3024');
  });

  it('genera siempre los mismos horarios para el mismo usuario', async () => {
    get.mockResolvedValue(respuesta([usuario(7)]));

    const primera = await obtenerProfesionales(0, '');
    const segunda = await obtenerProfesionales(0, '');

    expect(primera.profesionales[0].horarios).toEqual(segunda.profesionales[0].horarios);
    expect(primera.profesionales[0].horarios.length).toBeGreaterThan(0);
  });

  it('no repite horarios dentro de un mismo profesional', async () => {
    get.mockResolvedValue(respuesta([usuario(7)]));

    const { profesionales } = await obtenerProfesionales(0, '');
    const horas = profesionales[0].horarios.map((horario) => horario.hora);

    expect(new Set(horas).size).toBe(horas.length);
  });

  it('mantiene la valoración entre 4,0 y 4,9', async () => {
    get.mockResolvedValue(respuesta(Array.from({ length: 10 }, (_, i) => usuario(i + 1))));

    const { profesionales } = await obtenerProfesionales(0, '');

    for (const profesional of profesionales) {
      expect(profesional.valoracion).toBeGreaterThanOrEqual(4);
      expect(profesional.valoracion).toBeLessThanOrEqual(4.9);
    }
  });
});

describe('obtenerProfesional', () => {
  it('pide un usuario por su id', async () => {
    get.mockResolvedValue({ data: usuario(7) });

    const profesional = await obtenerProfesional(7);

    expect(get).toHaveBeenCalledWith('/users/7', expect.anything());
    expect(profesional.id).toBe(7);
  });
});

describe('obtenerResumenEspecialidades', () => {
  it('reparte los usuarios entre las cinco especialidades', async () => {
    get.mockResolvedValue({
      data: { users: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })) },
    });

    const resumen = await obtenerResumenEspecialidades();

    expect(resumen).toHaveLength(5);
    expect(resumen.map((item) => item.profesionales)).toEqual([2, 2, 2, 2, 2]);
  });

  it('suma turnos libres y ocupados sin perder ninguno', async () => {
    get.mockResolvedValueOnce(respuesta([usuario(1)]));
    const { profesionales } = await obtenerProfesionales(0, '');
    get.mockResolvedValueOnce({ data: { users: [{ id: 1 }] } });

    const [, pediatria] = await obtenerResumenEspecialidades();
    const horarios = profesionales[0].horarios;

    expect(pediatria.disponibles + pediatria.ocupados).toBe(horarios.length);
    expect(pediatria.ocupados).toBe(horarios.filter((horario) => horario.ocupado).length);
  });

  it('deja en cero a las especialidades sin profesionales', async () => {
    get.mockResolvedValue({ data: { users: [{ id: 1 }] } });

    const resumen = await obtenerResumenEspecialidades();

    expect(resumen[0]).toMatchObject({ profesionales: 0, disponibles: 0, ocupados: 0 });
  });
});
