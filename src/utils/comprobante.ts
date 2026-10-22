import { Paciente, Reserva } from '../types';

export const textoComprobante = (reserva: Reserva, paciente: Paciente | null, sello: string) => {
  const lineas = [
    `${sello} Turno confirmado`,
    `${reserva.profesional} - ${reserva.especialidad}`,
    `Hoy a las ${reserva.hora} hs`,
    reserva.consultorio,
  ];

  if (paciente) {
    lineas.push(`Paciente: ${paciente.nombre}`);
  }

  return lineas.join('\n');
};
