import { useRouter } from 'expo-router';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReservaCard from '../../src/components/ReservaCard';
import Estado from '../../src/components/Estado';
import { useTurnosStore } from '../../src/store/turnos';
import { agruparPorFranja } from '../../src/utils/franjas';
import { confirmar } from '../../src/utils/dialogos';
import { colores } from '../../src/theme/colores';

const MisTurnos = () => {
  const router = useRouter();
  const reservas = useTurnosStore((state) => state.reservas);
  const cancelar = useTurnosStore((state) => state.cancelar);

  const quitar = (id: string, hora: string) => {
    confirmar('Cancelar turno', `¿Querés liberar el turno de las ${hora}?`, () => cancelar(id));
  };

  return (
    <SafeAreaView style={estilos.pantalla} edges={['bottom']}>
      <SectionList
        sections={agruparPorFranja(reservas)}
        keyExtractor={(reserva) => reserva.id}
        contentContainerStyle={estilos.contenido}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          reservas.length > 0 ? (
            <Text style={estilos.bajada}>
              Tenés {reservas.length} turno{reservas.length === 1 ? '' : 's'} para hoy. Tocá uno
              para ver el comprobante.
            </Text>
          ) : null
        }
        renderSectionHeader={({ section }) => (
          <Text style={estilos.franja}>{section.titulo}</Text>
        )}
        renderItem={({ item }) => (
          <ReservaCard
            profesional={item.profesional}
            especialidad={item.especialidad}
            consultorio={item.consultorio}
            foto={item.foto}
            hora={item.hora}
            tieneOrden={item.orden !== null}
            onPress={() => router.push({ pathname: '/turno/[id]', params: { id: item.id } })}
            onCancelar={() => quitar(item.id, item.hora)}
          />
        )}
        ListEmptyComponent={
          <View>
            <Estado tipo="vacio" mensaje="Todavía no reservaste ningún turno." />
            <TouchableOpacity
              style={estilos.boton}
              onPress={() => router.navigate('/')}
              activeOpacity={0.8}
            >
              <Text style={estilos.botonTexto}>Ir a la agenda</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    paddingVertical: 18,
  },
  bajada: {
    fontSize: 13,
    color: colores.textoSuave,
    marginHorizontal: 20,
    lineHeight: 19,
  },
  franja: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 10,
  },
  boton: {
    alignSelf: 'center',
    backgroundColor: colores.primario,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
  },
  botonTexto: {
    color: colores.superficie,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default MisTurnos;
