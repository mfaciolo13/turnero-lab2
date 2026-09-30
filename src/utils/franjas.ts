export type FranjaHoraria<T> = {
  titulo: string;
  data: T[];
};

const esDeManana = (hora: string) => Number(hora.slice(0, 2)) < 13;

export const agruparPorFranja = <T extends { hora: string }>(items: T[]): FranjaHoraria<T>[] =>
  [
    { titulo: 'Mañana', data: items.filter((item) => esDeManana(item.hora)) },
    { titulo: 'Tarde', data: items.filter((item) => !esDeManana(item.hora)) },
  ].filter((franja) => franja.data.length > 0);
