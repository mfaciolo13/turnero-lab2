import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colores } from '../theme/colores';

type Props = {
  titulo: string;
  detalle?: string;
  children: ReactNode;
};

const Seccion = ({ titulo, detalle, children }: Props) => (
  <View style={estilos.contenedor}>
    <View style={estilos.cabecera}>
      <Text style={estilos.titulo}>{titulo}</Text>
      {detalle ? <Text style={estilos.detalle}>{detalle}</Text> : null}
    </View>
    {children}
  </View>
);

const estilos = StyleSheet.create({
  contenedor: {
    marginTop: 24,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colores.texto,
  },
  detalle: {
    fontSize: 12,
    color: colores.textoSuave,
  },
});

export default Seccion;
