import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Boton from '../../src/components/Boton';
import Estado from '../../src/components/Estado';
import FichaTabla from '../../src/components/FichaTabla';
import FormularioAtributo from '../../src/components/FormularioAtributo';
import FormularioPaciente from '../../src/components/FormularioPaciente';
import SelectorPacientes from '../../src/components/SelectorPacientes';
import {
  useAtributos,
  useBorrarAtributo,
  useBorrarPaciente,
  useCrearPaciente,
  useGuardarAtributo,
  usePacientes,
} from '../../src/hooks/useFicha';
import { useTurnosStore } from '../../src/store/turnos';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Tema } from '../../src/theme/tema';
import { confirmar } from '../../src/utils/dialogos';
import { PACIENTE_TITULAR, etiquetaDe, normalizarAtributo } from '../../src/utils/ficha';
import { Atributo } from '../../src/types';

const crearEstilos = ({ colores, espacio, fuente }: Tema) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: colores.fondo },
    contenido: { paddingVertical: espacio.grande, paddingBottom: 32 },
    bajada: {
      fontSize: fuente.normal - 1,
      color: colores.textoSuave,
      marginHorizontal: espacio.grande,
      marginBottom: espacio.medio,
      lineHeight: 19,
    },
    seccion: {
      fontSize: fuente.titulo,
      fontWeight: '700',
      color: colores.texto,
      marginHorizontal: espacio.grande,
      marginTop: 24,
      marginBottom: 12,
    },
    espacio: { height: espacio.medio },
    borrar: { marginHorizontal: espacio.grande, marginTop: espacio.grande },
  });

const Ficha = () => {
  const tema = useTheme();
  const estilos = useMemo(() => crearEstilos(tema), [tema]);
  const pacienteActivo = useTurnosStore((state) => state.pacienteActivo);
  const seleccionarPaciente = useTurnosStore((state) => state.seleccionarPaciente);

  const [campo, setCampo] = useState('');
  const [valor, setValor] = useState('');
  const [editando, setEditando] = useState(false);
  const [agregandoFamiliar, setAgregandoFamiliar] = useState(false);

  const pacientes = usePacientes();
  const atributos = useAtributos(pacienteActivo);
  const guardar = useGuardarAtributo();
  const quitar = useBorrarAtributo();
  const crear = useCrearPaciente();
  const eliminar = useBorrarPaciente();

  const paciente = pacientes.data?.find((item) => item.id === pacienteActivo);

  const limpiarFormulario = () => {
    setCampo('');
    setValor('');
    setEditando(false);
  };

  const elegirPaciente = (id: number) => {
    seleccionarPaciente(id);
    limpiarFormulario();
  };

  const guardarDato = () => {
    guardar.mutate(
      { id: pacienteActivo, atributo: normalizarAtributo(campo), valor: valor.trim() },
      { onSuccess: limpiarFormulario },
    );
  };

  const editarDato = (atributo: Atributo) => {
    setCampo(etiquetaDe(atributo.attribute));
    setValor(atributo.value ?? '');
    setEditando(true);
  };

  const borrarDato = (atributo: Atributo) => {
    confirmar('Borrar dato', `¿Querés borrar "${etiquetaDe(atributo.attribute)}"?`, () =>
      quitar.mutate({ id: pacienteActivo, atributo: atributo.attribute }),
    );
  };

  const crearFamiliar = (nombre: string, parentesco: string) => {
    crear.mutate(
      { nombre, parentesco },
      {
        onSuccess: (id) => {
          setAgregandoFamiliar(false);
          elegirPaciente(id);
        },
      },
    );
  };

  const borrarFamiliar = () => {
    confirmar(
      'Borrar familiar',
      `Se borra la ficha de ${paciente?.nombre} y sus turnos reservados.`,
      () => eliminar.mutate(pacienteActivo, { onSuccess: () => elegirPaciente(PACIENTE_TITULAR) }),
    );
  };

  if (pacientes.isLoading) {
    return (
      <View style={estilos.pantalla}>
        <Estado tipo="cargando" mensaje="Abriendo la ficha..." />
      </View>
    );
  }

  if (pacientes.isError || !pacientes.data) {
    return (
      <View style={estilos.pantalla}>
        <Estado
          tipo="error"
          mensaje="No pudimos abrir los datos guardados en el dispositivo."
          onReintentar={() => pacientes.refetch()}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={estilos.pantalla} edges={['bottom']}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <Text style={estilos.bajada}>
          Cargá los datos de cada paciente. Los turnos que reserves van a nombre de la persona
          seleccionada.
        </Text>

        <SelectorPacientes
          pacientes={pacientes.data}
          seleccionado={pacienteActivo}
          onSeleccionar={elegirPaciente}
          onAgregar={() => setAgregandoFamiliar(true)}
        />

        {agregandoFamiliar ? (
          <FormularioPaciente
            guardando={crear.isPending}
            onCrear={crearFamiliar}
            onCancelar={() => setAgregandoFamiliar(false)}
          />
        ) : null}

        <Text style={estilos.seccion}>Ficha de {paciente?.nombre ?? 'paciente'}</Text>
        <FichaTabla atributos={atributos.data ?? []} onEditar={editarDato} onBorrar={borrarDato} />

        <View style={estilos.espacio} />

        <FormularioAtributo
          campo={campo}
          valor={valor}
          editando={editando}
          guardando={guardar.isPending}
          onCambiarCampo={setCampo}
          onCambiarValor={setValor}
          onGuardar={guardarDato}
          onCancelar={limpiarFormulario}
        />

        {pacienteActivo !== PACIENTE_TITULAR ? (
          <View style={estilos.borrar}>
            <Boton
              titulo="Borrar este familiar"
              icono="trash-outline"
              variante="peligro"
              onPress={borrarFamiliar}
              testID="boton-borrar-familiar"
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Ficha;
