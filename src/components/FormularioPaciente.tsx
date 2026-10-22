import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Boton from './Boton';
import { useTheme } from '../theme/ThemeProvider';
import { Tema } from '../theme/tema';

type Props = {
  guardando: boolean;
  onCrear: (nombre: string, parentesco: string) => void;
  onCancelar: () => void;
};

const crearEstilos = ({ colores, espacio, radio, fuente }: Tema) =>
  StyleSheet.create({
    tarjeta: {
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radio.grande,
      marginHorizontal: espacio.grande,
      marginTop: espacio.medio,
      padding: espacio.medio + 2,
    },
    titulo: { fontSize: fuente.normal, fontWeight: '700', color: colores.texto, marginBottom: 10 },
    input: {
      height: 44,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radio.medio,
      paddingHorizontal: 12,
      fontSize: fuente.normal,
      color: colores.texto,
      backgroundColor: colores.fondo,
      marginBottom: 10,
    },
    espacio: { height: 8 },
  });

const FormularioPaciente = ({ guardando, onCrear, onCancelar }: Props) => {
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);
  const [nombre, setNombre] = useState('');
  const [parentesco, setParentesco] = useState('');

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>Nuevo familiar</Text>
      <TextInput
        style={estilos.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Nombre"
        placeholderTextColor={tema.colores.textoSuave}
        testID="input-nombre-familiar"
      />
      <TextInput
        style={estilos.input}
        value={parentesco}
        onChangeText={setParentesco}
        placeholder="Parentesco (ej. Hija)"
        placeholderTextColor={tema.colores.textoSuave}
        testID="input-parentesco-familiar"
      />
      <Boton
        titulo="Agregar familiar"
        icono="person-add"
        deshabilitado={nombre.trim() === '' || guardando}
        onPress={() => onCrear(nombre.trim(), parentesco.trim())}
        testID="boton-crear-familiar"
      />
      <View style={estilos.espacio} />
      <Boton titulo="Cancelar" variante="secundario" onPress={onCancelar} />
    </View>
  );
};

export default FormularioPaciente;
