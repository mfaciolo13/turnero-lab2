import { Horario } from '../types';

export type FranjaHoraria = {
  titulo: string;
  data: Horario[];
};

export const agruparPorFranja = (horarios: Horario[]): FranjaHoraria[] => {
  const manana = horarios.filter((horario) => Number(horario.hora.slice(0, 2)) < 13);
  const tarde = horarios.filter((horario) => Number(horario.hora.slice(0, 2)) >= 13);

  return [
    { titulo: 'Mañana', data: manana },
    { titulo: 'Tarde', data: tarde },
  ].filter((franja) => franja.data.length > 0);
};
