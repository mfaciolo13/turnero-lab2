import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Image, Platform, SectionList, StyleSheet, Text, View } from 'react-native';
import HorarioFila from '../../src/components/HorarioFila';
import { profesionales } from '../../src/data/centro';
import { agruparPorFranja } from '../../src/utils/franjas';
import { colores, degradados, sombra } from '../../src/theme/colores';

const avisar = (titulo: string, mensaje: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
};

const DetalleProfesional = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const profesional = profesionales.find((item) => item.id === Number(id));

  if (!profesional) {
    return (
      <View style={estilos.vacio}>
        <Stack.Screen options={{ title: 'Profesional' }} />
        <Ionicons name="alert-circle-outline" size={42} color={colores.textoSuave} />
        <Text style={estilos.vacioTexto}>No encontramos ese profesional.</Text>
        <Text style={estilos.volver} onPress={() => router.back()}>
          Volver a la agenda
        </Text>
      </View>
    );
  }

  const franjas = agruparPorFranja(profesional.horarios);
  const libres = profesional.horarios.filter((horario) => !horario.ocupado);

  return (
    <SectionList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      sections={franjas}
      keyExtractor={(horario) => horario.hora}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View>
          <Stack.Screen options={{ title: profesional.especialidad }} />

          <LinearGradient
            colors={degradados.encabezado}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={estilos.cabecera}
          >
            <Image style={estilos.foto} source={{ uri: profesional.foto }} />
            <Text style={estilos.nombre}>{profesional.nombre}</Text>
            <Text style={estilos.especialidad}>{profesional.especialidad}</Text>
            <View style={estilos.valoracion}>
              <Ionicons name="star" size={13} color="#FFD166" />
              <Text style={estilos.puntaje}>{profesional.valoracion}</Text>
            </View>
          </LinearGradient>

          <View style={estilos.tarjeta}>
            <View style={estilos.datoFila}>
              <Ionicons name="location-outline" size={18} color={colores.primario} />
              <Text style={estilos.dato}>{profesional.consultorio}</Text>
            </View>
            <View style={estilos.datoFila}>
              <Ionicons name="card-outline" size={18} color={colores.primario} />
              <Text style={estilos.dato}>{profesional.cobertura}</Text>
            </View>
            <View style={estilos.datoFila}>
              <Ionicons name="calendar-outline" size={18} color={colores.primario} />
              <Text style={estilos.dato}>
                {libres.length} de {profesional.horarios.length} horarios disponibles
              </Text>
            </View>
          </View>
        </View>
      }
      renderSectionHeader={({ section }) => (
        <Text style={estilos.franja}>{section.titulo}</Text>
      )}
      renderItem={({ item }) => (
        <HorarioFila
          hora={item.hora}
          ocupado={item.ocupado}
          onPress={() => avisar('Turno seleccionado', `${profesional.nombre} a las ${item.hora}`)}
        />
      )}
    />
  );
};

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    paddingBottom: 32,
  },
  cabecera: {
    alignItems: 'center',
    paddingVertical: 26,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  foto: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colores.primarioSuave,
  },
  nombre: {
    marginTop: 14,
    fontSize: 19,
    fontWeight: '700',
    color: colores.superficie,
  },
  especialidad: {
    marginTop: 3,
    fontSize: 13,
    color: colores.primarioSuave,
  },
  valoracion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  puntaje: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '600',
    color: colores.superficie,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 18,
    ...sombra,
  },
  datoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  dato: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: colores.texto,
    lineHeight: 19,
  },
  franja: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  vacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
    padding: 24,
  },
  vacioTexto: {
    marginTop: 10,
    fontSize: 15,
    color: colores.texto,
  },
  volver: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: colores.primario,
  },
});

export default DetalleProfesional;
