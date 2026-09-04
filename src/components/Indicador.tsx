import { StyleSheet, Text, View } from 'react-native';
import { colores } from '../theme/colores';
import { Tono } from '../types';

type Props = {
  valor: string;
  etiqueta: string;
  tono: Tono;
};

const tonos: Record<Tono, string> = {
  exito: colores.exito,
  primario: colores.primario,
  ocupado: colores.ocupado,
};

const Indicador = ({ valor, etiqueta, tono }: Props) => (
  <View style={estilos.contenedor}>
    <Text style={[estilos.valor, { color: tonos[tono] }]}>{valor}</Text>
    <Text style={estilos.etiqueta}>{etiqueta}</Text>
  </View>
);

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  valor: {
    fontSize: 24,
    fontWeight: '700',
  },
  etiqueta: {
    marginTop: 4,
    fontSize: 12,
    color: colores.textoSuave,
    textAlign: 'center',
  },
});

export default Indicador;
