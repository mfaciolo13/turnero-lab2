import { useResumenEspecialidades } from './useProfesionales';
import { useTurnosStore } from '../store/turnos';
import { Metrica } from '../types';

export const useIndicadores = (): Metrica[] => {
  const { data } = useResumenEspecialidades();
  const misReservas = useTurnosStore((state) => state.reservas.length);

  const libres = data?.reduce((total, item) => total + item.disponibles, 0);
  const ocupados = data?.reduce((total, item) => total + item.ocupados, 0);

  return [
    {
      id: 'libres',
      valor: libres === undefined ? '-' : String(libres - misReservas),
      etiqueta: 'Turnos libres',
      tono: 'exito',
    },
    {
      id: 'ocupados',
      valor: ocupados === undefined ? '-' : String(ocupados + misReservas),
      etiqueta: 'Reservados',
      tono: 'ocupado',
    },
    { id: 'mios', valor: String(misReservas), etiqueta: 'Mis turnos', tono: 'primario' },
  ];
};
