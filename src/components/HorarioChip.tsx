import { StyleSheet, Text, TouchableHighlight } from 'react-native';
import { colores } from '../theme/colores';

type Props = {
  hora: string;
  ocupado: boolean;
  onPress: () => void;
};

const HorarioChip = ({ hora, ocupado, onPress }: Props) => (
  <TouchableHighlight
    style={[estilos.contenedor, ocupado ? estilos.ocupado : estilos.libre]}
    onPress={onPress}
    disabled={ocupado}
    underlayColor={colores.primarioSuave}
    activeOpacity={0.8}
  >
    <Text style={[estilos.hora, ocupado ? estilos.horaOcupada : estilos.horaLibre]}>{hora}</Text>
  </TouchableHighlight>
);

const estilos = StyleSheet.create({
  contenedor: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 8,
    marginTop: 8,
    borderWidth: 1,
  },
  libre: {
    backgroundColor: colores.exitoSuave,
    borderColor: '#C6E4D2',
  },
  ocupado: {
    backgroundColor: colores.ocupadoSuave,
    borderColor: '#F0DCC0',
  },
  hora: {
    fontSize: 13,
    fontWeight: '600',
  },
  horaLibre: {
    color: colores.exito,
  },
  horaOcupada: {
    color: colores.ocupado,
    textDecorationLine: 'line-through',
  },
});

export default HorarioChip;
