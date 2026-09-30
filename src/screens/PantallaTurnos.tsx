import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Encabezado from '../components/Encabezado';
import ResumenDelDia from '../components/ResumenDelDia';
import ListaEspecialidades from '../components/ListaEspecialidades';
import ProfesionalCard from '../components/ProfesionalCard';
import Seccion from '../components/Seccion';
import Aviso from '../components/Aviso';
import { centro, especialidades, indicadores, profesionales } from '../data/centro';
import { colores } from '../theme/colores';

const espacioSuperior = Platform.select({ android: 38, ios: 58, default: 30 });

const avisar = (titulo: string, mensaje: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
};

const PantallaTurnos = () => {
  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  const elegirEspecialidad = (id: string) => {
    setSeleccionada((actual) => (actual === id ? null : id));
  };

  const nombreSeleccionada = especialidades.find((item) => item.id === seleccionada)?.nombre;

  const listado = nombreSeleccionada
    ? profesionales.filter((profesional) => profesional.especialidad === nombreSeleccionada)
    : profesionales;

  return (
    <View style={estilos.pantalla}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: espacioSuperior }}>
          <Encabezado
            nombre={centro.nombre}
            sede={centro.sede}
            fecha={centro.fecha}
            logo={require('../../assets/icon.png')}
          />
        </View>

        <ResumenDelDia indicadores={indicadores} />

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
              onPress={() => avisar(profesional.nombre, profesional.consultorio)}
              onElegirHorario={(hora) =>
                avisar('Turno elegido', `${profesional.nombre} a las ${hora}`)
              }
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

export default PantallaTurnos;
