import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colores, sombra } from '../theme/colores';
import { Reserva } from '../types';

type Props = Omit<Reserva, 'id' | 'profesionalId' | 'orden'> & {
  tieneOrden: boolean;
  onPress: () => void;
  onCancelar: () => void;
};

const ReservaCard = ({
  profesional,
  especialidad,
  consultorio,
  foto,
  hora,
  tieneOrden,
  onPress,
  onCancelar,
}: Props) => (
  <TouchableOpacity style={estilos.tarjeta} onPress={onPress} activeOpacity={0.8}>
    <View style={estilos.hora}>
      <Text style={estilos.horaTexto}>{hora}</Text>
      <Text style={estilos.horaEtiqueta}>hs</Text>
    </View>

    <Image style={estilos.foto} source={{ uri: foto }} />

    <View style={estilos.datos}>
      <Text style={estilos.nombre} numberOfLines={1}>
        {profesional}
      </Text>
      <Text style={estilos.especialidad}>{especialidad}</Text>
      <Text style={estilos.consultorio} numberOfLines={1}>
        {consultorio}
      </Text>
      <View style={estilos.orden}>
        <Ionicons
          name={tieneOrden ? 'checkmark-circle' : 'document-attach-outline'}
          size={13}
          color={tieneOrden ? colores.exito : colores.textoSuave}
        />
        <Text style={[estilos.ordenTexto, tieneOrden && estilos.ordenAdjunta]}>
          {tieneOrden ? 'Orden adjunta' : 'Sin orden'}
        </Text>
      </View>
    </View>

    <TouchableOpacity style={estilos.cancelar} onPress={onCancelar} activeOpacity={0.7}>
      <Ionicons name="trash-outline" size={18} color={colores.ocupado} />
    </TouchableOpacity>
  </TouchableOpacity>
);

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    ...sombra,
  },
  hora: {
    width: 58,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colores.primarioSuave,
  },
  horaTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.primarioOscuro,
  },
  horaEtiqueta: {
    fontSize: 11,
    color: colores.primarioOscuro,
  },
  foto: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginLeft: 12,
    backgroundColor: colores.primarioSuave,
  },
  datos: {
    flex: 1,
    marginLeft: 12,
  },
  nombre: {
    fontSize: 14,
    fontWeight: '700',
    color: colores.texto,
  },
  especialidad: {
    fontSize: 12,
    fontWeight: '600',
    color: colores.primario,
    marginTop: 2,
  },
  consultorio: {
    fontSize: 12,
    color: colores.textoSuave,
    marginTop: 2,
  },
  orden: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ordenTexto: {
    marginLeft: 4,
    fontSize: 11,
    color: colores.textoSuave,
  },
  ordenAdjunta: {
    color: colores.exito,
  },
  cancelar: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 10,
    backgroundColor: colores.ocupadoSuave,
  },
});

export default ReservaCard;
