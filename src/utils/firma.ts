export type Punto = {
  x: number;
  y: number;
};

export type Trazo = Punto[];

export const GROSOR_FIRMA = 3;

export const segmentoEntre = (a: Punto, b: Punto) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const largo = Math.sqrt(dx * dx + dy * dy);

  return {
    left: (a.x + b.x) / 2 - largo / 2,
    top: (a.y + b.y) / 2 - GROSOR_FIRMA / 2,
    width: largo,
    angulo: Math.atan2(dy, dx),
  };
};
