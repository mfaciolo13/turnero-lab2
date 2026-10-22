import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Tema } from '../theme/tema';

type Variante = 'primario' | 'secundario' | 'peligro';

type Props = {
  titulo: string;
  onPress: () => void;
  icono?: keyof typeof Ionicons.glyphMap;
  variante?: Variante;
  deshabilitado?: boolean;
  testID?: string;
};

const crearEstilos = ({ colores, radio, fuente }: Tema) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: radio.medio,
    },
    primario: { backgroundColor: colores.primario },
    secundario: { backgroundColor: colores.primarioSuave },
    peligro: {
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.ocupado,
    },
    apagado: { opacity: 0.5 },
    texto: { marginLeft: 8, fontSize: fuente.normal, fontWeight: '700' },
  });

const Boton = ({
  titulo,
  onPress,
  icono,
  variante = 'primario',
  deshabilitado,
  testID,
}: Props) => {
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);

  const colorTexto = {
    primario: tema.colores.superficie,
    secundario: tema.colores.primarioOscuro,
    peligro: tema.colores.ocupado,
  }[variante];

  return (
    <TouchableOpacity
      style={[estilos.base, estilos[variante], deshabilitado && estilos.apagado]}
      onPress={onPress}
      disabled={deshabilitado}
      activeOpacity={0.8}
      testID={testID}
    >
      {icono ? <Ionicons name={icono} size={18} color={colorTexto} /> : null}
      <Text style={[estilos.texto, { color: colorTexto }]}>{titulo}</Text>
    </TouchableOpacity>
  );
};

export default Boton;
