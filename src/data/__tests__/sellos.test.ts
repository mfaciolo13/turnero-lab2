import { elegirSelloDistinto, sellos } from '../sellos';

describe('elegirSelloDistinto', () => {
  it('nunca devuelve el sello actual', () => {
    const actual = sellos[0];

    for (let paso = 0; paso < 100; paso++) {
      expect(elegirSelloDistinto(actual, () => paso / 100)).not.toBe(actual);
    }
  });

  it('devuelve un sello de la lista', () => {
    expect(sellos).toContain(elegirSelloDistinto(sellos[2]));
  });

  it('elige el primero de los otros cuando el azar da cero', () => {
    expect(elegirSelloDistinto(sellos[0], () => 0)).toBe(sellos[1]);
  });

  it('elige el último de los otros cuando el azar casi llega a uno', () => {
    expect(elegirSelloDistinto(sellos[0], () => 0.999)).toBe(sellos[sellos.length - 1]);
  });
});
