import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { colores } from '../theme/colores';

type Props = {
  valor: string;
  onCambiar: (texto: string) => void;
  placeholder: string;
};

const Buscador = ({ valor, onCambiar, placeholder }: Props) => (
  <View style={estilos.contenedor}>
    <Ionicons name="search" size={18} color={colores.textoSuave} />
    <TextInput
      style={estilos.input}
      value={valor}
      onChangeText={onCambiar}
      placeholder={placeholder}
      placeholderTextColor={colores.textoSuave}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
    />
    {valor.length > 0 ? (
      <TouchableOpacity onPress={() => onCambiar('')} activeOpacity={0.7}>
        <Ionicons name="close-circle" size={18} color={colores.textoSuave} />
      </TouchableOpacity>
    ) : null}
  </View>
);

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginHorizontal: 20,
    height: 46,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colores.texto,
  },
});

export default Buscador;
