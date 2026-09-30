import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EspecialidadItem from '../../src/components/EspecialidadItem';
import { especialidades, profesionales } from '../../src/data/centro';
import { colores } from '../../src/theme/colores';

const Especialidades = () => {
  const router = useRouter();

  const verAgenda = (id: string) => {
    router.navigate({ pathname: '/', params: { especialidad: id } });
  };

  const contarProfesionales = (nombre: string) =>
    profesionales.filter((profesional) => profesional.especialidad === nombre).length;

  return (
    <SafeAreaView style={estilos.pantalla} edges={['bottom']}>
      <FlatList
        data={especialidades}
        keyExtractor={(especialidad) => especialidad.id}
        contentContainerStyle={estilos.contenido}
        ListHeaderComponent={
          <Text style={estilos.bajada}>
            Elegí una especialidad y te llevamos a la agenda del día filtrada.
          </Text>
        }
        renderItem={({ item }) => (
          <EspecialidadItem
            nombre={item.nombre}
            profesionales={contarProfesionales(item.nombre)}
            disponibles={item.disponibles}
            onPress={() => verAgenda(item.id)}
          />
        )}
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
