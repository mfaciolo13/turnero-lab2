import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Tema } from '../theme/tema';
import { Atributo } from '../types';
import { ATRIBUTO_NOMBRE, etiquetaDe } from '../utils/ficha';

type Props = {
  atributos: Atributo[];
  onEditar: (atributo: Atributo) => void;
  onBorrar: (atributo: Atributo) => void;
};

const crearEstilos = ({ colores, espacio, radio, fuente }: Tema) =>
  StyleSheet.create({
    tabla: {
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radio.grande,
      marginHorizontal: espacio.grande,
      overflow: 'hidden',
    },
    cabecera: {
      flexDirection: 'row',
      paddingHorizontal: espacio.medio,
      paddingVertical: 10,
      backgroundColor: colores.primarioSuave,
    },
    titulo: { fontSize: fuente.chica, fontWeight: '700', color: colores.primarioOscuro },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: espacio.medio,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colores.borde,
    },
    campo: { flex: 2, fontSize: fuente.normal, fontWeight: '600', color: colores.texto },
    valor: { flex: 3, fontSize: fuente.normal, color: colores.textoSuave },
    acciones: { flexDirection: 'row', width: 64, justifyContent: 'flex-end' },
    accion: { padding: 6 },
    vacio: { padding: espacio.grande, fontSize: fuente.normal, color: colores.textoSuave },
  });

const FichaTabla = ({ atributos, onEditar, onBorrar }: Props) => {
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);

  return (
    <View style={estilos.tabla} testID="ficha-tabla">
      <View style={estilos.cabecera}>
        <Text style={[estilos.titulo, { flex: 2 }]}>Campo</Text>
        <Text style={[estilos.titulo, { flex: 3 }]}>Valor</Text>
        <View style={estilos.acciones} />
      </View>

      {atributos.length === 0 ? (
        <Text style={estilos.vacio}>Todavía no cargaste ningún dato.</Text>
      ) : null}

      {atributos.map((atributo) => (
        <View key={atributo.attribute} style={estilos.fila} testID={`fila-${atributo.attribute}`}>
          <Text style={estilos.campo}>{etiquetaDe(atributo.attribute)}</Text>
          <Text style={estilos.valor}>{atributo.value || '-'}</Text>
          <View style={estilos.acciones}>
            <TouchableOpacity
              style={estilos.accion}
              onPress={() => onEditar(atributo)}
              testID={`editar-${atributo.attribute}`}
            >
              <Ionicons name="create-outline" size={18} color={tema.colores.primario} />
            </TouchableOpacity>
            {atributo.attribute === ATRIBUTO_NOMBRE ? (
              <View style={estilos.accion} />
            ) : (
              <TouchableOpacity
                style={estilos.accion}
                onPress={() => onBorrar(atributo)}
                testID={`borrar-${atributo.attribute}`}
              >
                <Ionicons name="trash-outline" size={18} color={tema.colores.ocupado} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

export default FichaTabla;
