import { ScrollView, StyleSheet } from 'react-native';
import ChipEspecialidad from './ChipEspecialidad';
import { Especialidad } from '../types';

type Props = {
  especialidades: Especialidad[];
  seleccionada: string;
};

const ListaEspecialidades = ({ especialidades, seleccionada }: Props) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={estilos.contenido}
  >
    {especialidades.map((especialidad) => (
      <ChipEspecialidad
        key={especialidad.id}
        nombre={especialidad.nombre}
        disponibles={especialidad.disponibles}
        destacado={especialidad.id === seleccionada}
      />
    ))}
  </ScrollView>
);

const estilos = StyleSheet.create({
  contenido: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
});

export default ListaEspecialidades;
