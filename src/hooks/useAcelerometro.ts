import { useEffect, useRef, useState } from 'react';
import { Animated, Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import {
  ESPERA_ENTRE_CAMBIOS,
  UMBRAL_SACUDIDA,
  fuerzaDe,
  ladoDe,
  limitar,
} from '../utils/sensores';

type Acciones = {
  onSacudida?: () => void;
  onVolcado?: () => void;
};

export const useAcelerometro = (acciones: Acciones = {}) => {
  const inclinacion = useRef(new Animated.Value(0)).current;
  const guardadas = useRef(acciones);
  const [disponible, setDisponible] = useState(true);

  useEffect(() => {
    guardadas.current = acciones;
  });

  useEffect(() => {
    if (Platform.OS === 'web') {
      setDisponible(false);
      return;
    }

    let suscripcion: { remove: () => void } | null = null;
    let activo = true;

    Accelerometer.isAvailableAsync()
      .then((hay) => {
        if (!activo) {
          return;
        }

        setDisponible(hay);
        if (!hay) {
          return;
        }

        Accelerometer.setUpdateInterval(100);
        let ultimoCambio = 0;
        let ladoAnterior = 0;

        suscripcion = Accelerometer.addListener((medicion) => {
          inclinacion.setValue(limitar(medicion.x, -1, 1));

          const lado = ladoDe(medicion.x);
          const volcado = lado !== 0 && lado !== ladoAnterior;
          ladoAnterior = lado;

          const sacudido = fuerzaDe(medicion) > UMBRAL_SACUDIDA;
          const ahora = Date.now();

          if ((sacudido || volcado) && ahora - ultimoCambio > ESPERA_ENTRE_CAMBIOS) {
            ultimoCambio = ahora;
            if (sacudido) {
              guardadas.current.onSacudida?.();
            } else {
              guardadas.current.onVolcado?.();
            }
          }
        });
      })
      .catch(() => {
        if (activo) {
          setDisponible(false);
        }
      });

    return () => {
      activo = false;
      suscripcion?.remove();
    };
  }, [inclinacion]);

  return { inclinacion, disponible };
};
