import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HorarioChip from './HorarioChip';
import { colores, sombra } from '../theme/colores';
import { Profesional } from '../types';

type Props = Omit<Profesional, 'id' | 'telefono'> & {
  onPress: () => void;
  onElegirHorario: (hora: string) => void;
};

const ProfesionalCard = ({
  nombre,
  especialidad,
  consultorio,
  foto,
  valoracion,
  cobertura,
  horarios,
  onPress,
  onElegirHorario,
}: Props) => {
  const libres = horarios.filter((horario) => !horario.ocupado).length;

  return (
    <View style={estilos.tarjeta}>
      <TouchableOpacity style={estilos.cabecera} onPress={onPress} activeOpacity={0.7}>
        <Image style={estilos.foto} source={{ uri: foto }} />
        <View style={estilos.datos}>
          <Text style={estilos.nombre}>{nombre}</Text>
          <Text style={estilos.especialidad}>{especialidad}</Text>
          <View style={estilos.consultorio}>
            <Ionicons name="location-outline" size={13} color={colores.textoSuave} />
            <Text style={estilos.consultorioTexto}>{consultorio}</Text>
          </View>
          <View style={estilos.valoracion}>
            <Ionicons name="star" size={13} color="#E0A106" />
            <Text style={estilos.puntaje}>{valoracion}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <Text style={estilos.cobertura}>{cobertura}</Text>

      <View style={estilos.separador} />

      <View style={estilos.filaHorarios}>
        <Text style={estilos.tituloHorarios}>Turnos de hoy</Text>
        <Text style={estilos.contador}>{libres} disponibles</Text>
      </View>

      <View style={estilos.horarios}>
        {horarios.map((horario) => (
          <HorarioChip
            key={horario.hora}
            hora={horario.hora}
            ocupado={horario.ocupado}
            onPress={() => onElegirHorario(horario.hora)}
          />
        ))}
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 14,
    ...sombra,
  },
  cabecera: {
    flexDirection: 'row',
  },
  foto: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colores.primarioSuave,
  },
  datos: {
    flex: 1,
    marginLeft: 14,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '700',
    color: colores.texto,
  },
  especialidad: {
    fontSize: 13,
    fontWeight: '600',
    color: colores.primario,
    marginTop: 2,
  },
  consultorio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  consultorioTexto: {
    marginLeft: 4,
    fontSize: 12,
    color: colores.textoSuave,
  },
  valoracion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  puntaje: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colores.texto,
  },
  cobertura: {
    marginTop: 12,
    fontSize: 12,
    color: colores.textoSuave,
  },
  separador: {
    height: 1,
    backgroundColor: colores.borde,
    marginVertical: 12,
  },
  filaHorarios: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tituloHorarios: {
    fontSize: 13,
    fontWeight: '700',
    color: colores.texto,
  },
  contador: {
    fontSize: 12,
    color: colores.exito,
    fontWeight: '600',
  },
  horarios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default ProfesionalCard;
