import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import Encabezado from '../../src/components/Encabezado';
import ResumenDelDia from '../../src/components/ResumenDelDia';
import ListaEspecialidades from '../../src/components/ListaEspecialidades';
import ProfesionalCard from '../../src/components/ProfesionalCard';
import Buscador from '../../src/components/Buscador';
import Seccion from '../../src/components/Seccion';
import Estado from '../../src/components/Estado';
import Aviso from '../../src/components/Aviso';
import { useAcelerometro } from '../../src/hooks/useAcelerometro';
import { useProfesionales, useResumenEspecialidades } from '../../src/hooks/useProfesionales';
import { useIndicadores } from '../../src/hooks/useIndicadores';
import { useDemora } from '../../src/hooks/useDemora';
import { useTurnosStore } from '../../src/store/turnos';
import { centro, especialidades } from '../../src/data/centro';
import { colores } from '../../src/theme/colores';

const Agenda = () => {
  const router = useRouter();
  const { especialidad } = useLocalSearchParams<{ especialidad?: string }>();
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const busquedaDemorada = useDemora(busqueda.trim());

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProfesionales(busquedaDemorada);
  const { disponible } = useAcelerometro({
    onSacudida: () => {
      if (!isRefetching) {
        refetch();
      }
    },
  });
  const resumen = useResumenEspecialidades();
  const indicadores = useIndicadores();
  const reservas = useTurnosStore((state) => state.reservas);

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

  const cargarMas = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const nombreSeleccionada = especialidades.find((item) => item.id === seleccionada)?.nombre;
  const todos = data?.pages.flatMap((pagina) => pagina.profesionales) ?? [];
  const listado = nombreSeleccionada
    ? todos.filter((profesional) => profesional.especialidad === nombreSeleccionada)
    : todos;

  const esMio = (profesionalId: number, hora: string) =>
    reservas.some((reserva) => reserva.profesionalId === profesionalId && reserva.hora === hora);

  const renderVacio = () => {
    if (isLoading) {
      return <Estado tipo="cargando" mensaje="Buscando profesionales..." />;
    }
    if (isError) {
      return (
        <Estado
          tipo="error"
          mensaje="No pudimos traer la agenda. Revisá tu conexión."
          onReintentar={refetch}
        />
      );
    }
    return <Estado tipo="vacio" mensaje="No hay profesionales para esa búsqueda." />;
  };

  return (
    <View style={estilos.pantalla}>
      <FlatList
        data={listado}
        keyExtractor={(profesional) => String(profesional.id)}
        showsVerticalScrollIndicator={false}
        onEndReached={cargarMas}
        onEndReachedThreshold={0.4}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={refetch}
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
                especialidades={resumen.data ?? especialidades}
                seleccionada={seleccionada}
                onSeleccionar={elegirEspecialidad}
              />
            </Seccion>

            <Seccion
              titulo="Profesionales"
              detalle={`${listado.length} cargados${disponible ? ' · agitá para actualizar' : ''}`}
            >
              <Buscador
                valor={busqueda}
                onCambiar={setBusqueda}
                placeholder="Buscar por nombre o apellido"
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
            horarios={item.horarios.map((horario) => ({
              ...horario,
              ocupado: horario.ocupado || esMio(item.id, horario.hora),
            }))}
            onPress={() => abrirProfesional(item.id)}
            onElegirHorario={() => abrirProfesional(item.id)}
          />
        )}
        ListEmptyComponent={renderVacio}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator style={estilos.cargandoMas} color={colores.primario} />
          ) : !hasNextPage && todos.length > 0 ? (
            <Aviso
              titulo="Antes de venir"
              mensaje="Presentate 15 minutos antes con DNI y credencial de la obra social. Los turnos se liberan pasados 10 minutos de la hora asignada."
            />
          ) : null
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
  cargandoMas: {
    marginVertical: 20,
  },
});

export default Agenda;
