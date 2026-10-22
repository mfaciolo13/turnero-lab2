import { borrarReserva, guardarOrden, insertarReserva, listarReservas } from '../../db/reservas';
import { Profesional, Reserva } from '../../types';
import { useTurnosStore } from '../turnos';

jest.mock('../../db/reservas');

const profesional: Profesional = {
  id: 1,
  nombre: 'Dra. Emily Johnson',
  especialidad: 'Pediatria',
  consultorio: 'Consultorio 2 - Primer piso',
  foto: 'https://dummyjson.com/icon/emilys/128',
  valoracion: 4.1,
  cobertura: 'PAMI - Particular',
  telefono: '+81 965-431-3024',
  horarios: [],
};

const otro: Profesional = { ...profesional, id: 2, nombre: 'Dr. Michael Williams' };

const guardada: Reserva = {
  id: '1-09:00',
  pacienteId: 1,
  profesionalId: 1,
  profesional: 'Dra. Emily Johnson',
  especialidad: 'Pediatria',
  consultorio: 'Consultorio 2 - Primer piso',
  foto: 'https://dummyjson.com/icon/emilys/128',
  hora: '09:00',
  orden: null,
};

const estado = () => useTurnosStore.getState();

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(insertarReserva).mockResolvedValue(undefined);
  jest.mocked(borrarReserva).mockResolvedValue(undefined);
  jest.mocked(guardarOrden).mockResolvedValue(undefined);
  jest.mocked(listarReservas).mockResolvedValue([]);
  useTurnosStore.setState({ reservas: [], cargada: false, pacienteActivo: 1 });
});

describe('reservar', () => {
  it('guarda la reserva en la base y la suma a la lista', async () => {
    await estado().reservar(profesional, '09:00');

    expect(insertarReserva).toHaveBeenCalledWith(guardada);
    expect(estado().reservas).toEqual([guardada]);
  });

  it('la pone a nombre del paciente seleccionado', async () => {
    estado().seleccionarPaciente(3);

    await estado().reservar(profesional, '09:00');

    expect(estado().reservas[0].pacienteId).toBe(3);
  });

  it('empieza sin orden médica adjunta', async () => {
    await estado().reservar(profesional, '09:00');

    expect(estado().reservas[0].orden).toBeNull();
  });

  it('mantiene las reservas ordenadas por hora', async () => {
    await estado().reservar(profesional, '14:00');
    await estado().reservar(otro, '08:00');
    await estado().reservar(profesional, '10:00');

    expect(estado().reservas.map((reserva) => reserva.hora)).toEqual(['08:00', '10:00', '14:00']);
  });

  it('no reserva dos veces el mismo horario del mismo profesional', async () => {
    await estado().reservar(profesional, '09:00');
    await estado().reservar(profesional, '09:00');

    expect(estado().reservas).toHaveLength(1);
    expect(insertarReserva).toHaveBeenCalledTimes(1);
  });

  it('permite la misma hora con otro profesional', async () => {
    await estado().reservar(profesional, '09:00');
    await estado().reservar(otro, '09:00');

    expect(estado().reservas).toHaveLength(2);
  });

  it('no suma la reserva si la base falla', async () => {
    jest.mocked(insertarReserva).mockRejectedValue(new Error('sin espacio'));

    await expect(estado().reservar(profesional, '09:00')).rejects.toThrow('sin espacio');

    expect(estado().reservas).toEqual([]);
  });
});

describe('cancelar', () => {
  it('borra la reserva de la base y de la lista', async () => {
    useTurnosStore.setState({ reservas: [guardada] });

    await estado().cancelar(guardada.id);

    expect(borrarReserva).toHaveBeenCalledWith('1-09:00');
    expect(estado().reservas).toEqual([]);
  });

  it('deja las otras reservas', async () => {
    const segunda = { ...guardada, id: '2-10:00', hora: '10:00' };
    useTurnosStore.setState({ reservas: [guardada, segunda] });

    await estado().cancelar(guardada.id);

    expect(estado().reservas).toEqual([segunda]);
  });
});

describe('adjuntarOrden', () => {
  it('guarda la ruta de la orden en la base y en la reserva', async () => {
    useTurnosStore.setState({ reservas: [guardada] });

    await estado().adjuntarOrden(guardada.id, 'file:///orden.jpg');

    expect(guardarOrden).toHaveBeenCalledWith('1-09:00', 'file:///orden.jpg');
    expect(estado().reservas[0].orden).toBe('file:///orden.jpg');
  });

  it('solo cambia la reserva indicada', async () => {
    const segunda = { ...guardada, id: '2-10:00', hora: '10:00' };
    useTurnosStore.setState({ reservas: [guardada, segunda] });

    await estado().adjuntarOrden(segunda.id, 'file:///orden.jpg');

    expect(estado().reservas[0].orden).toBeNull();
  });
});

describe('estaReservado', () => {
  it('responde si ese horario ya tiene reserva', async () => {
    await estado().reservar(profesional, '09:00');

    expect(estado().estaReservado(1, '09:00')).toBe(true);
    expect(estado().estaReservado(1, '10:00')).toBe(false);
    expect(estado().estaReservado(2, '09:00')).toBe(false);
  });
});

describe('cargar', () => {
  it('trae las reservas guardadas y marca la carga como terminada', async () => {
    jest.mocked(listarReservas).mockResolvedValue([guardada]);

    await estado().cargar();

    expect(estado().reservas).toEqual([guardada]);
    expect(estado().cargada).toBe(true);
  });

  it('marca la carga como terminada aunque la base falle', async () => {
    jest.mocked(listarReservas).mockRejectedValue(new Error('base corrupta'));

    await estado().cargar();

    expect(estado().cargada).toBe(true);
    expect(estado().reservas).toEqual([]);
  });
});

describe('seleccionarPaciente', () => {
  it('empieza con el titular seleccionado', () => {
    expect(estado().pacienteActivo).toBe(1);
  });

  it('cambia el paciente seleccionado', () => {
    estado().seleccionarPaciente(4);

    expect(estado().pacienteActivo).toBe(4);
  });
});
