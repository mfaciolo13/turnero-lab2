import { obtenerBase } from './base';
import { BORRAR_RESERVA, GUARDAR_ORDEN, INSERTAR_RESERVA, LISTAR_RESERVAS } from './consultas';
import { Reserva } from '../types';

type FilaReserva = {
  id: string;
  paciente_id: number;
  profesional_id: number;
  profesional: string;
  especialidad: string;
  consultorio: string;
  foto: string;
  hora: string;
  orden: string | null;
};

const aReserva = (fila: FilaReserva): Reserva => ({
  id: fila.id,
  pacienteId: fila.paciente_id,
  profesionalId: fila.profesional_id,
  profesional: fila.profesional,
  especialidad: fila.especialidad,
  consultorio: fila.consultorio,
  foto: fila.foto,
  hora: fila.hora,
  orden: fila.orden,
});

export const listarReservas = async () => {
  const base = await obtenerBase();
  const filas = await base.getAllAsync<FilaReserva>(LISTAR_RESERVAS);
  return filas.map(aReserva);
};

export const insertarReserva = async (reserva: Reserva) => {
  const base = await obtenerBase();
  await base.runAsync(
    INSERTAR_RESERVA,
    reserva.id,
    reserva.pacienteId,
    reserva.profesionalId,
    reserva.profesional,
    reserva.especialidad,
    reserva.consultorio,
    reserva.foto,
    reserva.hora,
    reserva.orden,
  );
};

export const borrarReserva = async (id: string) => {
  const base = await obtenerBase();
  await base.runAsync(BORRAR_RESERVA, id);
};

export const guardarOrden = async (id: string, uri: string) => {
  const base = await obtenerBase();
  await base.runAsync(GUARDAR_ORDEN, uri, id);
};
