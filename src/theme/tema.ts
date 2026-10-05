import { colores, degradados, sombra } from './colores';

export const tema = {
  colores,
  degradados,
  sombra,
  espacio: {
    chico: 8,
    medio: 14,
    grande: 20,
  },
  radio: {
    chico: 10,
    medio: 14,
    grande: 18,
    total: 999,
  },
  fuente: {
    chica: 12,
    normal: 14,
    titulo: 17,
    numero: 24,
  },
};

export type Tema = typeof tema;
