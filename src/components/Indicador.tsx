import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Tema } from '../theme/tema';
import { Tono } from '../types';

type Props = {
  valor: string;
  etiqueta: string;
  tono: Tono;
};

const crearEstilos = ({ colores, espacio, fuente }: Tema) =>
  StyleSheet.create({
    contenedor: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: espacio.medio,
    },
    valor: {
      fontSize: fuente.numero,
      fontWeight: '700',
    },
    etiqueta: {
      marginTop: 4,
      fontSize: fuente.chica,
      color: colores.textoSuave,
      textAlign: 'center',
    },
  });

const Indicador = ({ valor, etiqueta, tono }: Props) => {
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);

  return (
    <View style={estilos.contenedor}>
      <Text style={[estilos.valor, { color: tema.colores[tono] }]}>{valor}</Text>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
    </View>
  );
};

export default Indicador;
