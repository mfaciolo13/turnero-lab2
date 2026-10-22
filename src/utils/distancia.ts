import { Coordenadas } from '../types';

const RADIO_TIERRA_KM = 6371;

const aRadianes = (grados: number) => (grados * Math.PI) / 180;

export const distanciaEnKm = (origen: Coordenadas, destino: Coordenadas) => {
  const dLatitud = aRadianes(destino.latitude - origen.latitude);
  const dLongitud = aRadianes(destino.longitude - origen.longitude);

  const a =
    Math.sin(dLatitud / 2) ** 2 +
    Math.cos(aRadianes(origen.latitude)) *
      Math.cos(aRadianes(destino.latitude)) *
      Math.sin(dLongitud / 2) ** 2;

  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(a));
};

export const formatearDistancia = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`;
