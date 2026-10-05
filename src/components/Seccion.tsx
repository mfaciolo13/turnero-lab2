import { ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Tema } from '../theme/tema';

type Props = {
  titulo: string;
  detalle?: string;
  children: ReactNode;
};

const crearEstilos = ({ colores, espacio, fuente }: Tema) =>
  StyleSheet.create({
    contenedor: {
      marginTop: 24,
    },
    cabecera: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingHorizontal: espacio.grande,
      marginBottom: 12,
    },
    titulo: {
      fontSize: fuente.titulo,
      fontWeight: '700',
      color: colores.texto,
    },
    detalle: {
      fontSize: fuente.chica,
      color: colores.textoSuave,
    },
  });

const Seccion = ({ titulo, detalle, children }: Props) => {
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.cabecera}>
        <Text style={estilos.titulo}>{titulo}</Text>
        {detalle ? <Text style={estilos.detalle}>{detalle}</Text> : null}
      </View>
      {children}
    </View>
  );
};

export default Seccion;
