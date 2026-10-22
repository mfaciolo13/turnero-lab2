import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Tema } from '../theme/tema';
import { Paciente } from '../types';

type Props = {
  pacientes: Paciente[];
  seleccionado: number;
  onSeleccionar: (id: number) => void;
  onAgregar: () => void;
};

const crearEstilos = ({ colores, espacio, radio, fuente }: Tema) =>
  StyleSheet.create({
    contenido: { paddingHorizontal: espacio.grande, paddingVertical: 4 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radio.total,
      paddingVertical: 9,
      paddingHorizontal: 14,
      marginRight: 10,
    },
    activo: { backgroundColor: colores.primario, borderColor: colores.primario },
    nombre: { fontSize: fuente.normal, fontWeight: '600', color: colores.texto },
    nombreActivo: { color: colores.superficie },
    parentesco: { marginLeft: 6, fontSize: fuente.chica, color: colores.textoSuave },
    parentescoActivo: { color: colores.primarioSuave },
    agregar: { borderStyle: 'dashed', borderColor: colores.primario },
    agregarTexto: {
      marginLeft: 6,
      fontSize: fuente.normal,
      fontWeight: '600',
      color: colores.primario,
    },
  });

const SelectorPacientes = ({ pacientes, seleccionado, onSeleccionar, onAgregar }: Props) => {
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.contenido}
    >
      {pacientes.map((paciente) => {
        const activo = paciente.id === seleccionado;

        return (
          <TouchableOpacity
            key={paciente.id}
            style={[estilos.chip, activo && estilos.activo]}
            onPress={() => onSeleccionar(paciente.id)}
            activeOpacity={0.7}
            testID={`paciente-${paciente.id}`}
          >
            <Text style={[estilos.nombre, activo && estilos.nombreActivo]}>{paciente.nombre}</Text>
            {paciente.parentesco ? (
              <Text style={[estilos.parentesco, activo && estilos.parentescoActivo]}>
                {paciente.parentesco}
              </Text>
            ) : null}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={[estilos.chip, estilos.agregar]}
        onPress={onAgregar}
        activeOpacity={0.7}
        testID="agregar-familiar"
      >
        <Ionicons name="add" size={16} color={tema.colores.primario} />
        <Text style={estilos.agregarTexto}>Familiar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SelectorPacientes;
