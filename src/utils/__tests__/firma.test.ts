import { GROSOR_FIRMA, segmentoEntre } from '../firma';

describe('segmentoEntre', () => {
  it('arma un segmento horizontal con ángulo cero', () => {
    const segmento = segmentoEntre({ x: 0, y: 10 }, { x: 40, y: 10 });

    expect(segmento.width).toBe(40);
    expect(segmento.angulo).toBe(0);
    expect(segmento.left).toBe(0);
    expect(segmento.top).toBe(10 - GROSOR_FIRMA / 2);
  });

  it('arma un segmento vertical de un cuarto de vuelta', () => {
    const segmento = segmentoEntre({ x: 5, y: 0 }, { x: 5, y: 20 });

    expect(segmento.width).toBe(20);
    expect(segmento.angulo).toBeCloseTo(Math.PI / 2, 6);
  });

  it('mide la diagonal con Pitágoras', () => {
    expect(segmentoEntre({ x: 0, y: 0 }, { x: 3, y: 4 }).width).toBe(5);
  });

  it('centra el segmento entre los dos puntos', () => {
    const segmento = segmentoEntre({ x: 10, y: 10 }, { x: 30, y: 10 });

    expect(segmento.left + segmento.width / 2).toBe(20);
  });
});
