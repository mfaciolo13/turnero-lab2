import { StyleSheet, Text, View } from 'react-native';
import { colores } from '../theme/colores';

type Props = {
  nombre: string;
  disponibles: number;
  destacado: boolean;
};

const ChipEspecialidad = ({ nombre, disponibles, destacado }: Props) => (
  <View style={[estilos.contenedor, destacado && estilos.destacado]}>
    <Text style={[estilos.nombre, destacado && estilos.nombreDestacado]}>{nombre}</Text>
    <View style={[estilos.globo, destacado && estilos.globoDestacado]}>
      <Text style={[estilos.cantidad, destacado && estilos.cantidadDestacada]}>{disponibles}</Text>
    </View>
  </View>
);

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 999,
    paddingVertical: 9,
    paddingLeft: 16,
    paddingRight: 9,
    marginRight: 10,
  },
  destacado: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  nombre: {
    fontSize: 14,
    fontWeight: '600',
    color: colores.texto,
  },
  nombreDestacado: {
    color: colores.superficie,
  },
  globo: {
    marginLeft: 8,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.primarioSuave,
  },
  globoDestacado: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  cantidad: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.primarioOscuro,
  },
  cantidadDestacada: {
    color: colores.superficie,
  },
});

export default ChipEspecialidad;
