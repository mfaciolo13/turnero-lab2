import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Boton from './Boton';
import { useUbicacion } from '../hooks/useUbicacion';
import { useTheme } from '../theme/ThemeProvider';
import { Tema } from '../theme/tema';
import { Coordenadas } from '../types';
import { distanciaEnKm, formatearDistancia } from '../utils/distancia';

type Props = {
  centro: Coordenadas;
};

const crearEstilos = ({ colores, espacio, radio, fuente }: Tema) =>
  StyleSheet.create({
    tarjeta: {
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radio.grande,
      padding: espacio.medio + 2,
      marginHorizontal: espacio.grande,
      marginBottom: 26,
    },
    titulo: { fontSize: fuente.titulo - 2, fontWeight: '700', color: colores.texto },
    resultado: { flexDirection: 'row', alignItems: 'center', marginTop: espacio.medio },
    textos: { flex: 1, marginLeft: 10 },
    distancia: { fontSize: fuente.titulo, fontWeight: '700', color: colores.primarioOscuro },
    lugar: { fontSize: fuente.chica + 1, color: colores.textoSuave, marginTop: 2 },
    ayuda: { fontSize: fuente.normal - 1, color: colores.textoSuave, marginTop: 6, lineHeight: 19 },
    accion: { marginTop: espacio.medio },
  });

const DistanciaCentro = ({ centro }: Props) => {
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);
  const { ubicacion, buscando, buscar } = useUbicacion();

  const km = ubicacion ? distanciaEnKm(ubicacion, centro) : null;
  const donde = ubicacion
    ? (ubicacion.lugar ?? `${ubicacion.latitude.toFixed(3)}, ${ubicacion.longitude.toFixed(3)}`)
    : null;

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>¿Qué tan lejos estás?</Text>

      {km !== null ? (
        <View style={estilos.resultado}>
          <Ionicons name="navigate-circle" size={34} color={tema.colores.primario} />
          <View style={estilos.textos}>
            <Text style={estilos.distancia} testID="distancia">
              A {formatearDistancia(km)} del centro
            </Text>
            <Text style={estilos.lugar}>Estás en {donde}</Text>
          </View>
        </View>
      ) : (
        <Text style={estilos.ayuda}>
          Con tu ubicación calculamos la distancia hasta la sede y te avisamos de cuánto tardás.
        </Text>
      )}

      <View style={estilos.accion}>
        <Boton
          titulo={buscando ? 'Buscando ubicación...' : 'Dónde estoy'}
          icono="locate"
          variante="secundario"
          deshabilitado={buscando}
          onPress={buscar}
          testID="boton-ubicacion"
        />
      </View>
    </View>
  );
};

export default DistanciaCentro;
