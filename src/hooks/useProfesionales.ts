import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  obtenerProfesional,
  obtenerProfesionales,
  obtenerResumenEspecialidades,
} from '../api/profesionales';

export const useProfesionales = (busqueda: string) =>
  useInfiniteQuery({
    queryKey: ['profesionales', busqueda],
    queryFn: ({ pageParam }) => obtenerProfesionales(pageParam, busqueda),
    initialPageParam: 0,
    getNextPageParam: (ultima) => ultima.siguiente,
    placeholderData: keepPreviousData,
  });

export const useProfesional = (id: number) =>
  useQuery({
    queryKey: ['profesional', id],
    queryFn: () => obtenerProfesional(id),
    enabled: Number.isInteger(id) && id > 0,
  });

export const useResumenEspecialidades = () =>
  useQuery({
    queryKey: ['especialidades', 'resumen'],
    queryFn: obtenerResumenEspecialidades,
  });
