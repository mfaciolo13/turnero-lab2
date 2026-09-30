import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colores } from '../theme/colores';

type Props = {
  hora: string;
  ocupado: boolean;
  onPress: () => void;
};

const HorarioFila = ({ hora, ocupado, onPress }: Props) => (
  <View style={estilos.fila}>
    <View style={estilos.izquierda}>
      <Ionicons
        name={ocupado ? 'lock-closed-outline' : 'time-outline'}
        size={18}
        color={ocupado ? colores.ocupado : colores.primario}
      />
      <Text style={[estilos.hora, ocupado && estilos.horaOcupada]}>{hora}</Text>
    </View>

    {ocupado ? (
      <Text style={estilos.ocupado}>Reservado</Text>
    ) : (
      <TouchableOpacity style={estilos.boton} onPress={onPress} activeOpacity={0.8}>
        <Text style={estilos.botonTexto}>Reservar</Text>
      </TouchableOpacity>
    )}
  </View>
);

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  izquierda: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hora: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    color: colores.texto,
  },
  horaOcupada: {
    color: colores.textoSuave,
    textDecorationLine: 'line-through',
  },
  ocupado: {
    fontSize: 12,
    fontWeight: '600',
    color: colores.ocupado,
  },
  boton: {
    backgroundColor: colores.primario,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  botonTexto: {
    color: colores.superficie,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default HorarioFila;
