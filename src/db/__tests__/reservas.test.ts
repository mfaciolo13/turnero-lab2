jest.mock('expo-sqlite', () => require('../../test/sqliteEnMemoria'));

import { Reserva } from '../../types';

type ModuloReservas = typeof import('../reservas');

let reservas: ModuloReservas;

const reserva: Reserva = {
  id: '1-10:00',
  pacienteId: 1,
  profesionalId: 1,
  profesional: 'Dra. Emily Johnson',
  especialidad: 'Pediatria',
  consultorio: 'Consultorio 2 - Primer piso',
  foto: 'https://dummyjson.com/icon/emilys/128',
  hora: '10:00',
  orden: null,
};

beforeEach(() => {
  jest.resetModules();
  reservas = require('../reservas');
});

describe('reservas guardadas', () => {
  it('empieza sin ninguna reserva', async () => {
    expect(await reservas.listarReservas()).toEqual([]);
  });

  it('devuelve la reserva con los mismos datos con los que se guardó', async () => {
    await reservas.insertarReserva(reserva);

    expect(await reservas.listarReservas()).toEqual([reserva]);
  });

  it('las lista ordenadas por hora', async () => {
    await reservas.insertarReserva({ ...reserva, id: '2-14:00', hora: '14:00' });
    await reservas.insertarReserva({ ...reserva, id: '3-08:00', hora: '08:00' });
    await reservas.insertarReserva(reserva);

    const horas = (await reservas.listarReservas()).map((item) => item.hora);

    expect(horas).toEqual(['08:00', '10:00', '14:00']);
  });

  it('rechaza reservar dos veces el mismo horario del mismo profesional', async () => {
    await reservas.insertarReserva(reserva);

    await expect(reservas.insertarReserva(reserva)).rejects.toThrow();
  });

  it('guarda la ruta de la orden médica', async () => {
    await reservas.insertarReserva(reserva);
    await reservas.guardarOrden(reserva.id, 'file:///orden-1.jpg');

    const [guardada] = await reservas.listarReservas();

    expect(guardada.orden).toBe('file:///orden-1.jpg');
  });

  it('borra una reserva y deja las otras', async () => {
    await reservas.insertarReserva(reserva);
    await reservas.insertarReserva({ ...reserva, id: '2-11:00', hora: '11:00' });

    await reservas.borrarReserva(reserva.id);

    const ids = (await reservas.listarReservas()).map((item) => item.id);
    expect(ids).toEqual(['2-11:00']);
  });
});
