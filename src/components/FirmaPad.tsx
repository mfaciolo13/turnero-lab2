import { Dispatch, SetStateAction, useMemo } from 'react';
import { GestureResponderEvent, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Tema } from '../theme/tema';
import { GROSOR_FIRMA, Punto, Trazo, segmentoEntre } from '../utils/firma';

type Props = {
  trazos: Trazo[];
  onCambiar: Dispatch<SetStateAction<Trazo[]>>;
};

const crearEstilos = ({ colores, radio, fuente }: Tema) =>
  StyleSheet.create({
    pad: {
      height: 110,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colores.textoSuave,
      borderRadius: radio.medio,
      backgroundColor: colores.fondo,
      overflow: 'hidden',
    },
    ayuda: {
      position: 'absolute',
      alignSelf: 'center',
      top: 44,
      fontSize: fuente.normal,
      color: colores.textoSuave,
    },
    trazos: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' },
    segmento: {
      position: 'absolute',
      height: GROSOR_FIRMA,
      borderRadius: GROSOR_FIRMA,
      backgroundColor: colores.primarioOscuro,
    },
  });

const puntoDe = (evento: GestureResponderEvent): Punto | null => {
  const { locationX, locationY } = evento.nativeEvent;
  return typeof locationX === 'number' && typeof locationY === 'number'
    ? { x: locationX, y: locationY }
    : null;
};

const FirmaPad = ({ trazos, onCambiar }: Props) => {
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);

  const empezar = (evento: GestureResponderEvent) => {
    const punto = puntoDe(evento);
    if (punto) {
      onCambiar((actuales) => [...actuales, [punto]]);
    }
  };

  const mover = (evento: GestureResponderEvent) => {
    const punto = puntoDe(evento);
    if (!punto) {
      return;
    }

    onCambiar((actuales) => {
      if (actuales.length === 0) {
        return actuales;
      }
      const ultimo = actuales[actuales.length - 1];
      return [...actuales.slice(0, -1), [...ultimo, punto]];
    });
  };

  return (
    <View
      style={estilos.pad}
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onTouchStart={empezar}
      onTouchMove={mover}
      testID="firma-pad"
    >
      {trazos.length === 0 ? <Text style={estilos.ayuda}>Firmá acá con el dedo</Text> : null}

      <View style={estilos.trazos}>
        {trazos.map((trazo, indiceTrazo) =>
          trazo.length === 1 ? (
            <View
              key={`punto-${indiceTrazo}`}
              style={[estilos.segmento, { left: trazo[0].x, top: trazo[0].y, width: GROSOR_FIRMA }]}
              testID="segmento-firma"
            />
          ) : (
            trazo.slice(1).map((punto, indice) => {
              const { left, top, width, angulo } = segmentoEntre(trazo[indice], punto);
              return (
                <View
                  key={`segmento-${indiceTrazo}-${indice}`}
                  style={[
                    estilos.segmento,
                    { left, top, width, transform: [{ rotate: `${angulo}rad` }] },
                  ]}
                  testID="segmento-firma"
                />
              );
            })
          ),
        )}
      </View>
    </View>
  );
};

export default FirmaPad;
