import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colores, sombra } from '../theme/colores';

type Props = {
  nombre: string;
  profesionales: number;
  disponibles: number;
  onPress: () => void;
};

const EspecialidadItem = ({ nombre, profesionales, disponibles, onPress }: Props) => (
  <TouchableOpacity style={estilos.fila} onPress={onPress} activeOpacity={0.7}>
    <View style={estilos.inicial}>
      <Text style={estilos.inicialTexto}>{nombre.charAt(0)}</Text>
    </View>
    <View style={estilos.textos}>
      <Text style={estilos.nombre}>{nombre}</Text>
      <Text style={estilos.detalle}>
        {profesionales} profesional{profesionales === 1 ? '' : 'es'} · {disponibles} turnos libres
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colores.textoSuave} />
  </TouchableOpacity>
);

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    ...sombra,
  },
  inicial: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicialTexto: {
    fontSize: 17,
    fontWeight: '700',
    color: colores.primarioOscuro,
  },
  textos: {
    flex: 1,
    marginLeft: 14,
  },
  nombre: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  detalle: {
    fontSize: 12,
    color: colores.textoSuave,
    marginTop: 3,
  },
});

export default EspecialidadItem;
