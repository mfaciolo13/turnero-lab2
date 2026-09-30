import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import EspecialidadItem from '../../src/components/EspecialidadItem';
import { especialidades, profesionales } from '../../src/data/centro';
import { colores } from '../../src/theme/colores';

const Especialidades = () => {
  const router = useRouter();

  const verAgenda = (id: string) => {
    router.navigate({ pathname: '/', params: { especialidad: id } });
  };

  return (
    <View style={estilos.pantalla}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Text style={estilos.bajada}>
          Elegí una especialidad y te llevamos a la agenda del día filtrada.
        </Text>

        {especialidades.map((especialidad) => {
          const delArea = profesionales.filter(
            (profesional) => profesional.especialidad === especialidad.nombre,
          );

          return (
            <EspecialidadItem
              key={especialidad.id}
              nombre={especialidad.nombre}
              profesionales={delArea.length}
              disponibles={especialidad.disponibles}
              onPress={() => verAgenda(especialidad.id)}
            />
          );
        })}
      </ScrollView>
    </View>
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
