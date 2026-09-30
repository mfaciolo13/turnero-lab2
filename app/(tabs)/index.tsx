import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Encabezado from '../../src/components/Encabezado';
import ResumenDelDia from '../../src/components/ResumenDelDia';
import ListaEspecialidades from '../../src/components/ListaEspecialidades';
import ProfesionalCard from '../../src/components/ProfesionalCard';
import Buscador from '../../src/components/Buscador';
import Seccion from '../../src/components/Seccion';
import Aviso from '../../src/components/Aviso';
import { centro, especialidades, indicadores, profesionales } from '../../src/data/centro';
import { colores } from '../../src/theme/colores';

const Agenda = () => {
  const router = useRouter();
  const { especialidad } = useLocalSearchParams<{ especialidad?: string }>();
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

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
  const texto = busqueda.trim().toLowerCase();

  const listado = profesionales
    .filter((profesional) =>
      nombreSeleccionada ? profesional.especialidad === nombreSeleccionada : true,
    )
    .filter((profesional) =>
      texto.length === 0
        ? true
        : profesional.nombre.toLowerCase().includes(texto) ||
          profesional.especialidad.toLowerCase().includes(texto),
    );

  return (
    <View style={estilos.pantalla}>
      <FlatList
        data={listado}
        keyExtractor={(profesional) => String(profesional.id)}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
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
              <Buscador
                valor={busqueda}
                onCambiar={setBusqueda}
                placeholder="Buscar por nombre o especialidad"
              />
              <View style={estilos.espacio} />
            </Seccion>
          </View>
        }
        renderItem={({ item }) => (
          <ProfesionalCard
            nombre={item.nombre}
            especialidad={item.especialidad}
            consultorio={item.consultorio}
            foto={item.foto}
            valoracion={item.valoracion}
            cobertura={item.cobertura}
            horarios={item.horarios}
            onPress={() => abrirProfesional(item.id)}
            onElegirHorario={() => abrirProfesional(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={estilos.vacio}>No hay profesionales para esa búsqueda.</Text>
        }
        ListFooterComponent={
          <Aviso
            titulo="Antes de venir"
            mensaje="Presentate 15 minutos antes con DNI y credencial de la obra social. Los turnos se liberan pasados 10 minutos de la hora asignada."
          />
        }
      />
    </View>
  );
};

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  espacio: {
    height: 14,
  },
  vacio: {
    marginHorizontal: 20,
    fontSize: 13,
    color: colores.textoSuave,
  },
});

export default Agenda;
