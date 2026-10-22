import { distanciaEnKm, formatearDistancia } from '../distancia';

const cordoba = { latitude: -31.4201, longitude: -64.1888 };
const buenosAires = { latitude: -34.6037, longitude: -58.3816 };

describe('distanciaEnKm', () => {
  it('es cero entre un punto y él mismo', () => {
    expect(distanciaEnKm(cordoba, cordoba)).toBe(0);
  });

  it('calcula la distancia entre Córdoba y Buenos Aires', () => {
    const km = distanciaEnKm(cordoba, buenosAires);

    expect(km).toBeGreaterThan(640);
    expect(km).toBeLessThan(655);
  });

  it('da lo mismo en un sentido que en el otro', () => {
    expect(distanciaEnKm(cordoba, buenosAires)).toBeCloseTo(distanciaEnKm(buenosAires, cordoba), 6);
  });
});

describe('formatearDistancia', () => {
  it('muestra metros cuando es menos de un kilómetro', () => {
    expect(formatearDistancia(0.45)).toBe('450 m');
  });

  it('muestra kilómetros con una coma decimal', () => {
    expect(formatearDistancia(3.24)).toBe('3,2 km');
  });

  it('muestra un kilómetro justo como kilómetros', () => {
    expect(formatearDistancia(1)).toBe('1,0 km');
  });
});
