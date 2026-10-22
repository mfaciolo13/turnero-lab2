import { create } from 'zustand';
import { borrarReserva, guardarOrden, insertarReserva, listarReservas } from '../db/reservas';
import { Profesional, Reserva } from '../types';
import { PACIENTE_TITULAR } from '../utils/ficha';

type TurnosState = {
  reservas: Reserva[];
  cargada: boolean;
  pacienteActivo: number;
  cargar: () => Promise<void>;
  seleccionarPaciente: (id: number) => void;
  reservar: (profesional: Profesional, hora: string) => Promise<void>;
  cancelar: (id: string) => Promise<void>;
  adjuntarOrden: (id: string, uri: string) => Promise<void>;
  estaReservado: (profesionalId: number, hora: string) => boolean;
};

const idDeReserva = (profesionalId: number, hora: string) => `${profesionalId}-${hora}`;

export const useTurnosStore = create<TurnosState>((set, get) => ({
  reservas: [],
  cargada: false,
  pacienteActivo: PACIENTE_TITULAR,

  cargar: async () => {
    try {
      set({ reservas: await listarReservas(), cargada: true });
    } catch {
      set({ cargada: true });
    }
  },

  seleccionarPaciente: (id) => set({ pacienteActivo: id }),

  reservar: async (profesional, hora) => {
    if (get().estaReservado(profesional.id, hora)) {
      return;
    }

    const reserva: Reserva = {
      id: idDeReserva(profesional.id, hora),
      pacienteId: get().pacienteActivo,
      profesionalId: profesional.id,
      profesional: profesional.nombre,
      especialidad: profesional.especialidad,
      consultorio: profesional.consultorio,
      foto: profesional.foto,
      hora,
      orden: null,
    };

    await insertarReserva(reserva);
    set((state) => ({
      reservas: [...state.reservas, reserva].sort((a, b) => a.hora.localeCompare(b.hora)),
    }));
  },

  cancelar: async (id) => {
    await borrarReserva(id);
    set((state) => ({ reservas: state.reservas.filter((reserva) => reserva.id !== id) }));
  },

  adjuntarOrden: async (id, uri) => {
    await guardarOrden(id, uri);
    set((state) => ({
      reservas: state.reservas.map((reserva) =>
        reserva.id === id ? { ...reserva, orden: uri } : reserva,
      ),
    }));
  },

  estaReservado: (profesionalId, hora) =>
    get().reservas.some((reserva) => reserva.id === idDeReserva(profesionalId, hora)),
}));
