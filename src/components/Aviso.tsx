import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Tema } from '../theme/tema';

type Props = {
  titulo: string;
  mensaje: string;
};

const crearEstilos = ({ colores, espacio, radio, fuente }: Tema) =>
  StyleSheet.create({
    contenedor: {
      marginHorizontal: espacio.grande,
      marginTop: 24,
      marginBottom: 32,
      padding: 16,
      borderRadius: radio.medio + 2,
      backgroundColor: colores.primarioSuave,
    },
    titulo: {
      fontSize: fuente.normal,
      fontWeight: '700',
      color: colores.primarioOscuro,
    },
    mensaje: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 19,
      color: colores.primarioOscuro,
    },
  });

const Aviso = ({ titulo, mensaje }: Props) => {
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.mensaje}>{mensaje}</Text>
    </View>
  );
};

export default Aviso;
