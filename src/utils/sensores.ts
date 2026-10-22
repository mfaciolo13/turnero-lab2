export type Medicion = {
  x: number;
  y: number;
  z: number;
};

export const UMBRAL_SACUDIDA = 1.5;
export const UMBRAL_VUELCO = 0.7;
export const ESPERA_ENTRE_CAMBIOS = 600;

export const fuerzaDe = ({ x, y, z }: Medicion) => Math.sqrt(x * x + y * y + z * z);

export const ladoDe = (x: number) => {
  if (x > UMBRAL_VUELCO) {
    return 1;
  }
  return x < -UMBRAL_VUELCO ? -1 : 0;
};

export const limitar = (valor: number, minimo: number, maximo: number) =>
  Math.max(minimo, Math.min(maximo, valor));
