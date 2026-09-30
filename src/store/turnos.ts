import { create } from 'zustand';
import { Profesional, Reserva } from '../types';

type TurnosState = {
  reservas: Reserva[];
  reservar: (profesional: Profesional, hora: string) => void;
  cancelar: (id: string) => void;
  estaReservado: (profesionalId: number, hora: string) => boolean;
};

const idDeReserva = (profesionalId: number, hora: string) => `${profesionalId}-${hora}`;

export const useTurnosStore = create<TurnosState>((set, get) => ({
  reservas: [],

  reservar: (profesional, hora) => {
    if (get().estaReservado(profesional.id, hora)) {
      return;
    }

    const reserva: Reserva = {
      id: idDeReserva(profesional.id, hora),
      profesionalId: profesional.id,
      profesional: profesional.nombre,
      especialidad: profesional.especialidad,
      consultorio: profesional.consultorio,
      foto: profesional.foto,
      hora,
    };

    set((state) => ({
      reservas: [...state.reservas, reserva].sort((a, b) => a.hora.localeCompare(b.hora)),
    }));
  },

  cancelar: (id) =>
    set((state) => ({ reservas: state.reservas.filter((reserva) => reserva.id !== id) })),

  estaReservado: (profesionalId, hora) =>
    get().reservas.some((reserva) => reserva.id === idDeReserva(profesionalId, hora)),
}));
