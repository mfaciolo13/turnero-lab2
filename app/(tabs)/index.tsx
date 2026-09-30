import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Encabezado from '../../src/components/Encabezado';
import ResumenDelDia from '../../src/components/ResumenDelDia';
import ListaEspecialidades from '../../src/components/ListaEspecialidades';
import ProfesionalCard from '../../src/components/ProfesionalCard';
import Seccion from '../../src/components/Seccion';
import Aviso from '../../src/components/Aviso';
import { centro, especialidades, indicadores, profesionales } from '../../src/data/centro';
import { colores } from '../../src/theme/colores';

const Agenda = () => {
  const router = useRouter();
  const { especialidad } = useLocalSearchParams<{ especialidad?: string }>();
  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  useEffect(() => {
    if (especialidad) {
      setSeleccionada(especialidad);
    }
  }, [especialidad]);

  const elegirEspecialidad = (id: string) => {
    setSeleccionada((actual) => (actual === id ? null : id));
  };

  const abrirProfesional = (id: number) => {
    router.push({ pathname: '/profesional/[id]', params: { id } });
  };

  const nombreSeleccionada = especialidades.find((item) => item.id === seleccionada)?.nombre;

  const listado = nombreSeleccionada
    ? profesionales.filter((profesional) => profesional.especialidad === nombreSeleccionada)
    : profesionales;

  return (
    <View style={estilos.pantalla}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Encabezado
          nombre={centro.nombre}
          sede={centro.sede}
          fecha={centro.fecha}
          logo={require('../../assets/icon.png')}
        />

        <ResumenDelDia indicadores={indicadores} superpuesto />

        <Seccion titulo="Especialidades" detalle="Tocá para filtrar">
          <ListaEspecialidades
            especialidades={especialidades}
            seleccionada={seleccionada}
            onSeleccionar={elegirEspecialidad}
          />
        </Seccion>

        <Seccion titulo="Profesionales" detalle={`${listado.length} en agenda`}>
          {listado.map((profesional) => (
            <ProfesionalCard
              key={profesional.id}
              nombre={profesional.nombre}
              especialidad={profesional.especialidad}
              consultorio={profesional.consultorio}
              foto={profesional.foto}
              valoracion={profesional.valoracion}
              cobertura={profesional.cobertura}
              horarios={profesional.horarios}
              onPress={() => abrirProfesional(profesional.id)}
              onElegirHorario={() => abrirProfesional(profesional.id)}
            />
          ))}

          {listado.length === 0 ? (
            <Text style={estilos.vacio}>No hay profesionales para esa especialidad.</Text>
          ) : null}
        </Seccion>

        <Aviso
          titulo="Antes de venir"
          mensaje="Presentate 15 minutos antes con DNI y credencial de la obra social. Los turnos se liberan pasados 10 minutos de la hora asignada."
        />
      </ScrollView>
    </View>
  );
};

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  vacio: {
    marginHorizontal: 20,
    fontSize: 13,
    color: colores.textoSuave,
  },
});

export default Agenda;
