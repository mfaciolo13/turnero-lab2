import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colores } from '../theme/colores';

type Props = {
  tipo: 'cargando' | 'error' | 'vacio';
  mensaje: string;
  onReintentar?: () => void;
};

const iconos = {
  error: 'cloud-offline-outline',
  vacio: 'calendar-clear-outline',
} as const;

const Estado = ({ tipo, mensaje, onReintentar }: Props) => (
  <View style={estilos.contenedor}>
    {tipo === 'cargando' ? (
      <ActivityIndicator size="large" color={colores.primario} />
    ) : (
      <Ionicons name={iconos[tipo]} size={40} color={colores.textoSuave} />
    )}

    <Text style={estilos.mensaje}>{mensaje}</Text>

    {onReintentar ? (
      <TouchableOpacity style={estilos.boton} onPress={onReintentar} activeOpacity={0.8}>
        <Ionicons name="refresh" size={16} color={colores.superficie} />
        <Text style={estilos.botonTexto}>Reintentar</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  mensaje: {
    marginTop: 12,
    fontSize: 14,
    color: colores.textoSuave,
    textAlign: 'center',
    lineHeight: 20,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: colores.primario,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  botonTexto: {
    marginLeft: 8,
    color: colores.superficie,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default Estado;
