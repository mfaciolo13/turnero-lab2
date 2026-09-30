import { LinearGradient } from 'expo-linear-gradient';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colores, degradados } from '../theme/colores';

type Props = {
  nombre: string;
  sede: string;
  fecha: string;
  logo: ImageSourcePropType;
};

const Encabezado = ({ nombre, sede, fecha, logo }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={degradados.encabezado}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[estilos.contenedor, { paddingTop: insets.top + 16 }]}
    >
      <View style={estilos.fila}>
        <Image style={estilos.logo} source={logo} />
        <View style={estilos.textos}>
          <Text style={estilos.nombre}>{nombre}</Text>
          <Text style={estilos.sede}>{sede}</Text>
        </View>
      </View>
      <View style={estilos.fecha}>
        <Text style={estilos.fechaTexto}>{fecha}</Text>
      </View>
    </LinearGradient>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colores.primario,
  },
  textos: {
    marginLeft: 14,
    flex: 1,
  },
  nombre: {
    color: colores.superficie,
    fontSize: 20,
    fontWeight: '700',
  },
  sede: {
    color: colores.primarioSuave,
    fontSize: 13,
    marginTop: 2,
  },
  fecha: {
    marginTop: 18,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  fechaTexto: {
    color: colores.superficie,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default Encabezado;
