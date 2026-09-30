import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Linking, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HorarioFila from '../../src/components/HorarioFila';
import Estado from '../../src/components/Estado';
import { useProfesional } from '../../src/hooks/useProfesionales';
import { useTurnosStore } from '../../src/store/turnos';
import { agruparPorFranja } from '../../src/utils/franjas';
import { avisar, confirmar } from '../../src/utils/dialogos';
import { colores, degradados, sombra } from '../../src/theme/colores';

const DetalleProfesional = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: profesional, isLoading, isError, refetch } = useProfesional(Number(id));

  const reservas = useTurnosStore((state) => state.reservas);
  const reservar = useTurnosStore((state) => state.reservar);
  const cancelar = useTurnosStore((state) => state.cancelar);

  if (isLoading) {
    return (
      <View style={estilos.centrado}>
        <Estado tipo="cargando" mensaje="Cargando la agenda del profesional..." />
      </View>
    );
  }

  if (isError || !profesional) {
    return (
      <View style={estilos.centrado}>
        <Stack.Screen options={{ title: 'Profesional' }} />
        <Estado
          tipo="error"
          mensaje="No pudimos cargar este profesional."
          onReintentar={refetch}
        />
        <Text style={estilos.volver} onPress={() => router.back()}>
          Volver a la agenda
        </Text>
      </View>
    );
  }

  const idReserva = (hora: string) => `${profesional.id}-${hora}`;
  const esMio = (hora: string) => reservas.some((reserva) => reserva.id === idReserva(hora));

  const franjas = agruparPorFranja(profesional.horarios);
  const libres = profesional.horarios.filter(
    (horario) => !horario.ocupado && !esMio(horario.hora),
  );

  const pedirTurno = (hora: string) => {
    confirmar(
      'Confirmar turno',
      `${profesional.nombre}\n${profesional.especialidad} - hoy a las ${hora}`,
      () => {
        reservar(profesional, hora);
        avisar('Turno reservado', 'Lo vas a encontrar en la pestaña Mis turnos.');
      },
    );
  };

  const soltarTurno = (hora: string) => {
    confirmar('Cancelar turno', `¿Querés liberar el turno de las ${hora}?`, () =>
      cancelar(idReserva(hora)),
    );
  };

  return (
    <SectionList
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      sections={franjas}
      keyExtractor={(horario) => horario.hora}
      stickySectionHeadersEnabled={false}
      extraData={reservas}
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

            <TouchableOpacity
              style={estilos.llamar}
              onPress={() => Linking.openURL(`tel:${profesional.telefono.replace(/[^\d+]/g, '')}`)}
              activeOpacity={0.8}
            >
              <Ionicons name="call-outline" size={16} color={colores.primarioOscuro} />
              <Text style={estilos.llamarTexto}>Llamar al consultorio</Text>
            </TouchableOpacity>
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
          propio={esMio(item.hora)}
          onReservar={() => pedirTurno(item.hora)}
          onCancelar={() => soltarTurno(item.hora)}
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
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
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
  llamar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colores.primarioSuave,
  },
  llamarTexto: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: colores.primarioOscuro,
  },
  franja: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  volver: {
    fontSize: 14,
    fontWeight: '600',
    color: colores.primario,
  },
});

export default DetalleProfesional;
