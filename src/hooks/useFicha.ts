import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  borrarAtributo,
  borrarPaciente,
  crearPaciente,
  guardarAtributo,
  listarAtributos,
  listarPacientes,
  obtenerPaciente,
} from '../db/ficha';
import { useTurnosStore } from '../store/turnos';

export const usePacientes = () =>
  useQuery({ queryKey: ['ficha', 'pacientes'], queryFn: listarPacientes });

export const usePaciente = (id: number) =>
  useQuery({
    queryKey: ['ficha', 'paciente', id],
    queryFn: () => obtenerPaciente(id),
    enabled: id > 0,
  });

export const useAtributos = (id: number) =>
  useQuery({ queryKey: ['ficha', 'atributos', id], queryFn: () => listarAtributos(id) });

const useRefrescarFicha = () => {
  const cliente = useQueryClient();
  return () => cliente.invalidateQueries({ queryKey: ['ficha'] });
};

export const useGuardarAtributo = () => {
  const refrescar = useRefrescarFicha();

  return useMutation({
    mutationFn: ({ id, atributo, valor }: { id: number; atributo: string; valor: string }) =>
      guardarAtributo(id, atributo, valor),
    onSuccess: refrescar,
  });
};

export const useBorrarAtributo = () => {
  const refrescar = useRefrescarFicha();

  return useMutation({
    mutationFn: ({ id, atributo }: { id: number; atributo: string }) =>
      borrarAtributo(id, atributo),
    onSuccess: refrescar,
  });
};

export const useCrearPaciente = () => {
  const refrescar = useRefrescarFicha();

  return useMutation({
    mutationFn: ({ nombre, parentesco }: { nombre: string; parentesco: string }) =>
      crearPaciente(nombre, parentesco),
    onSuccess: refrescar,
  });
};

export const useBorrarPaciente = () => {
  const refrescar = useRefrescarFicha();
  const cargar = useTurnosStore((state) => state.cargar);

  return useMutation({
    mutationFn: (id: number) => borrarPaciente(id),
    onSuccess: async () => {
      await cargar();
      await refrescar();
    },
  });
};
