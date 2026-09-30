import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EspecialidadItem from '../../src/components/EspecialidadItem';
import Estado from '../../src/components/Estado';
import { useResumenEspecialidades } from '../../src/hooks/useProfesionales';
import { colores } from '../../src/theme/colores';

const Especialidades = () => {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } = useResumenEspecialidades();

  const verAgenda = (id: string) => {
    router.navigate({ pathname: '/', params: { especialidad: id } });
  };

  return (
    <SafeAreaView style={estilos.pantalla} edges={['bottom']}>
      <FlatList
        data={data ?? []}
        keyExtractor={(especialidad) => especialidad.id}
        contentContainerStyle={estilos.contenido}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListHeaderComponent={
          <Text style={estilos.bajada}>
            Elegí una especialidad y te llevamos a la agenda del día filtrada.
          </Text>
        }
        renderItem={({ item }) => (
          <EspecialidadItem
            nombre={item.nombre}
            profesionales={item.profesionales}
            disponibles={item.disponibles}
            onPress={() => verAgenda(item.id)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <Estado tipo="cargando" mensaje="Contando turnos disponibles..." />
          ) : isError ? (
            <Estado
              tipo="error"
              mensaje="No pudimos traer las especialidades."
              onReintentar={refetch}
            />
          ) : null
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
    marginBottom: 16,
    lineHeight: 19,
  },
});

export default Especialidades;
