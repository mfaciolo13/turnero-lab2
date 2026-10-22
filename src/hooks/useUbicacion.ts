import { useState } from 'react';
import * as Location from 'expo-location';
import { Ubicacion } from '../types';
import { avisar, avisarGpsApagado, pedirAjustes } from '../utils/dialogos';

export const useUbicacion = () => {
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [buscando, setBuscando] = useState(false);

  const buscar = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        pedirAjustes('Sin permiso de ubicación', 'Activá la ubicación para esta app en Ajustes.');
        return;
      }

      if (!(await Location.hasServicesEnabledAsync())) {
        avisarGpsApagado();
        return;
      }

      setBuscando(true);
      const posicion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = posicion.coords;

      let lugar: string | undefined;
      try {
        const [direccion] = await Location.reverseGeocodeAsync({ latitude, longitude });
        lugar = [direccion?.city ?? direccion?.subregion, direccion?.region, direccion?.country]
          .filter(Boolean)
          .join(', ');
      } catch {
        lugar = undefined;
      }

      setUbicacion({ latitude, longitude, lugar: lugar || undefined });
    } catch {
      avisar(
        'No se pudo obtener la ubicación',
        'Probá de nuevo, cerca de una ventana o al aire libre.',
      );
    } finally {
      setBuscando(false);
    }
  };

  return { ubicacion, buscando, buscar };
};
