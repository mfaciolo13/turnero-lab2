import { ScrollView, StyleSheet, View } from 'react-native';
import Encabezado from '../components/Encabezado';
import ResumenDelDia from '../components/ResumenDelDia';
import ListaEspecialidades from '../components/ListaEspecialidades';
import ProfesionalCard from '../components/ProfesionalCard';
import Seccion from '../components/Seccion';
import Aviso from '../components/Aviso';
import { centro, especialidades, indicadores, profesionales } from '../data/centro';
import { colores } from '../theme/colores';

const PantallaTurnos = () => (
  <View style={estilos.pantalla}>
    <ScrollView showsVerticalScrollIndicator={false}>
      <Encabezado
        nombre={centro.nombre}
        sede={centro.sede}
        fecha={centro.fecha}
        logo={require('../../assets/icon.png')}
      />

      <ResumenDelDia indicadores={indicadores} />

      <Seccion titulo="Especialidades" detalle="Cupos de hoy">
        <ListaEspecialidades especialidades={especialidades} seleccionada="clinica" />
      </Seccion>

      <Seccion titulo="Profesionales" detalle={`${profesionales.length} en agenda`}>
        {profesionales.map((profesional) => (
          <ProfesionalCard
            key={profesional.id}
            nombre={profesional.nombre}
            especialidad={profesional.especialidad}
            consultorio={profesional.consultorio}
            foto={profesional.foto}
            valoracion={profesional.valoracion}
            cobertura={profesional.cobertura}
            horarios={profesional.horarios}
          />
        ))}
      </Seccion>

      <Aviso
        titulo="Antes de venir"
        mensaje="Presentate 15 minutos antes con DNI y credencial de la obra social. Los turnos se liberan pasados 10 minutos de la hora asignada."
      />
    </ScrollView>
  </View>
);

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
});

export default PantallaTurnos;
