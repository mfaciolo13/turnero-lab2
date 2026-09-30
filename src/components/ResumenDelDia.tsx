import { StyleSheet, View } from 'react-native';
import Indicador from './Indicador';
import { colores, sombra } from '../theme/colores';
import { Metrica } from '../types';

type Props = {
  indicadores: Metrica[];
  superpuesto?: boolean;
};

const ResumenDelDia = ({ indicadores, superpuesto }: Props) => (
  <View style={[estilos.contenedor, superpuesto && estilos.superpuesto]}>
    {indicadores.map((indicador) => (
      <Indicador
        key={indicador.id}
        valor={indicador.valor}
        etiqueta={indicador.etiqueta}
        tono={indicador.tono}
      />
    ))}
  </View>
);

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    backgroundColor: colores.superficie,
    marginHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    ...sombra,
  },
  superpuesto: {
    marginTop: -22,
  },
});

export default ResumenDelDia;
