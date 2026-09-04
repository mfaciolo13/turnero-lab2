import { StyleSheet, Text, View } from 'react-native';
import { colores } from '../theme/colores';

type Props = {
  titulo: string;
  mensaje: string;
};

const Aviso = ({ titulo, mensaje }: Props) => (
  <View style={estilos.contenedor}>
    <Text style={estilos.titulo}>{titulo}</Text>
    <Text style={estilos.mensaje}>{mensaje}</Text>
  </View>
);

const estilos = StyleSheet.create({
  contenedor: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colores.primarioSuave,
  },
  titulo: {
    fontSize: 14,
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

export default Aviso;
