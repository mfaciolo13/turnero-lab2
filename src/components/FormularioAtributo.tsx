import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Boton from './Boton';
import { useTheme } from '../theme/ThemeProvider';
import { Tema } from '../theme/tema';
import { SUGERENCIAS, etiquetaDe, normalizarAtributo } from '../utils/ficha';

type Props = {
  campo: string;
  valor: string;
  editando: boolean;
  guardando: boolean;
  onCambiarCampo: (texto: string) => void;
  onCambiarValor: (texto: string) => void;
  onGuardar: () => void;
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
    bloqueado: { opacity: 0.6 },
    sugerencias: { paddingBottom: 12 },
    sugerencia: {
      borderWidth: 1,
      borderColor: colores.primario,
      borderRadius: radio.total,
      paddingVertical: 5,
      paddingHorizontal: 12,
      marginRight: 8,
    },
    sugerenciaTexto: { fontSize: fuente.chica, fontWeight: '600', color: colores.primario },
    espacio: { height: 8 },
  });

const FormularioAtributo = ({
  campo,
  valor,
  editando,
  guardando,
  onCambiarCampo,
  onCambiarValor,
  onGuardar,
  onCancelar,
}: Props) => {
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);
  const incompleto = normalizarAtributo(campo) === '' || valor.trim() === '';

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{editando ? 'Editar dato' : 'Agregar un dato'}</Text>

      {editando ? null : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.sugerencias}
        >
          {SUGERENCIAS.map((sugerencia) => (
            <TouchableOpacity
              key={sugerencia}
              style={estilos.sugerencia}
              onPress={() => onCambiarCampo(etiquetaDe(sugerencia))}
              testID={`sugerencia-${sugerencia}`}
            >
              <Text style={estilos.sugerenciaTexto}>{etiquetaDe(sugerencia)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TextInput
        style={[estilos.input, editando && estilos.bloqueado]}
        value={campo}
        onChangeText={onCambiarCampo}
        editable={!editando}
        placeholder="Campo (ej. Grupo sanguíneo)"
        placeholderTextColor={tema.colores.textoSuave}
        testID="input-campo"
      />
      <TextInput
        style={estilos.input}
        value={valor}
        onChangeText={onCambiarValor}
        placeholder="Valor"
        placeholderTextColor={tema.colores.textoSuave}
        testID="input-valor"
      />

      <Boton
        titulo={editando ? 'Guardar cambios' : 'Agregar dato'}
        icono="save"
        deshabilitado={incompleto || guardando}
        onPress={onGuardar}
        testID="boton-guardar-campo"
      />

      {editando ? (
        <>
          <View style={estilos.espacio} />
          <Boton
            titulo="Cancelar edición"
            variante="secundario"
            onPress={onCancelar}
            testID="boton-cancelar-edicion"
          />
        </>
      ) : null}
    </View>
  );
};

export default FormularioAtributo;
