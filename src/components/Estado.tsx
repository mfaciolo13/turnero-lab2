import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Tema } from '../theme/tema';

type Props = {
  tipo: 'cargando' | 'error' | 'vacio';
  mensaje: string;
  onReintentar?: () => void;
};

const iconos = {
  error: 'cloud-offline-outline',
  vacio: 'calendar-clear-outline',
} as const;

const crearEstilos = ({ colores, espacio, radio, fuente }: Tema) =>
  StyleSheet.create({
    contenedor: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      paddingHorizontal: 24,
    },
    mensaje: {
      marginTop: 12,
      fontSize: fuente.normal,
      lineHeight: 20,
      color: colores.textoSuave,
      textAlign: 'center',
    },
    boton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: radio.chico + 2,
      backgroundColor: colores.primario,
    },
    botonTexto: {
      marginLeft: espacio.chico,
      fontSize: fuente.normal,
      fontWeight: '700',
      color: colores.superficie,
    },
  });

const Estado = ({ tipo, mensaje, onReintentar }: Props) => {
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);

  return (
    <View style={estilos.contenedor}>
      {tipo === 'cargando' ? (
        <ActivityIndicator size="large" color={tema.colores.primario} />
      ) : (
        <Ionicons name={iconos[tipo]} size={40} color={tema.colores.textoSuave} />
      )}

      <Text style={estilos.mensaje}>{mensaje}</Text>

      {onReintentar ? (
        <TouchableOpacity style={estilos.boton} onPress={onReintentar} activeOpacity={0.8}>
          <Ionicons name="refresh" size={16} color={tema.colores.superficie} />
          <Text style={estilos.botonTexto}>Reintentar</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default Estado;
