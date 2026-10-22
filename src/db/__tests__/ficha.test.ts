jest.mock('expo-sqlite', () => require('../../test/sqliteEnMemoria'));

type ModuloFicha = typeof import('../ficha');

let ficha: ModuloFicha;

beforeEach(() => {
  jest.resetModules();
  ficha = require('../ficha');
});

describe('base de la ficha', () => {
  it('arranca con el titular ya cargado', async () => {
    const pacientes = await ficha.listarPacientes();

    expect(pacientes).toHaveLength(1);
    expect(pacientes[0]).toMatchObject({ id: 1, nombre: 'Titular', parentesco: 'Titular' });
  });

  it('muestra obra social y afiliado como nulos mientras no se cargan', async () => {
    const [titular] = await ficha.listarPacientes();

    expect(titular.obraSocial).toBeNull();
    expect(titular.afiliado).toBeNull();
  });
});

describe('guardarAtributo', () => {
  it('agrega un dato nuevo a la ficha', async () => {
    await ficha.guardarAtributo(1, 'alergias', 'Penicilina');

    const atributos = await ficha.listarAtributos(1);

    expect(atributos.map((atributo) => atributo.attribute)).toEqual([
      'nombre',
      'parentesco',
      'alergias',
    ]);
  });

  it('actualiza un dato que ya existía en vez de duplicarlo', async () => {
    await ficha.guardarAtributo(1, 'obra_social', 'OSDE');
    await ficha.guardarAtributo(1, 'obra_social', 'Swiss Medical');

    const atributos = await ficha.listarAtributos(1);
    const obrasSociales = atributos.filter((atributo) => atributo.attribute === 'obra_social');

    expect(obrasSociales).toHaveLength(1);
    expect(obrasSociales[0].value).toBe('Swiss Medical');
  });

  it('conserva el orden en que se cargaron los datos aunque se edite uno', async () => {
    await ficha.guardarAtributo(1, 'obra_social', 'OSDE');
    await ficha.guardarAtributo(1, 'alergias', 'Ninguna');
    await ficha.guardarAtributo(1, 'obra_social', 'Galeno');

    const atributos = await ficha.listarAtributos(1);

    expect(atributos.map((atributo) => atributo.attribute)).toEqual([
      'nombre',
      'parentesco',
      'obra_social',
      'alergias',
    ]);
  });
});

describe('vista horizontal de pacientes', () => {
  it('arma el registro del paciente con los datos que tiene', async () => {
    await ficha.guardarAtributo(1, 'obra_social', 'OSDE');
    await ficha.guardarAtributo(1, 'afiliado', '12345');

    const titular = await ficha.obtenerPaciente(1);

    expect(titular).toEqual({
      id: 1,
      nombre: 'Titular',
      parentesco: 'Titular',
      obraSocial: 'OSDE',
      afiliado: '12345',
    });
  });

  it('ignora los datos que no forman parte del resumen', async () => {
    await ficha.guardarAtributo(1, 'alergias', 'Penicilina');

    const titular = await ficha.obtenerPaciente(1);

    expect(titular).not.toHaveProperty('alergias');
  });

  it('devuelve null si el paciente no existe', async () => {
    expect(await ficha.obtenerPaciente(99)).toBeNull();
  });
});

describe('crearPaciente', () => {
  it('le asigna el entity_id siguiente al más alto', async () => {
    const primero = await ficha.crearPaciente('Lucia', 'Hija');
    const segundo = await ficha.crearPaciente('Tomas', 'Hijo');

    expect([primero, segundo]).toEqual([2, 3]);
  });

  it('guarda el nombre y el parentesco como atributos del nuevo paciente', async () => {
    const id = await ficha.crearPaciente('Lucia', 'Hija');

    const atributos = await ficha.listarAtributos(id);

    expect(atributos).toEqual([
      { attribute: 'nombre', value: 'Lucia' },
      { attribute: 'parentesco', value: 'Hija' },
    ]);
  });

  it('suma al paciente nuevo a la lista sin tocar al titular', async () => {
    await ficha.crearPaciente('Lucia', 'Hija');

    const pacientes = await ficha.listarPacientes();

    expect(pacientes.map((paciente) => paciente.nombre)).toEqual(['Titular', 'Lucia']);
  });
});

describe('borrarAtributo', () => {
  it('quita un dato y deja los demás', async () => {
    await ficha.guardarAtributo(1, 'alergias', 'Penicilina');
    await ficha.borrarAtributo(1, 'alergias');

    const atributos = await ficha.listarAtributos(1);

    expect(atributos.map((atributo) => atributo.attribute)).toEqual(['nombre', 'parentesco']);
  });

  it('no hace nada si el dato no existe', async () => {
    await expect(ficha.borrarAtributo(1, 'inexistente')).resolves.toBeUndefined();
  });
});

describe('borrarPaciente', () => {
  it('borra toda la ficha del paciente', async () => {
    const id = await ficha.crearPaciente('Lucia', 'Hija');
    await ficha.guardarAtributo(id, 'alergias', 'Ninguna');

    await ficha.borrarPaciente(id);

    expect(await ficha.listarAtributos(id)).toEqual([]);
    expect(await ficha.obtenerPaciente(id)).toBeNull();
  });

  it('borra también los turnos reservados a su nombre', async () => {
    const reservas = require('../reservas') as typeof import('../reservas');
    const id = await ficha.crearPaciente('Lucia', 'Hija');
    const reserva = {
      id: '1-08:00',
      pacienteId: id,
      profesionalId: 1,
      profesional: 'Dra. Emily Johnson',
      especialidad: 'Pediatria',
      consultorio: 'Consultorio 2',
      foto: 'https://dummyjson.com/icon/emilys/128',
      hora: '08:00',
      orden: null,
    };
    await reservas.insertarReserva(reserva);
    await reservas.insertarReserva({ ...reserva, id: '2-09:00', hora: '09:00', pacienteId: 1 });

    await ficha.borrarPaciente(id);

    const quedan = await reservas.listarReservas();
    expect(quedan.map((item) => item.id)).toEqual(['2-09:00']);
  });

  it('no toca a los otros pacientes', async () => {
    const id = await ficha.crearPaciente('Lucia', 'Hija');

    await ficha.borrarPaciente(id);

    const pacientes = await ficha.listarPacientes();
    expect(pacientes.map((paciente) => paciente.id)).toEqual([1]);
  });
});
