import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colores } from '../theme/colores';

type Props = {
  hora: string;
  ocupado: boolean;
  propio: boolean;
  onReservar: () => void;
  onCancelar: () => void;
};

const HorarioFila = ({ hora, ocupado, propio, onReservar, onCancelar }: Props) => {
  const escala = useRef(new Animated.Value(1)).current;
  const eraPropio = useRef(propio);

  useEffect(() => {
    if (propio && !eraPropio.current) {
      Animated.sequence([
        Animated.spring(escala, { toValue: 1.06, useNativeDriver: true }),
        Animated.spring(escala, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
    eraPropio.current = propio;
  }, [propio, escala]);

  const icono = propio ? 'checkmark-circle' : ocupado ? 'lock-closed-outline' : 'time-outline';
  const color = propio ? colores.exito : ocupado ? colores.ocupado : colores.primario;

  return (
    <Animated.View
      style={[estilos.fila, propio && estilos.filaPropia, { transform: [{ scale: escala }] }]}
    >
      <View style={estilos.izquierda}>
        <Ionicons name={icono} size={18} color={color} />
        <Text style={[estilos.hora, ocupado && !propio && estilos.horaOcupada]}>{hora}</Text>
        {propio ? <Text style={estilos.etiqueta}>Tu turno</Text> : null}
      </View>

      {propio ? (
        <TouchableOpacity style={estilos.botonCancelar} onPress={onCancelar} activeOpacity={0.8}>
          <Text style={estilos.botonCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>
      ) : ocupado ? (
        <Text style={estilos.ocupado}>Reservado</Text>
      ) : (
        <TouchableOpacity style={estilos.boton} onPress={onReservar} activeOpacity={0.8}>
          <Text style={estilos.botonTexto}>Reservar</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

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
  filaPropia: {
    borderColor: '#C6E4D2',
    backgroundColor: colores.exitoSuave,
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
  etiqueta: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '700',
    color: colores.exito,
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
  botonCancelar: {
    borderWidth: 1,
    borderColor: colores.ocupado,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  botonCancelarTexto: {
    color: colores.ocupado,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default HorarioFila;
