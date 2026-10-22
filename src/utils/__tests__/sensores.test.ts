import { fuerzaDe, ladoDe, limitar } from '../sensores';

describe('fuerzaDe', () => {
  it('vale 1 g con el celular quieto sobre una mesa', () => {
    expect(fuerzaDe({ x: 0, y: 0, z: 1 })).toBe(1);
  });

  it('suma los tres ejes', () => {
    expect(fuerzaDe({ x: 1, y: 2, z: 2 })).toBe(3);
  });

  it('supera 1,5 g cuando se agita', () => {
    expect(fuerzaDe({ x: 1.2, y: 0.8, z: 0.6 })).toBeGreaterThan(1.5);
  });
});

describe('ladoDe', () => {
  it('detecta la inclinación fuerte a la derecha', () => {
    expect(ladoDe(0.8)).toBe(1);
  });

  it('detecta la inclinación fuerte a la izquierda', () => {
    expect(ladoDe(-0.8)).toBe(-1);
  });

  it('no detecta nada con una inclinación suave', () => {
    expect(ladoDe(0.3)).toBe(0);
    expect(ladoDe(-0.3)).toBe(0);
  });

  it('necesita pasar el umbral y no solo llegar a él', () => {
    expect(ladoDe(0.7)).toBe(0);
  });
});

describe('limitar', () => {
  it('deja pasar un valor dentro del rango', () => {
    expect(limitar(0.4, -1, 1)).toBe(0.4);
  });

  it('corta los valores que se pasan', () => {
    expect(limitar(3, -1, 1)).toBe(1);
    expect(limitar(-3, -1, 1)).toBe(-1);
  });
});
