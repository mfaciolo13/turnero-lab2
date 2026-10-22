import { Ref, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Tema } from '../theme/tema';
import { Reserva } from '../types';

type Props = {
  reserva: Reserva;
  cardRef?: Ref<View>;
};

const crearEstilos = ({ colores, espacio, radio, fuente }: Tema) =>
  StyleSheet.create({
    tarjeta: {
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radio.grande,
      padding: espacio.medio + 2,
    },
    cabecera: { flexDirection: 'row', alignItems: 'center' },
    foto: {
      width: 60,
      height: 60,
      borderRadius: radio.medio,
      backgroundColor: colores.primarioSuave,
    },
    datos: { flex: 1, marginLeft: espacio.medio },
    nombre: { fontSize: 16, fontWeight: '700', color: colores.texto },
    especialidad: { fontSize: 13, fontWeight: '600', color: colores.primario, marginTop: 2 },
    separador: { height: 1, backgroundColor: colores.borde, marginVertical: espacio.medio },
    fila: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    dato: { marginLeft: 10, fontSize: fuente.normal, color: colores.texto, flex: 1 },
    titulo: {
      fontSize: fuente.chica,
      fontWeight: '700',
      color: colores.textoSuave,
      marginTop: espacio.chico,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    orden: {
      width: '100%',
      height: 180,
      borderRadius: radio.medio,
      backgroundColor: colores.fondo,
    },
    sinOrden: { alignItems: 'center', justifyContent: 'center' },
    sinOrdenTexto: { fontSize: fuente.normal, color: colores.textoSuave },
  });

const ComprobanteCard = ({ reserva, cardRef }: Props) => {
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);

  return (
    <View ref={cardRef} collapsable={false} style={estilos.tarjeta} testID="comprobante">
      <View style={estilos.cabecera}>
        <Image style={estilos.foto} source={{ uri: reserva.foto }} />
        <View style={estilos.datos}>
          <Text style={estilos.nombre}>{reserva.profesional}</Text>
          <Text style={estilos.especialidad}>{reserva.especialidad}</Text>
        </View>
      </View>

      <View style={estilos.separador} />

      <View style={estilos.fila}>
        <Ionicons name="time-outline" size={18} color={tema.colores.primario} />
        <Text style={estilos.dato}>Hoy a las {reserva.hora} hs</Text>
      </View>
      <View style={estilos.fila}>
        <Ionicons name="location-outline" size={18} color={tema.colores.primario} />
        <Text style={estilos.dato}>{reserva.consultorio}</Text>
      </View>

      <Text style={estilos.titulo}>Orden médica</Text>
      {reserva.orden ? (
        <Image
          style={estilos.orden}
          source={{ uri: reserva.orden }}
          resizeMode="cover"
          testID="imagen-orden"
        />
      ) : (
        <View style={[estilos.orden, estilos.sinOrden]}>
          <Text style={estilos.sinOrdenTexto}>Sin orden adjunta</Text>
        </View>
      )}
    </View>
  );
};

export default ComprobanteCard;
